use base64::Engine;
use image::AnimationDecoder;
use std::io::Cursor;

pub fn decode(source: &str) -> Result<(Vec<u8>, &'static str), String> {
    let encoded = if source.starts_with("data:") {
        let (header, data) = source.split_once(',').ok_or("Некорректный data URL")?;
        if !matches!(header, "data:image/png;base64" | "data:image/gif;base64") {
            return Err("Поддерживаются только Base64 PNG и GIF".into());
        }
        data
    } else {
        source
    };
    if encoded.len() > 8_388_608 {
        return Err("Изображение превышает 8 МиБ Base64".into());
    }
    let encoded: String = encoded
        .chars()
        .filter(|c| !c.is_ascii_whitespace())
        .collect();
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(encoded)
        .map_err(|_| "Некорректный Base64")?;
    let format = image::guess_format(&bytes).map_err(|_| "Изображение не распознано")?;
    let mime = match format {
        image::ImageFormat::Png => "image/png",
        image::ImageFormat::Gif => "image/gif",
        _ => return Err("Поддерживаются только PNG и GIF".into()),
    };
    let (width, height) = image::ImageReader::with_format(Cursor::new(&bytes), format)
        .into_dimensions()
        .map_err(|error| error.to_string())?;
    if width == 0 || height == 0 || width > 2048 || height > 2048 {
        return Err("Размер изображения должен быть от 1 до 2048 пикселей".into());
    }
    if format == image::ImageFormat::Gif {
        let decoder = image::codecs::gif::GifDecoder::new(Cursor::new(&bytes))
            .map_err(|error| error.to_string())?;
        let mut count = 0;
        let mut total = 0usize;
        for frame in decoder.into_frames() {
            let frame = frame.map_err(|error| error.to_string())?;
            count += 1;
            total += frame.buffer().len();
            if count > 240 || total > 100_663_296 {
                return Err("GIF: максимум 240 кадров и 96 МиБ после распаковки".into());
            }
        }
        if count == 0 {
            return Err("GIF не содержит кадров".into());
        }
    } else {
        image::load_from_memory_with_format(&bytes, format).map_err(|error| error.to_string())?;
    }
    Ok((bytes, mime))
}

pub fn valid_path(path: &str) -> bool {
    !path.is_empty()
        && path.len() <= 512
        && !path.contains("..")
        && (path.starts_with("oneas-img/") || path.starts_with("images/"))
        && path
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || b"/-_.".contains(&c))
}
