use serde_json::{Value, json};
use std::collections::BTreeMap;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

#[derive(Clone, Debug)]
pub struct Config {
    pub data: Value,
    pub font_names: Vec<String>,
    pub saved_templates: BTreeMap<String, Value>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            data: json!({
                "version": 1, "template": "11-happy-new-year-free", "templateOptions": {},
                "layouts": {}, "imageOverrides": {}, "menuKey": 45,
                "widgets": {
                    "chat": {"enabled":false,"font":0,"bold":true,"lines":10,"size":16.0,"lineHeight":24.0,"width":1100.0,"x":32.0,"y":32.0,"outline":1.0,"opacity":1.0,"outlineColor":[0.0,0.0,0.0,1.0]},
                    "clock": {"enabled":true,"seconds":true,"milliseconds":false,"format24":true,"date":true,"standalone":false,"font":3,"bold":true,"size":22.0,"x":32.0,"y":300.0,"color":[1.0,1.0,1.0,1.0]}
                }
            }),
            font_names: crate::assets::font_names(),
            saved_templates: BTreeMap::new(),
        }
    }
}

impl Config {
    pub fn load(root: &Path) -> Result<Self, String> {
        let mut result = Self::default();
        let path = root.join("init.ini");
        if !path.is_file() {
            return Ok(result);
        }
        if fs::metadata(&path).map_err(|e| e.to_string())?.len() > 67_108_864 {
            return Err("init.ini превышает 64 МиБ".into());
        }
        let text = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let mut active = result.template_id().to_owned();
        for line in text.lines() {
            if let Some(value) = line.strip_prefix("active=") {
                active = serde_json::from_str(value).map_err(|e| e.to_string())?;
            }
            if let Some(value) = line.strip_prefix("state=") {
                let (id, data): (String, Value) =
                    serde_json::from_str(value).map_err(|e| e.to_string())?;
                if id == "custom" {
                    continue;
                }
                let mut config = crate::templates::defaults(&id, &result.font_names)?;
                config.apply(&data)?;
                if config.template_id() != id {
                    return Err("Состояние не соответствует шаблону".into());
                }
                if result.saved_templates.insert(id, config.data).is_some() {
                    return Err("Повторяющийся шаблон в init.ini".into());
                }
            }
        }
        if active == "custom" {
            active = result.template_id().to_owned();
        }
        if let Some(data) = result.saved_templates.get(&active).cloned() {
            result.data = data;
        } else {
            result.data = crate::templates::defaults(&active, &result.font_names)?.data;
        }
        Ok(result)
    }

    pub fn save(&self, root: &Path) -> Result<(), String> {
        let mut states = self.saved_templates.clone();
        states.insert(self.template_id().to_owned(), self.data.clone());
        let mut output = format!(
            "[HassleStudio]\r\nversion=2\r\nactive={}\r\n",
            json!(self.template_id())
        );
        for (index, (id, data)) in states.into_iter().enumerate() {
            output.push_str(&format!(
                "\r\n[Template.{index}]\r\nstate={}\r\n",
                json!([id, data])
            ));
        }
        if output.len() > 67_108_864 {
            return Err("init.ini превышает 64 МиБ".into());
        }
        let temporary = root.join("init.ini.tmp");
        let mut file = File::create(&temporary).map_err(|e| e.to_string())?;
        file.write_all(output.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|e| e.to_string())?;
        drop(file);
        use std::os::windows::ffi::OsStrExt;
        #[link(name = "kernel32")]
        unsafe extern "system" {
            fn MoveFileExW(from: *const u16, to: *const u16, flags: u32) -> i32;
        }
        let from: Vec<u16> = temporary.as_os_str().encode_wide().chain(Some(0)).collect();
        let to: Vec<u16> = root
            .join("init.ini")
            .as_os_str()
            .encode_wide()
            .chain(Some(0))
            .collect();
        if unsafe { MoveFileExW(from.as_ptr(), to.as_ptr(), 9) } == 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
        Ok(())
    }

    pub fn template_id(&self) -> &str {
        self.data["template"]
            .as_str()
            .unwrap_or("11-happy-new-year-free")
    }

    pub fn select_template(&mut self, id: &str) -> Result<(), String> {
        if id == self.template_id() {
            return Ok(());
        }
        let mut next = crate::templates::defaults(id, &self.font_names)?;
        if let Some(data) = self.saved_templates.get(id) {
            next.apply(data)?;
        }
        self.saved_templates
            .insert(self.template_id().to_owned(), self.data.clone());
        self.data = next.data;
        Ok(())
    }

