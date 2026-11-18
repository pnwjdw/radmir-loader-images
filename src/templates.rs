use crate::settings::Config;
use serde::Deserialize;
use serde_json::json;
use std::sync::OnceLock;

include!(concat!(env!("OUT_DIR"), "/embedded.rs"));

#[derive(Clone, Debug, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub edition: String,
}

pub fn catalog() -> &'static [Template] {
    static CATALOG: OnceLock<Vec<Template>> = OnceLock::new();
    CATALOG.get_or_init(|| {
        serde_json::from_str(include_str!("../assets/templates/catalog.json"))
            .expect("Embedded template catalog")
    })
}

pub fn file(name: &str) -> Option<&'static [u8]> {
    FILES
        .iter()
        .find_map(|(key, value)| (*key == name).then_some(*value))
}

pub fn image_paths(id: &str) -> Vec<String> {
    let mut paths = std::collections::BTreeSet::new();
    for name in [format!("{id}/hud.js"), format!("{id}/theme.css")] {
        if let Some(bytes) = file(&name) {
            let text = String::from_utf8_lossy(bytes);
            for token in text.split(|c: char| !(c.is_ascii_alphanumeric() || "/-_.".contains(c))) {
                let path = token.trim_start_matches("./");
                if crate::images::valid_path(path)
                    && path.rsplit('.').next().is_some_and(|ext| {
                        ["png", "gif", "jpg", "jpeg", "svg", "webp", "bmp"].contains(&ext)
                    })
                {
                    paths.insert(path.to_owned());
                }
            }
        }
    }
    for (name, _) in FILES {
        if name.starts_with("oneas-img/") {
            paths.insert((*name).to_owned());
        }
    }
    paths.into_iter().collect()
}

pub fn font_fallback(css: &str, base: &str) -> String {
    let mut result = format!(
        "@font-face{{font-family:HassleCyrillicFallback;font-style:normal;font-weight:400;src:url(\"{base}fonts/GothamPro-Regular/GothamPro.ttf\") format(\"truetype\");}}@font-face{{font-family:HassleCyrillicFallback;font-style:normal;font-weight:700;src:url(\"{base}fonts/GothamPro-Bold/GothamPro-Bold.ttf\") format(\"truetype\");}}[data-hassle-template]{{font-family:HassleCyrillicFallback,sans-serif;}}"
    );
    let mut in_face = false;
    for line in css.lines() {
        if line.contains("@font-face") {
            in_face = true;
        }
        if !in_face && (line.contains("font-family:") || line.contains("--font-famaly-all:")) {
            if let Some(end) = line.find(';') {
                let declaration = line[..end]
                    .replace(", \"sans-serif\"", "")
                    .replace(", sans-serif", "")
                    .replace(",sans-serif", "");
                let important = declaration.contains("!important");
                result.push_str(declaration.replace("!important", "").trim_end());
                result.push_str(",HassleCyrillicFallback,sans-serif");
                if important {
                    result.push_str(" !important");
                }
                result.push_str(&line[end..]);
            } else {
                result.push_str(line);
            }
        } else {
            result.push_str(line);
        }
        result.push('\n');
        if line.contains('}') {
            in_face = false;
        }
    }
    result
}

pub fn defaults(id: &str, fonts: &[String]) -> Result<Config, String> {
    if !catalog().iter().any(|item| item.id == id) {
        return Err(format!("Неизвестный шаблон: {id}"));
    }
    let mut config = Config::default();
    config.set_font_names(fonts);
    config.data["template"] = json!(id);
    config.data["templateOptions"] = json!({});
    Ok(config)
}

pub fn mime(name: &str) -> &'static str {
    match name.rsplit('.').next().unwrap_or("") {
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "svg" => "image/svg+xml",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "png" => "image/png",
        "css" => "text/css; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        _ => "application/octet-stream",
    }
}
