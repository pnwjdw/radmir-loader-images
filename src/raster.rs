use egui::epaint::{ImageData, Primitive};
use egui::{ClippedPrimitive, TextureId, TexturesDelta};
use image::ImageEncoder;
use std::collections::HashMap;

#[derive(Clone)]
struct Texture {
    size: [usize; 2],
    pixels: Vec<[u8; 4]>,
}

pub struct Raster {
    textures: HashMap<TextureId, Texture>,
    pixels: Vec<u8>,
    size: [usize; 2],
    previous: Vec<(egui::Rect, egui::epaint::Mesh)>,
    previous_scale: f32,
    cached_png: Vec<u8>,
}

impl Raster {
    pub fn copy_textures(&mut self, source: &Self) {
        self.textures = source.textures.clone();
        self.cached_png.clear();
    }

    pub fn update_textures(&mut self, delta: &TexturesDelta) -> Result<(), String> {
        for (id, image) in &delta.set {
            let size = image.image.size();
            let pixels: Vec<[u8; 4]> = match &image.image {
                ImageData::Color(image) => {
                    image.pixels.iter().map(|pixel| pixel.to_array()).collect()
                }
                ImageData::Font(image) => image
                    .srgba_pixels(None)
                    .map(|pixel| pixel.to_array())
                    .collect(),
            };
            if let Some(position) = image.pos {
                let texture = self.textures.get_mut(id).ok_or("Missing partial texture")?;
                if position[0] + size[0] > texture.size[0]
                    || position[1] + size[1] > texture.size[1]
                {
                    return Err("Invalid texture update".into());
                }
                for row in 0..size[1] {
                    let start = (position[1] + row) * texture.size[0] + position[0];
                    texture.pixels[start..start + size[0]]
                        .copy_from_slice(&pixels[row * size[0]..(row + 1) * size[0]]);
                }
            } else {
                self.textures.insert(*id, Texture { size, pixels });
            }
        }
        for id in &delta.free {
            self.textures.remove(id);
        }
        if !delta.set.is_empty() || !delta.free.is_empty() {
            self.cached_png.clear();
        }
        Ok(())
    }

    pub fn new() -> Self {
        Self {
            textures: HashMap::new(),
            pixels: Vec::new(),
            size: [0; 2],
            previous: Vec::new(),
            previous_scale: 0.0,
            cached_png: Vec::new(),
        }
    }

