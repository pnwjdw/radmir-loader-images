use crate::raster::Raster;
use egui::epaint::{Mesh, Primitive};
use egui::{ClippedPrimitive, Rect, TexturesDelta, pos2};

struct Layer {
    raster: Raster,
    mesh: Mesh,
    png: Vec<u8>,
    size: [usize; 2],
}

pub struct FrameLayer {
    pub index: usize,
    pub position: [f32; 2],
    pub size: [usize; 2],
    pub clip: [f32; 4],
    pub png: Vec<u8>,
}

pub struct Compositor {
    textures: Raster,
    layers: Vec<Layer>,
}

impl Compositor {
    pub fn new() -> Self {
        Self {
            textures: Raster::new(),
            layers: Vec::new(),
        }
    }

    pub fn paint(
        &mut self,
        primitives: &[ClippedPrimitive],
        delta: &TexturesDelta,
    ) -> Result<Vec<FrameLayer>, String> {
        let changed_texture = !delta.set.is_empty() || !delta.free.is_empty();
        let mut updates = delta.clone();
        updates.free.clear();
        self.textures.update_textures(&updates)?;
        if changed_texture {
            for layer in &mut self.layers {
                layer.raster.copy_textures(&self.textures);
            }
        }
        let mut output = Vec::new();
        for primitive in primitives {
            let Primitive::Mesh(source) = &primitive.primitive else {
                return Err("Unsupported canvas callback".into());
            };
            if source.vertices.is_empty() || source.indices.is_empty() {
                continue;
            }
            let mut bounds = Rect::NOTHING;
            for vertex in &source.vertices {
                bounds.extend_with(vertex.pos);
            }
            let origin = bounds.min.floor();
            let size = [
                (bounds.max.x.ceil() - origin.x).max(1.0) as usize,
                (bounds.max.y.ceil() - origin.y).max(1.0) as usize,
            ];
            let mut mesh = source.clone();
            for vertex in &mut mesh.vertices {
                vertex.pos = pos2(
                    ((vertex.pos.x - origin.x) * 64.0).round() / 64.0,
                    ((vertex.pos.y - origin.y) * 64.0).round() / 64.0,
                );
            }
            let index = output.len();
            if self.layers.len() <= index {
                let mut raster = Raster::new();
                raster.copy_textures(&self.textures);
                self.layers.push(Layer {
                    raster,
                    mesh: Mesh::default(),
                    png: Vec::new(),
                    size: [0; 2],
                });
            }
            let layer = &mut self.layers[index];
            if changed_texture || layer.mesh != mesh || layer.size != size || layer.png.is_empty() {
                let local = ClippedPrimitive {
                    clip_rect: Rect::EVERYTHING,
                    primitive: Primitive::Mesh(mesh.clone()),
                };
                layer.png = layer
                    .raster
                    .paint(size, &[local], &TexturesDelta::default(), 1.0)?;
                layer.mesh = mesh;
                layer.size = size;
            }
            let clip = primitive.clip_rect;
            output.push(FrameLayer {
                index,
                position: [origin.x, origin.y],
                size,
                clip: [
                    clip.min.x.max(0.0),
                    clip.min.y.max(0.0),
                    clip.max.x.min(7680.0),
                    clip.max.y.min(4320.0),
                ],
                png: layer.png.clone(),
            });
        }
        if output.len() < self.layers.len() {
            self.layers.truncate(output.len());
        }
        self.textures.update_textures(&TexturesDelta {
            set: Vec::new(),
            free: delta.free.clone(),
        })?;
        Ok(output)
    }
}
