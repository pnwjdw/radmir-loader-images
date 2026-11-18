use crate::{bridge::Bridge, compositor::Compositor, input::Input, settings::Config, ui::App};
use egui::{RawInput, Rect, pos2, vec2};
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::time::{Duration, Instant};

static VISIBLE: AtomicBool = AtomicBool::new(true);
static RELOAD: AtomicBool = AtomicBool::new(false);
static PHASE: AtomicU32 = AtomicU32::new(0);
static ERROR: Mutex<String> = Mutex::new(String::new());

pub fn set_visible(visible: bool) {
    VISIBLE.store(visible, Ordering::Release);
}
pub fn reload() {
    RELOAD.store(true, Ordering::Release);
}
pub fn state() -> u32 {
    PHASE.load(Ordering::Acquire)
}
pub fn set_error(error: String) {
    if let Ok(mut message) = ERROR.lock() {
        *message = error;
    }
}

#[link(name = "kernel32")]
unsafe extern "system" {
    fn GetCurrentProcessId() -> u32;
}

pub fn run(root: PathBuf, stop: &AtomicBool) -> Result<(), String> {
    PHASE.store(1, Ordering::Release);
    let pid = unsafe { GetCurrentProcessId() };
    let mut bridge = Bridge::new(pid);
    let mut input = Input::new(pid)?;
    let mut app = App::new(&root)?;
    let context = egui::Context::default();
    context.tessellation_options_mut(|options| options.coarse_tessellation_culling = false);
    let mut raster = Compositor::new();
    let started = Instant::now();
    let mut last_template = String::new();
    let mut last_images = Value::Null;
    let mut size = [1920, 1080];
    let mut poll_due = Instant::now();
    let mut next_status = Instant::now();
    let mut last_template_status = Value::Null;
    let mut overlay_due = Instant::now();
    let result = (|| {
        while !stop.load(Ordering::Acquire) {
            let frame_start = Instant::now();
            if input.toggle() {
                VISIBLE.fetch_xor(true, Ordering::AcqRel);
            }
            app.menu_open = VISIBLE.load(Ordering::Acquire);
            input.capture(app.menu_open);
            if RELOAD.swap(false, Ordering::AcqRel) {
                match Config::load(&root) {
                    Ok(mut config) => {
                        bridge.stop()?;
                        bridge.refresh();
                        config.set_font_names(&crate::assets::font_names());
                        app.config = config;
                        app.revision += 1;
                        last_template.clear();
                    }
                    Err(error) => set_error(error),
                }
            }
            if app.refresh_requested {
                bridge.stop()?;
                bridge.refresh();
                last_template.clear();
                app.refresh_requested = false;
            }
            bridge.tick(&app.config.data, app.revision);
            let status = bridge.status();
            if status.views.is_empty() {
                last_template.clear();
                PHASE.store(2, Ordering::Release);
                input.capture(false);
                set_error(status.error);
                std::thread::sleep(Duration::from_millis(300));
                continue;
            }
            PHASE.store(3, Ordering::Release);
            if Instant::now() >= poll_due {
                size = bridge.viewport()?;
                poll_due = Instant::now() + Duration::from_millis(250);
            }
            let id = app.config.template_id().to_owned();
            if last_template != id || last_images != app.config.data["imageOverrides"] {
                match bridge.configure_template(&app.config.data) {
                    Ok(status) => {
                        last_template_status = status;
                        last_template = id;
                        last_images = app.config.data["imageOverrides"].clone();
                    }
                    Err(error) => {
                        app.report(error.clone());
                        set_error(error);
                        last_template.clear();
                    }
                }
            }
            for (index, value) in std::mem::take(&mut app.template_actions) {
                match bridge.template_action(index, &value) {
                    Ok(status) => last_template_status = status,
                    Err(error) => app.report(error),
                }
            }
            if Instant::now() >= next_status {
                if let Ok(status) = bridge.template_status() {
                    if status["id"].as_str() != Some(app.config.template_id()) {
                        last_template.clear();
                    }
                    last_template_status = status;
                }
                next_status = Instant::now() + Duration::from_millis(400);
            }
            if let Some(storage) = last_template_status.get("storage").filter(|value| {
                value.is_object()
                    && last_template_status["id"].as_str() == Some(app.config.template_id())
            }) && app.config.data["templateOptions"] != *storage
            {
                app.config.data["templateOptions"] = storage.clone();
                app.mark_changed();
            }
            app.template_options = last_template_status["options"]
                .as_array()
                .cloned()
                .unwrap_or_default();
            if let Some(error) = last_template_status["error"]
                .as_str()
                .filter(|value| !value.is_empty())
            {
                set_error(error.into());
            }
            let scale = 1.0;
            let raw = RawInput {
                screen_rect: Some(Rect::from_min_size(
                    pos2(0.0, 0.0),
                    vec2(size[0] as f32 / scale, size[1] as f32 / scale),
                )),
                time: Some(started.elapsed().as_secs_f64()),
                predicted_dt: 1.0 / 60.0,
                modifiers: crate::input::modifiers(),
                events: input.take(scale, size),
                focused: true,
                ..Default::default()
            };
            let output = context.run(raw, |ctx| app.draw(ctx, &status));
            VISIBLE.store(app.menu_open, Ordering::Release);
            let primitives = context.tessellate(output.shapes, output.pixels_per_point);
            let layers = raster.paint(&primitives, &output.textures_delta)?;
            let refresh = Instant::now() >= overlay_due;
            bridge.compose(&layers, size[0], size[1], refresh)?;
            if refresh {
                overlay_due = Instant::now() + Duration::from_secs(1);
            }
            input.hotkey(app.config.data["menuKey"].as_u64().unwrap_or(0x2d) as u32);
            if frame_start.elapsed() < Duration::from_micros(16667) {
                std::thread::sleep(Duration::from_micros(16667) - frame_start.elapsed());
            }
        }
        Ok(())
    })();
    input.capture(false);
    let saved = app.flush();
    let restored = bridge.stop();
    let detached = input.detach();
    PHASE.store(0, Ordering::Release);
    result.and(saved).and(restored).and(detached)
}
