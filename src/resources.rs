use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::Duration;

pub const RUNTIME: &str = include_str!("../assets/runtime.js");
pub const HUD: &str = include_str!("../assets/hud.js");
pub const LAYOUT: &str = include_str!("../assets/layout.js");

struct Font {
    name: &'static str,
    regular: &'static [u8],
    bold: &'static [u8],
}

const FONTS: &[Font] = &[
    Font {
        name: "Arial",
        regular: include_bytes!("../assets/fonts/arial.ttf"),
        bold: include_bytes!("../assets/fonts/arialbd.ttf"),
    },
    Font {
        name: "Tahoma",
        regular: include_bytes!("../assets/fonts/tahoma.ttf"),
        bold: include_bytes!("../assets/fonts/tahomabd.ttf"),
    },
    Font {
        name: "Verdana",
        regular: include_bytes!("../assets/fonts/verdana.ttf"),
        bold: include_bytes!("../assets/fonts/verdanab.ttf"),
    },
    Font {
        name: "Consolas",
        regular: include_bytes!("../assets/fonts/consola.ttf"),
        bold: include_bytes!("../assets/fonts/consolab.ttf"),
    },
    Font {
        name: "BankGothic RUSS",
        regular: include_bytes!("../assets/fonts/BankGothic.ttf"),
        bold: include_bytes!("../assets/fonts/BankGothic.ttf"),
    },
    Font {
        name: "Pricedown RUS",
        regular: include_bytes!("../assets/fonts/Pricedown.ttf"),
        bold: include_bytes!("../assets/fonts/Pricedown.ttf"),
    },
    Font {
        name: "Gotham Pro",
        regular: include_bytes!("../assets/fonts/GothamPro.ttf"),
        bold: include_bytes!("../assets/fonts/GothamProBold.ttf"),
    },
    Font {
        name: "SAfonts",
        regular: include_bytes!("../assets/fonts/SAfonts.ttf"),
        bold: include_bytes!("../assets/fonts/SAfonts.ttf"),
    },
    Font {
        name: "Gotham Pro Black",
        regular: include_bytes!("../assets/fonts/GothamProBlack.ttf"),
        bold: include_bytes!("../assets/fonts/GothamProBlack.ttf"),
    },
];

pub fn menu_font_bytes() -> &'static [u8] {
    include_bytes!("../assets/fonts/segoeui.ttf")
}

pub fn font_names() -> Vec<String> {
    FONTS.iter().map(|font| font.name.to_owned()).collect()
}
pub fn font_bytes(index: usize, bold: bool) -> Result<Arc<Vec<u8>>, String> {
    let font = FONTS.get(index).ok_or("Unknown embedded font")?;
    Ok(Arc::new(
        if bold { font.bold } else { font.regular }.to_vec(),
    ))
}

#[derive(Clone)]
struct Resource {
    bytes: Arc<Vec<u8>>,
    content_type: String,
}

pub struct AssetServer {
    resources: Arc<Mutex<HashMap<String, Resource>>>,
    running: Arc<AtomicBool>,
    workers: Vec<JoinHandle<()>>,
    port: u16,
    prefix: String,
}

impl AssetServer {
    pub fn new() -> Self {
        Self {
            resources: Arc::new(Mutex::new(HashMap::new())),
            running: Arc::new(AtomicBool::new(false)),
            workers: Vec::new(),
            port: 0,
            prefix: String::new(),
        }
    }

