use crate::assets::{self, AssetServer};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::collections::{BTreeMap, BTreeSet};
use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddr, TcpStream};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};
use tungstenite::{Message, WebSocket};

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct ElementBounds {
    pub id: String,
    pub label: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub parent_scale: f32,
    pub parent_scale_y: f32,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct ViewInfo {
    pub width: f32,
    pub height: f32,
    pub elements: Vec<ElementBounds>,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct BridgeStatus {
    pub error: String,
    pub views: Vec<ViewInfo>,
}

pub fn ticks() -> u64 {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetTickCount64() -> u64;
    }
    unsafe { GetTickCount64() }
}

pub fn owned_ports(pid: u32) -> Vec<u16> {
    #[link(name = "iphlpapi")]
    unsafe extern "system" {
        fn GetExtendedTcpTable(
            table: *mut std::ffi::c_void,
            size: *mut u32,
            order: i32,
            family: u32,
            class: u32,
            reserved: u32,
        ) -> u32;
    }
    let mut size = 0_u32;
    if unsafe { GetExtendedTcpTable(std::ptr::null_mut(), &mut size, 0, 2, 3, 0) } != 122
        || !(4..=16_777_216).contains(&size)
    {
        return Vec::new();
    }
    let mut memory = vec![0_u8; size as usize];
    if unsafe { GetExtendedTcpTable(memory.as_mut_ptr().cast(), &mut size, 0, 2, 3, 0) } != 0 {
        return Vec::new();
    }
    let Some(head) = memory.get(..4) else {
        return Vec::new();
    };
    let count = u32::from_ne_bytes(head.try_into().unwrap()) as usize;
    let mut ports = BTreeSet::new();
    for row in memory[4..].as_chunks::<24>().0.iter().take(count) {
        let owner = u32::from_ne_bytes(row[20..24].try_into().unwrap());
        if owner == pid {
            ports.insert(u16::from_be(
                u32::from_ne_bytes(row[8..12].try_into().unwrap()) as u16,
            ));
        }
    }
    let mut output: Vec<_> = ports.into_iter().collect();
    if let Some(index) = output.iter().position(|v| *v == 9444) {
        output[..=index].rotate_right(1);
    }
    output
}

pub fn http_get(port: u16, path: &str) -> Result<String, String> {
    if !path.starts_with('/') || path.contains(['\r', '\n']) {
        return Err("Invalid inspector HTTP path".into());
    }
    let mut socket = TcpStream::connect_timeout(
        &SocketAddr::from((Ipv4Addr::LOCALHOST, port)),
        Duration::from_millis(450),
    )
    .map_err(|e| e.to_string())?;
    socket
        .set_read_timeout(Some(Duration::from_millis(1000)))
        .map_err(|e| e.to_string())?;
    socket
        .set_write_timeout(Some(Duration::from_millis(1000)))
        .map_err(|e| e.to_string())?;
    socket
        .write_all(
            format!("GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nConnection: close\r\n\r\n")
                .as_bytes(),
        )
        .map_err(|e| e.to_string())?;
    let mut data = Vec::new();
    let mut buffer = [0_u8; 16384];
    let mut body_offset = None;
    let mut length = None;
    let mut chunked = false;
    loop {
        match socket.read(&mut buffer) {
            Ok(0) => break,
            Ok(n) => data.extend_from_slice(&buffer[..n]),
            Err(e) => return Err(e.to_string()),
        }
        if data.len() > 8_388_608 {
            return Err("Inspector response exceeds 8 MiB".into());
        }
        if body_offset.is_none()
            && let Some(offset) = data.windows(4).position(|v| v == b"\r\n\r\n")
        {
            let headers = String::from_utf8_lossy(&data[..offset]);
            if headers.split_whitespace().nth(1) != Some("200") {
                return Err(format!(
                    "Inspector HTTP: {}",
                    headers.lines().next().unwrap_or("invalid response")
                ));
            }
            for line in headers.lines().skip(1) {
                if let Some((key, value)) = line.split_once(':') {
                    if key.eq_ignore_ascii_case("content-length") {
                        length = value.trim().parse::<usize>().ok();
                    }
                    if key.eq_ignore_ascii_case("transfer-encoding") {
                        chunked = value.to_lowercase().contains("chunked");
                    }
                }
            }
            body_offset = Some(offset + 4);
        }
        if let Some(offset) = body_offset
            && (length.is_some_and(|n| data.len() - offset >= n)
                || (chunked && data.ends_with(b"\r\n0\r\n\r\n")))
        {
            break;
        }
    }
    let offset = body_offset.ok_or("Invalid inspector HTTP response")?;
    let mut body = &data[offset..];
    let result = if chunked {
        let mut decoded = Vec::new();
        loop {
            let end = body
                .windows(2)
                .position(|v| v == b"\r\n")
                .ok_or("Invalid HTTP chunk")?;
            let size = usize::from_str_radix(
                std::str::from_utf8(&body[..end])
                    .map_err(|e| e.to_string())?
                    .split(';')
                    .next()
                    .unwrap_or(""),
                16,
            )
            .map_err(|e| e.to_string())?;
            if size == 0 {
                break;
            }
            let chunk = body
                .get(end + 2..end + 2 + size)
                .ok_or("Truncated HTTP chunk")?;
            decoded.extend_from_slice(chunk);
            body = body
                .get(end + 2 + size + 2..)
                .ok_or("Truncated HTTP chunk")?;
        }
        decoded
    } else {
        if length.is_some_and(|n| body.len() < n) {
            return Err("Truncated inspector HTTP response".into());
        }
        body[..length.unwrap_or(body.len())].to_vec()
    };
    String::from_utf8(result).map_err(|e| e.to_string())
}

struct Channel {
    socket: WebSocket<TcpStream>,
    sequence: u64,
    registered_fonts: BTreeSet<usize>,
    configuration: String,
}

impl Channel {
    fn new(port: u16, id: &str) -> Result<Self, String> {
        if id.is_empty() || id.len() > 128 {
            return Err("Invalid inspector view ID".into());
        }
        let encoded: String = id
            .bytes()
            .map(|c| {
                if c.is_ascii_alphanumeric() || c == b'-' || c == b'_' {
                    char::from(c).to_string()
                } else {
                    format!("%{c:02X}")
                }
            })
            .collect();
        let stream = TcpStream::connect_timeout(
            &SocketAddr::from((Ipv4Addr::LOCALHOST, port)),
            Duration::from_millis(1000),
        )
        .map_err(|e| e.to_string())?;
        stream.set_nodelay(true).map_err(|e| e.to_string())?;
        stream
            .set_read_timeout(Some(Duration::from_millis(1500)))
            .map_err(|e| e.to_string())?;
        stream
            .set_write_timeout(Some(Duration::from_millis(1500)))
            .map_err(|e| e.to_string())?;
        let (socket, _) = tungstenite::client(
            format!("ws://127.0.0.1:{port}/devtools/page/{encoded}"),
            stream,
        )
        .map_err(|e| e.to_string())?;
        Ok(Self {
            socket,
            sequence: 0,
            registered_fonts: BTreeSet::new(),
            configuration: String::new(),
        })
    }

    fn call(
        &mut self,
        method: &str,
        params: Value,
        cancelled: &AtomicBool,
    ) -> Result<Value, String> {
        if cancelled.load(Ordering::Acquire) {
            return Err("Inspector command cancelled".into());
        }
        self.sequence = self.sequence.wrapping_add(1);
        let sequence = self.sequence;
        let request = json!({"id": sequence, "method": method, "params": params}).to_string();
        if request.len() > 16_777_216 {
            return Err("Inspector command exceeds 16 MiB".into());
        }
        self.socket
            .send(Message::Text(request.into()))
            .map_err(|e| e.to_string())?;
        let deadline = Instant::now() + Duration::from_secs(5);
        loop {
            if cancelled.load(Ordering::Acquire) {
                return Err("Inspector command cancelled".into());
            }
            if Instant::now() >= deadline {
                return Err("Inspector command timeout".into());
            }
            let message = match self.socket.read() {
                Ok(message) => message,
                Err(tungstenite::Error::Io(error))
                    if matches!(
                        error.kind(),
                        std::io::ErrorKind::WouldBlock
                            | std::io::ErrorKind::TimedOut
                            | std::io::ErrorKind::Interrupted
                    ) =>
                {
                    continue;
                }
                Err(error) => return Err(error.to_string()),
            };
            let text = match message {
                Message::Text(text) => text.to_string(),
                Message::Binary(bytes) => {
                    String::from_utf8(bytes.to_vec()).map_err(|e| e.to_string())?
                }
                Message::Close(_) => return Err("Inspector disconnected".into()),
                _ => continue,
            };
            if text.len() > 16_777_216 {
                return Err("Inspector response exceeds 16 MiB".into());
            }
            let response: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
            if response["id"].as_u64() != Some(sequence) {
                continue;
            }
            if let Some(error) = response.get("error") {
                return Err(error["message"]
                    .as_str()
                    .unwrap_or("Inspector error")
                    .into());
            }
            return Ok(response["result"].clone());
        }
    }

    fn evaluate(&mut self, expression: &str, cancelled: &AtomicBool) -> Result<Value, String> {
        let response = self.call(
            "Runtime.evaluate",
            json!({"expression": expression, "returnByValue": true}),
            cancelled,
        )?;
        if let Some(details) = response.get("exceptionDetails") {
            return Err(details["exception"]["description"]
                .as_str()
                .or_else(|| details["text"].as_str())
                .unwrap_or("UI script failed")
                .into());
        }
        Ok(response["result"]
            .get("value")
            .filter(|v| v.is_object())
            .cloned()
            .unwrap_or_else(|| json!({})))
    }
}

pub struct Bridge {
    pid: u32,
    state: BridgeStatus,
    channels: BTreeMap<String, Channel>,
    fonts: BTreeMap<usize, String>,
    assets: AssetServer,
    rediscover: bool,
    cancelled: Arc<AtomicBool>,
    last_discovery: u64,
    last_poll: u64,
    revision: u64,
    port: u16,
    template_base: String,
    template_overrides: Vec<String>,
    overlay_sequence: u64,
    overlay_frames: BTreeMap<String, String>,
    overlay_layers: BTreeMap<usize, (Vec<u8>, String)>,
    overlay_layout: String,
}

impl Bridge {
    pub fn new(pid: u32) -> Self {
        Self {
            pid,
            state: BridgeStatus::default(),
            channels: BTreeMap::new(),
            fonts: BTreeMap::new(),
            assets: AssetServer::new(),
            rediscover: true,
            cancelled: Arc::new(AtomicBool::new(false)),
            last_discovery: 0,
            last_poll: 0,
            revision: 0,
            port: 0,
            template_base: String::new(),
            template_overrides: Vec::new(),
            overlay_sequence: 0,
            overlay_frames: BTreeMap::new(),
            overlay_layers: BTreeMap::new(),
            overlay_layout: String::new(),
        }
    }

    pub fn status(&self) -> BridgeStatus {
        self.state.clone()
    }
    pub fn refresh(&mut self) {
        self.rediscover = true;
    }
    pub fn tick(&mut self, config: &Value, revision: u64) {
        if self.cancelled.load(Ordering::Acquire) {
            return;
        }
        let now = ticks();
        if now.saturating_sub(self.last_poll) < 33 && self.revision == revision && !self.rediscover
        {
            return;
        }
        self.last_poll = now;
        self.revision = revision;
        if let Err(error) = self.update(config, now) {
            if self.cancelled.load(Ordering::Acquire) {
                return;
            }
            self.channels.clear();
            self.port = 0;
            self.state = BridgeStatus {
                error,
                ..Default::default()
            };
        }
    }

    fn update(&mut self, config: &Value, now: u64) -> Result<(), String> {
        if self.rediscover || self.port == 0 || now.saturating_sub(self.last_discovery) >= 3000 {
            self.rediscover = false;
            self.last_discovery = now;
            let ports = owned_ports(self.pid);
            if !ports.contains(&self.port) {
                self.channels.clear();
                self.port = 0;
            }
            if self.port == 0 {
                for port in ports {
                    if let Ok(response) = http_get(port, "/json/list") {
                        let gameface_targets = serde_json::from_str::<Value>(&response)
                            .ok()
                            .is_some_and(|targets| {
                                targets.as_array().is_some_and(|targets| {
                                    targets.iter().any(|target| {
                                        target["url"]
                                            .as_str()
                                            .is_some_and(|url| url.starts_with("coui://"))
                                            && target["id"]
                                                .as_str()
                                                .is_some_and(|id| !id.is_empty())
                                    })
                                })
                            });
                        if gameface_targets {
                            self.port = port;
                            break;
                        }
                    }
                    if let Ok(response) = http_get(port, "/json/version")
                        && serde_json::from_str::<Value>(&response)
                            .ok()
                            .and_then(|v| v["Browser"].as_str().map(|s| s.starts_with("Cohtml/")))
                            .unwrap_or(false)
                    {
                        self.port = port;
                        break;
                    }
                }
            }
            if self.port == 0 {
                return Err("В процессе игры не найден инспектор Gameface. Включите отладчик интерфейса клиента.".into());
            }
            let targets: Value = serde_json::from_str(&http_get(self.port, "/json/list")?)
                .map_err(|e| e.to_string())?;
            let targets = targets
                .as_array()
                .ok_or("Inspector target list is invalid")?;
            let mut current = BTreeSet::new();
            for target in targets {
                let url = target["url"].as_str().unwrap_or("");
                if !url.starts_with("coui://") {
                    continue;
                }
                let Some(id) = target["id"].as_str() else {
                    continue;
                };
                current.insert(id.to_string());
                if !self.channels.contains_key(id) {
                    self.channels
                        .insert(id.to_string(), Channel::new(self.port, id)?);
                }
            }
            self.channels.retain(|id, _| current.contains(id));
            if self.channels.is_empty() {
                return Err(
                    "Инспектор Gameface работает, игровые интерфейсы ещё не загружены".into(),
                );
            }
        }
        let mut browser_config = json!({"widgets":config["widgets"],"layouts":config["layouts"]});
        if !browser_config["widgets"].is_object() {
            browser_config["widgets"] = json!({});
        }
        let widgets = browser_config["widgets"]
            .as_object_mut()
            .ok_or("Invalid widget configuration")?;
        widgets.insert("nativeDpi".into(), json!(1));
        let widgets_json = Value::Object(widgets.clone()).to_string();
        let configuration = browser_config.to_string();
        let mut wanted = BTreeSet::new();
        for group in ["chat", "clock"] {
            let widget = &config["widgets"][group];
            if widget["enabled"].as_bool().unwrap_or(false) {
                wanted.insert(widget["font"].as_f64().unwrap_or(0.0) as usize);
            }
        }
        let mut views = Vec::new();
        for view in self.channels.values_mut() {
            let changed = view.configuration != configuration;
            let mut response = view.evaluate(
                "(window.__oldDialogsHassle?window.__oldDialogsHassle.status():null)",
                &self.cancelled,
            )?;
            if changed || response["version"].as_u64() != Some(13) {
                if response["version"].as_u64() != Some(13) {
                    view.registered_fonts.clear();
                    view.evaluate(&format!("(function(){{const api={};const hud={};const layout={};return api.status();}})()", assets::RUNTIME, assets::HUD, assets::LAYOUT), &self.cancelled)?;
                }
                for family in &wanted {
                    if view.registered_fonts.contains(family) {
                        continue;
                    }
                    if !self.fonts.contains_key(family) {
                        let mut css = String::new();
                        for (weight, bold) in [(400, false), (700, true)] {
                            let url = self.assets.publish(
                                &format!("fonts/{family}/{}.ttf", usize::from(bold)),
                                assets::font_bytes(*family, bold)?,
                                "font/ttf",
                            )?;
                            css.push_str(&format!("@font-face{{font-family:OldDialogsLocal{family};font-style:normal;font-weight:{weight};src:url(\"{url}\") format(\"truetype\");}}"));
                        }
                        self.fonts.insert(*family, css);
                    }
                    let css = &self.fonts[family];
                    view.evaluate(
                        &format!(
                            "window.__oldDialogsHassle.fontChunk({family},{},true,true)",
                            json!(css)
                        ),
                        &self.cancelled,
                    )?;
                    view.registered_fonts.insert(*family);
                }
                response = view.evaluate(&format!("(function(){{window.__oldDialogsHud.configure({widgets_json});window.__oldDialogsLayout.configure({},1);return window.__oldDialogsHassle.status();}})()", browser_config["layouts"]), &self.cancelled)?;
                view.configuration = configuration.clone();
            }
            views.push(read_status(&response));
        }
        self.state = BridgeStatus {
            error: String::new(),
            views,
        };
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), String> {
        self.cancelled.store(false, Ordering::Release);
        let mut errors = Vec::new();
        for view in self.channels.values_mut() {
            if let Err(error) = view.evaluate("(function(){const errors=[];for(const name of ['__hassleStudioOverlay','__hassleTemplate','__oldDialogsHassle','__oldDialogsHud','__oldDialogsLayout']){try{if(window[name])window[name].shutdown();}catch(error){errors.push(name+': '+String(error));}}if(errors.length)throw new Error(errors.join('\\n'));return {};})()", &self.cancelled) { errors.push(error); }
            let _ = view.socket.close(None);
        }
        self.channels.clear();
        self.assets.stop();
        self.fonts.clear();
        self.port = 0;
        self.template_base.clear();
        self.template_overrides.clear();
        self.overlay_frames.clear();
        self.overlay_layers.clear();
        self.overlay_layout.clear();
        self.state = BridgeStatus::default();
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors.join("\n"))
        }
    }

    pub fn evaluate(&mut self, script: &str) -> Result<Value, String> {
        self.channels
            .values_mut()
            .next()
            .ok_or("Интерфейс Hassle ещё не подключён")?
            .evaluate(script, &self.cancelled)
    }

    pub fn configure_template(&mut self, config: &Value) -> Result<Value, String> {
        if self.template_base.is_empty() {
            let mut base = String::new();
            for (name, bytes) in crate::templates::FILES {
                if name.starts_with("fonts/")
                    || name.starts_with("oneas-img/")
                    || name.starts_with("images/")
                {
                    let url = self.assets.publish(
                        name,
                        Arc::new(bytes.to_vec()),
                        crate::templates::mime(name),
                    )?;
                    if base.is_empty() {
                        base = url
                            .strip_suffix(name)
                            .ok_or("Embedded resource URL")?
                            .to_owned();
                    }
                }
            }
            self.template_base = base;
        }
        let id = config["template"].as_str().ok_or("Не выбран шаблон")?;
        if !crate::templates::catalog().iter().any(|item| item.id == id) {
            return Err("Неизвестный шаблон".into());
        }
        let mut overrides = Vec::new();
        let mut published = Vec::new();
        let mut decoded = Vec::new();
        for (path, source) in config["imageOverrides"].as_object().into_iter().flatten() {
            if !crate::images::valid_path(path) {
                return Err("Некорректный путь изображения".into());
            }
            let (bytes, mime) =
                crate::images::decode(source.as_str().ok_or("Некорректное изображение")?)?;
            decoded.push((path, bytes, mime));
        }
        for (index, (path, bytes, mime)) in decoded.into_iter().enumerate() {
            self.overlay_sequence = self.overlay_sequence.wrapping_add(1);
            let name = format!("overrides/{}/{index}", self.overlay_sequence);
            let url = self.assets.publish(&name, Arc::new(bytes), mime)?;
            overrides.push((format!("{}{path}", self.template_base), url));
            published.push(name);
        }
        let result = (|| {
            let (script, css) = {
                let script = crate::templates::file(&format!("{id}/hud.js"))
                    .ok_or("Отсутствует JS шаблона")?;
                let css = crate::templates::file(&format!("{id}/theme.css"))
                    .ok_or("Отсутствует CSS шаблона")?;
                let rewrite = |bytes: &[u8]| {
                    let mut text = String::from_utf8_lossy(bytes)
                        .replace("./oneas-img/", &format!("{}oneas-img/", self.template_base))
                        .replace("./fonts/", &format!("{}fonts/", self.template_base))
                        .replace(
                            "\"oneas-img/",
                            &format!("\"{}oneas-img/", self.template_base),
                        )
                        .replace("'oneas-img/", &format!("'{}oneas-img/", self.template_base))
                        .replace("`oneas-img/", &format!("`{}oneas-img/", self.template_base))
                        .replace("(oneas-img/", &format!("({}oneas-img/", self.template_base))
                        .replace("\"fonts/", &format!("\"{}fonts/", self.template_base))
                        .replace("'fonts/", &format!("'{}fonts/", self.template_base))
                        .replace("`fonts/", &format!("`{}fonts/", self.template_base))
                        .replace("(fonts/", &format!("({}fonts/", self.template_base));
                    for prefix in ["\"", "'", "`", "("] {
                        text = text.replace(
                            &format!("{prefix}images/"),
                            &format!("{prefix}{}images/", self.template_base),
                        );
                        text = text.replace(
                            &format!("{prefix}./images/"),
                            &format!("{prefix}{}images/", self.template_base),
                        );
                    }
                    for (original, replacement) in &overrides {
                        text = text.replace(original, replacement);
                    }
                    text
                };
                let css = crate::templates::font_fallback(&rewrite(css), &self.template_base);
                (rewrite(script), css)
            };
            self.evaluate(include_str!("../assets/template_runtime.js"))?;
            let resource_map: BTreeMap<_, _> = overrides.iter().cloned().collect();
            self.evaluate(&format!(
                "window.__hassleTemplate.resources({})",
                json!(resource_map)
            ))?;
            self.evaluate("(function(){if(window.__oldDialogsLayout)window.__oldDialogsLayout.reset();return {};})()")?;
            for (kind, text) in [("script", script.as_str()), ("css", css.as_str())] {
                let characters: Vec<char> = text.chars().collect();
                if characters.is_empty() {
                    self.evaluate(&format!(
                        "window.__hassleTemplate.upload({},\"\",true)",
                        json!(kind)
                    ))?;
                }
                for (index, chunk) in characters.chunks(6000).enumerate() {
                    self.evaluate(&format!(
                        "window.__hassleTemplate.upload({},{},{})",
                        json!(kind),
                        json!(chunk.iter().collect::<String>()),
                        index == 0
                    ))?;
                }
            }
            let result = self.evaluate(&format!(
                "window.__hassleTemplate.configureUploaded({},{})",
                json!(id),
                config
                    .get("templateOptions")
                    .cloned()
                    .unwrap_or_else(|| json!({}))
            ))?;
            self.evaluate(&format!("(function(){{if(window.__oldDialogsHud)window.__oldDialogsHud.configure({});if(window.__oldDialogsLayout)window.__oldDialogsLayout.configure({},1);return {{}};}})()", config["widgets"], config["layouts"]))?;
            Ok(result)
        })();
        if result.is_err() {
            for name in published {
                self.assets.remove(&name);
            }
            return result;
        }
        for name in self.template_overrides.drain(..) {
            self.assets.remove(&name);
        }
        self.template_overrides = published;
        result
    }

    pub fn template_status(&mut self) -> Result<Value, String> {
        self.evaluate("(window.__hassleTemplate?window.__hassleTemplate.status():{})")
    }

    pub fn template_action(&mut self, index: usize, value: &Value) -> Result<Value, String> {
        self.evaluate(&format!("window.__hassleTemplate.action({index},{value})"))
    }

    pub fn compose(
        &mut self,
        layers: &[crate::compositor::FrameLayer],
        width: u32,
        height: u32,
        refresh: bool,
    ) -> Result<bool, String> {
        let mut items = Vec::new();
        for layer in layers {
            let changed = self
                .overlay_layers
                .get(&layer.index)
                .is_none_or(|(png, _)| *png != layer.png);
            if changed {
                self.overlay_sequence = self.overlay_sequence.wrapping_add(1);
                let name = format!("overlay/{}.png", self.overlay_sequence);
                let url = self
                    .assets
                    .publish(&name, Arc::new(layer.png.clone()), "image/png")?;
                self.overlay_frames.insert(url.clone(), name);
                self.overlay_layers
                    .insert(layer.index, (layer.png.clone(), url));
            }
            let url = &self.overlay_layers[&layer.index].1;
            items.push(json!({"url":url,"x":layer.position[0],"y":layer.position[1],"width":layer.size[0],"height":layer.size[1],"clip":layer.clip}));
        }
        self.overlay_layers
            .retain(|index, _| layers.iter().any(|layer| layer.index == *index));
        let layout = serde_json::to_string(&json!([items, width, height]))
            .map_err(|error| error.to_string())?;
        if layout == self.overlay_layout && !refresh {
            return Ok(false);
        }
        let status = self.evaluate(&format!("(function(){{const api=window.__hassleStudioOverlay||{};return api.layers({},{width},{height});}})()", include_str!("../assets/overlay.js"), json!(items)))?;
        self.overlay_layout = layout;
        let mut retained: BTreeSet<String> = status["retained"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|value| value.as_str().map(str::to_owned))
            .collect();
        for (_, url) in self.overlay_layers.values() {
            retained.insert(url.clone());
        }
        self.overlay_frames.retain(|url, name| {
            if retained.contains(url) {
                true
            } else {
                self.assets.remove(name);
                false
            }
        });
        Ok(true)
    }

    pub fn viewport(&mut self) -> Result<[u32; 2], String> {
        let value = self.evaluate("({width:innerWidth,height:innerHeight})")?;
        Ok([
            value["width"].as_u64().unwrap_or(1920) as u32,
            value["height"].as_u64().unwrap_or(1080) as u32,
        ])
    }
}

impl Drop for Bridge {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}

fn number(value: &Value, key: &str) -> f32 {
    value[key].as_f64().filter(|v| v.is_finite()).unwrap_or(0.0) as f32
}

fn read_status(data: &Value) -> ViewInfo {
    ViewInfo {
        width: number(&data["layout"], "width"),
        height: number(&data["layout"], "height"),
        elements: data["layout"]["elements"]
            .as_array()
            .into_iter()
            .flatten()
            .take(256)
            .map(|v| ElementBounds {
                id: v["id"].as_str().unwrap_or("").into(),
                label: v["label"].as_str().unwrap_or("").into(),
                x: number(v, "x"),
                y: number(v, "y"),
                width: number(v, "width"),
                height: number(v, "height"),
                parent_scale: v["parentScale"].as_f64().unwrap_or(1.0).max(0.001) as f32,
                parent_scale_y: v["parentScaleY"].as_f64().unwrap_or(1.0).max(0.001) as f32,
            })
            .collect(),
    }
}