    pub fn paint(
        &mut self,
        size: [usize; 2],
        primitives: &[ClippedPrimitive],
        delta: &TexturesDelta,
        scale: f32,
    ) -> Result<Vec<u8>, String> {
        if size[0] == 0 || size[1] == 0 || size[0] > 7680 || size[1] > 4320 {
            return Err("Invalid overlay dimensions".into());
        }
        let meshes: Option<Vec<_>> = primitives
            .iter()
            .map(|primitive| {
                if let Primitive::Mesh(mesh) = &primitive.primitive {
                    Some((primitive.clip_rect, mesh.clone()))
                } else {
                    None
                }
            })
            .collect();
        if delta.set.is_empty()
            && delta.free.is_empty()
            && self.size == size
            && self.previous_scale == scale
            && !self.cached_png.is_empty()
            && meshes.as_ref() == Some(&self.previous)
        {
            return Ok(self.cached_png.clone());
        }
        for (id, image) in &delta.set {
            let size = image.image.size();
            let pixels: Vec<[u8; 4]> = match &image.image {
                ImageData::Color(image) => {
                    image.pixels.iter().map(|pixel| pixel.to_array()).collect()
                }
                ImageData::Font(image) => image
                    .srgba_pixels(None)
                    .map(|pixel| pixel.to_array())
                    .collect(),
            };
            if let Some(position) = image.pos {
                let texture = self.textures.get_mut(id).ok_or("Missing partial texture")?;
                if position[0] + size[0] > texture.size[0]
                    || position[1] + size[1] > texture.size[1]
                {
                    return Err("Invalid texture update".into());
                }
                for row in 0..size[1] {
                    let start = (position[1] + row) * texture.size[0] + position[0];
                    texture.pixels[start..start + size[0]]
                        .copy_from_slice(&pixels[row * size[0]..(row + 1) * size[0]]);
                }
            } else {
                self.textures.insert(*id, Texture { size, pixels });
            }
        }
        self.size = size;
        self.pixels.resize(size[0] * size[1] * 4, 0);
        self.pixels.fill(0);
        for primitive in primitives {
            let Primitive::Mesh(mesh) = &primitive.primitive else {
                continue;
            };
            let Some(texture) = self.textures.get(&mesh.texture_id) else {
                continue;
            };
            let clip = primitive.clip_rect;
            let clip_min = [
                (clip.min.x * scale).floor().max(0.0) as usize,
                (clip.min.y * scale).floor().max(0.0) as usize,
            ];
            let clip_max = [
                (clip.max.x * scale).ceil().max(0.0) as usize,
                (clip.max.y * scale).ceil().max(0.0) as usize,
            ];
            for triangle in mesh.indices.as_chunks::<3>().0 {
                let a = mesh.vertices[triangle[0] as usize];
                let b = mesh.vertices[triangle[1] as usize];
                let c = mesh.vertices[triangle[2] as usize];
                let p = [a.pos * scale, b.pos * scale, c.pos * scale];
                let area = cross(p[1] - p[0], p[2] - p[0]);
                if area.abs() < 0.00001 {
                    continue;
                }
                let minimum = [
                    p.iter()
                        .map(|p| p.x)
                        .fold(f32::INFINITY, f32::min)
                        .floor()
                        .max(0.0) as usize,
                    p.iter()
                        .map(|p| p.y)
                        .fold(f32::INFINITY, f32::min)
                        .floor()
                        .max(0.0) as usize,
                ];
                let maximum = [
                    p.iter().map(|p| p.x).fold(0.0, f32::max).ceil() as usize,
                    p.iter().map(|p| p.y).fold(0.0, f32::max).ceil() as usize,
                ];
                let start = [minimum[0].max(clip_min[0]), minimum[1].max(clip_min[1])];
                let end = [
                    maximum[0].min(clip_max[0]).min(size[0]),
                    maximum[1].min(clip_max[1]).min(size[1]),
                ];
                if start[0] >= end[0] || start[1] >= end[1] {
                    continue;
                }
                let limits: [f32; 3] = std::array::from_fn(|edge| {
                    let direction = (p[(edge + 2) % 3] - p[(edge + 1) % 3]) * area.signum();
                    if direction.y < 0.0 || (direction.y == 0.0 && direction.x > 0.0) {
                        0.0
                    } else {
                        0.000001
                    }
                });
                let colors = [a.color.to_array(), b.color.to_array(), c.color.to_array()];
                let constant =
                    a.uv == b.uv && b.uv == c.uv && a.color == b.color && b.color == c.color;
                let constant_source = if constant {
                    let tx = (a.uv.x * texture.size[0] as f32)
                        .floor()
                        .clamp(0.0, (texture.size[0] - 1) as f32)
                        as usize;
                    let ty = (a.uv.y * texture.size[1] as f32)
                        .floor()
                        .clamp(0.0, (texture.size[1] - 1) as f32)
                        as usize;
                    let texel = texture.pixels[ty * texture.size[0] + tx];
                    Some(std::array::from_fn::<_, 4, _>(|channel| {
                        (colors[0][channel] as u32 * texel[channel] as u32 + 127) / 255
                    }))
                } else {
                    None
                };
                let dx = [
                    (p[1].y - p[2].y) / area,
                    (p[2].y - p[0].y) / area,
                    (p[0].y - p[1].y) / area,
                ];
                let uv_dx =
                    a.uv.to_vec2() * dx[0] + b.uv.to_vec2() * dx[1] + c.uv.to_vec2() * dx[2];
                let color_dx: [f32; 4] = std::array::from_fn(|channel| {
                    colors[0][channel] as f32 * dx[0]
                        + colors[1][channel] as f32 * dx[1]
                        + colors[2][channel] as f32 * dx[2]
                });
                for y in start[1]..end[1] {
                    let point = egui::pos2(start[0] as f32 + 0.5, y as f32 + 0.5);
                    let w = [
                        cross(p[1] - point, p[2] - point) / area,
                        cross(p[2] - point, p[0] - point) / area,
                        cross(p[0] - point, p[1] - point) / area,
                    ];
                    let mut left = 0.0_f32;
                    let mut right = (end[0].saturating_sub(start[0])) as f32 - 1.0;
                    for edge in 0..3 {
                        if dx[edge] > 0.0000001 {
                            left = left.max((limits[edge] - w[edge]) / dx[edge]);
                        } else if dx[edge] < -0.0000001 {
                            right = right.min((limits[edge] - w[edge]) / dx[edge]);
                        } else if w[edge] < limits[edge] {
                            right = -1.0;
                        }
                    }
                    if left.ceil() > right.floor() {
                        continue;
                    }
                    let first = start[0] + left.ceil().max(0.0) as usize;
                    let last = (start[0] + right.floor().max(0.0) as usize + 1).min(end[0]);
                    if first >= last {
                        continue;
                    }
                    if let Some(source) = constant_source {
                        if source[3] == 0 {
                            continue;
                        }
                        let remaining = 255 - source[3];
                        for target in self.pixels
                            [(y * size[0] + first) * 4..(y * size[0] + last) * 4]
                            .as_chunks_mut::<4>()
                            .0
                            .iter_mut()
                        {
                            for channel in 0..4 {
                                target[channel] = (source[channel]
                                    + (target[channel] as u32 * remaining + 127) / 255)
                                    .min(255)
                                    as u8;
                            }
                        }
                        continue;
                    }
                    let offset = (first - start[0]) as f32;
                    let mut uv = a.uv.to_vec2() * w[0]
                        + b.uv.to_vec2() * w[1]
                        + c.uv.to_vec2() * w[2]
                        + uv_dx * offset;
                    let mut color: [f32; 4] = std::array::from_fn(|channel| {
                        colors[0][channel] as f32 * w[0]
                            + colors[1][channel] as f32 * w[1]
                            + colors[2][channel] as f32 * w[2]
                            + color_dx[channel] * offset
                    });
                    for x in first..last {
                        let tx = (uv.x * texture.size[0] as f32)
                            .floor()
                            .clamp(0.0, (texture.size[0] - 1) as f32)
                            as usize;
                        let ty = (uv.y * texture.size[1] as f32)
                            .floor()
                            .clamp(0.0, (texture.size[1] - 1) as f32)
                            as usize;
                        let texel = texture.pixels[ty * texture.size[0] + tx];
                        let mut source = [0.0f32; 4];
                        for channel in 0..4 {
                            source[channel] = color[channel] * texel[channel] as f32 / 255.0;
                            color[channel] += color_dx[channel];
                        }
                        uv += uv_dx;
                        if source[3] <= 0.0 {
                            continue;
                        }
                        let target = &mut self.pixels[(y * size[0] + x) * 4..][..4];
                        let remaining = 1.0 - source[3] / 255.0;
                        for channel in 0..4 {
                            target[channel] = (source[channel] + target[channel] as f32 * remaining)
                                .round()
                                .clamp(0.0, 255.0)
                                as u8;
                        }
                    }
                }
            }
        }
        for id in &delta.free {
            self.textures.remove(id);
        }
        for pixel in self.pixels.as_chunks_mut::<4>().0 {
            if pixel[3] > 0 {
                for channel in 0..3 {
                    pixel[channel] = (pixel[channel] as u32 * 255 / pixel[3] as u32).min(255) as u8;
                }
            }
        }
        let mut png = Vec::new();
        image::codecs::png::PngEncoder::new_with_quality(
            &mut png,
            image::codecs::png::CompressionType::Fast,
            image::codecs::png::FilterType::Sub,
        )
        .write_image(
            &self.pixels,
            size[0] as u32,
            size[1] as u32,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| e.to_string())?;
        self.previous = meshes.unwrap_or_default();
        self.previous_scale = scale;
        self.cached_png = png.clone();
        Ok(png)
    }
}

fn cross(a: egui::Vec2, b: egui::Vec2) -> f32 {
    a.x * b.y - a.y * b.x
}