    fn start(&mut self) -> Result<(), String> {
        if !self.workers.is_empty() {
            return Ok(());
        }
        let listener = TcpListener::bind((std::net::Ipv4Addr::LOCALHOST, 0))
            .map_err(|error| error.to_string())?;
        listener
            .set_nonblocking(true)
            .map_err(|error| error.to_string())?;
        self.port = listener
            .local_addr()
            .map_err(|error| error.to_string())?
            .port();
        let mut nonce = [0u8; 16];
        #[link(name = "bcrypt")]
        unsafe extern "system" {
            fn BCryptGenRandom(
                algorithm: *mut std::ffi::c_void,
                buffer: *mut u8,
                length: u32,
                flags: u32,
            ) -> i32;
        }
        if unsafe {
            BCryptGenRandom(
                std::ptr::null_mut(),
                nonce.as_mut_ptr(),
                nonce.len() as u32,
                2,
            )
        } < 0
        {
            return Err("Asset nonce generation failed".into());
        }
        self.prefix = format!(
            "/{}/",
            nonce
                .iter()
                .map(|byte| format!("{byte:02x}"))
                .collect::<String>()
        );
        let listeners: Vec<_> = (0..4)
            .map(|_| listener.try_clone())
            .collect::<Result<_, _>>()
            .map_err(|error| error.to_string())?;
        self.running.store(true, Ordering::Release);
        for listener in listeners {
            listener
                .set_nonblocking(true)
                .map_err(|error| error.to_string())?;
            let resources = self.resources.clone();
            let running = self.running.clone();
            self.workers.push(thread::spawn(move || {
                while running.load(Ordering::Acquire) {
                    match listener.accept() {
                        Ok((mut client, _)) => {
                            let _ = respond(&mut client, &resources);
                        }
                        Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                            thread::sleep(Duration::from_millis(5))
                        }
                        Err(_) => break,
                    }
                }
            }));
        }
        Ok(())
    }

    pub fn publish(
        &mut self,
        name: &str,
        bytes: Arc<Vec<u8>>,
        content_type: &str,
    ) -> Result<String, String> {
        self.start()?;
        let path = format!("{}{name}", self.prefix);
        self.resources
            .lock()
            .map_err(|_| "Asset cache unavailable")?
            .insert(
                path.clone(),
                Resource {
                    bytes,
                    content_type: content_type.into(),
                },
            );
        Ok(format!("http://127.0.0.1:{}{path}", self.port))
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::Release);
        if self.port != 0 {
            for _ in 0..self.workers.len() {
                let _ = TcpStream::connect_timeout(
                    &std::net::SocketAddr::from((std::net::Ipv4Addr::LOCALHOST, self.port)),
                    Duration::from_millis(100),
                );
            }
        }
        for worker in self.workers.drain(..) {
            let _ = worker.join();
        }
        if let Ok(mut resources) = self.resources.lock() {
            resources.clear();
        }
        self.port = 0;
    }

    pub fn remove(&mut self, name: &str) {
        if let Ok(mut resources) = self.resources.lock() {
            resources.remove(&format!("{}{name}", self.prefix));
        }
    }
}

impl Drop for AssetServer {
    fn drop(&mut self) {
        self.stop();
    }
}

fn respond(
    client: &mut TcpStream,
    resources: &Mutex<HashMap<String, Resource>>,
) -> std::io::Result<()> {
    client.set_nonblocking(false)?;
    client.set_read_timeout(Some(Duration::from_millis(1000)))?;
    client.set_write_timeout(Some(Duration::from_millis(1000)))?;
    let mut request = Vec::new();
    let mut buffer = [0u8; 4096];
    while !request.windows(4).any(|bytes| bytes == b"\r\n\r\n") {
        let count = client.read(&mut buffer)?;
        if count == 0 || request.len() + count > 16384 {
            return Ok(());
        }
        request.extend_from_slice(&buffer[..count]);
    }
    let text = String::from_utf8_lossy(&request);
    let mut words = text.split_whitespace();
    let method = words.next().unwrap_or("");
    let path = words.next().unwrap_or("").split('?').next().unwrap_or("");
    let headers = "Connection: close\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, HEAD, OPTIONS\r\nAccess-Control-Allow-Private-Network: true\r\n";
    if method == "OPTIONS" {
        return client.write_all(
            format!("HTTP/1.1 204 No Content\r\n{headers}Content-Length: 0\r\n\r\n").as_bytes(),
        );
    }
    let item = resources
        .lock()
        .ok()
        .and_then(|cache| cache.get(path).cloned());
    let Some(item) = item.filter(|_| ["GET", "HEAD"].contains(&method)) else {
        return client.write_all(
            format!("HTTP/1.1 404 Not Found\r\n{headers}Content-Length: 0\r\n\r\n").as_bytes(),
        );
    };
    let cache = if path.contains("/overlay/") {
        "no-store"
    } else {
        "private, max-age=86400"
    };
    client.write_all(format!("HTTP/1.1 200 OK\r\n{headers}Content-Type: {}\r\nCache-Control: {cache}\r\nContent-Length: {}\r\n\r\n", item.content_type, item.bytes.len()).as_bytes())?;
    if method == "GET" {
        client.write_all(&item.bytes)?;
    }
    Ok(())
}