    pub fn reset_template(&mut self) -> Result<(), String> {
        self.data = crate::templates::defaults(self.template_id(), &self.font_names)?.data;
        Ok(())
    }

    pub fn set_font_names(&mut self, names: &[String]) {
        self.font_names = names.to_vec();
    }
    pub fn apply(&mut self, incoming: &Value) -> Result<(), String> {
        if !incoming.is_object() {
            return Err("Настройки должны быть объектом".into());
        }
        let mut next = self.data.clone();
        if let Some(id) = incoming.get("template") {
            let id = id.as_str().ok_or("Некорректный шаблон")?;
            if !crate::templates::catalog().iter().any(|item| item.id == id) {
                return Err("Неизвестный шаблон".into());
            }
            next["template"] = json!(id);
        }
        for key in ["templateOptions", "layouts", "imageOverrides"] {
            if let Some(value) = incoming.get(key) {
                if !value.is_object() {
                    return Err(format!("Ожидается объект: {key}"));
                }
                next[key] = value.clone();
            }
        }
        if next["templateOptions"].to_string().len() > 262_144 {
            return Err("Слишком много параметров шаблона".into());
        }
        let layouts = next["layouts"].as_object_mut().unwrap();
        if layouts.len() > 256 {
            return Err("Слишком много элементов".into());
        }
        layouts.retain(|key, _| !key.starts_with("dialog.") && key != "playerHud");
        for layout in layouts.values_mut() {
            if !layout.is_object() {
                return Err("Некорректное расположение".into());
            }
            for (key, min, max, default) in [
                ("x", -10000.0, 10000.0, 0.0),
                ("y", -10000.0, 10000.0, 0.0),
                ("scale", 0.25, 4.0, 1.0),
            ] {
                let number = layout
                    .get(key)
                    .map(|v| v.as_f64().ok_or("Некорректная координата"))
                    .transpose()?
                    .unwrap_or(default);
                if !number.is_finite() {
                    return Err("Некорректная координата".into());
                }
                layout[key] = json!(number.clamp(min, max));
            }
        }
        for group in ["chat", "clock"] {
            if let Some(widget) = incoming.get("widgets").and_then(|v| v.get(group)) {
                if !widget.is_object() {
                    return Err("Некорректные параметры элемента".into());
                }
                let defaults = next["widgets"][group].as_object().unwrap().clone();
                for (key, original) in defaults {
                    let Some(value) = widget.get(&key) else {
                        continue;
                    };
                    if original.is_boolean() {
                        next["widgets"][group][&key] =
                            json!(value.as_bool().ok_or("Ожидается переключатель")?);
                    } else if original.is_number() {
                        let number = value
                            .as_f64()
                            .filter(|v| v.is_finite())
                            .ok_or("Ожидается число")?;
                        let (min, max) = match key.as_str() {
                            "font" => (0.0, self.font_names.len().saturating_sub(1) as f64),
                            "size" | "lineHeight" => (8.0, 96.0),
                            "lines" => (1.0, 50.0),
                            "width" => (100.0, 4000.0),
                            "outline" => (0.0, 8.0),
                            "opacity" => (0.0, 1.0),
                            _ => (-10000.0, 10000.0),
                        };
                        let number = number.clamp(min, max);
                        next["widgets"][group][&key] = if key == "font" || key == "lines" {
                            json!(number.round() as u64)
                        } else {
                            json!(number)
                        };
                    } else if original.is_array() {
                        let colors = value
                            .as_array()
                            .filter(|a| a.len() == 4)
                            .ok_or("Ожидается RGBA")?;
                        let mut rgba = Vec::new();
                        for color in colors {
                            rgba.push(
                                color
                                    .as_f64()
                                    .filter(|v| v.is_finite())
                                    .ok_or("Некорректный цвет")?
                                    .clamp(0.0, 1.0),
                            );
                        }
                        next["widgets"][group][&key] = json!(rgba);
                    }
                }
            }
        }
        let overrides = next["imageOverrides"].as_object().unwrap();
        if overrides.len() > 1024 {
            return Err("Слишком много изображений".into());
        }
        let mut total = 0usize;
        for (path, source) in overrides {
            if !crate::images::valid_path(path) {
                return Err(format!("Некорректный путь: {path}"));
            }
            let source = source.as_str().ok_or("Ожидается Base64")?;
            total += source.len();
            if total > 33_554_432 {
                return Err("Изображения превышают 32 МиБ".into());
            }
            crate::images::decode(source)?;
        }
        self.data = next;
        Ok(())
    }
}
