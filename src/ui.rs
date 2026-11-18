use crate::{
    assets,
    bridge::{BridgeStatus, ElementBounds},
    settings::Config,
};
use egui::{Color32, FontId, Id, Pos2, Rect, Stroke, Vec2, pos2, vec2};
use serde_json::{Value, json};
use std::path::{Path, PathBuf};
use std::sync::mpsc::{self, Receiver};
use std::thread::JoinHandle;
use std::time::{Duration, Instant};

const ACCENT: Color32 = Color32::from_rgb(150, 138, 255);

struct ImageReplacement {
    template: String,
    path: String,
    source: String,
}

pub struct App {
    pub config: Config,
    pub revision: u64,
    pub menu_open: bool,
    pub refresh_requested: bool,
    pub template_options: Vec<Value>,
    pub template_actions: Vec<(usize, Value)>,
    root: PathBuf,
    section: usize,
    styled: bool,
    message: String,
    save_due: Option<Instant>,
    menu_rect: Option<Rect>,
    elements: Vec<ElementBounds>,
    selected_element: String,
    dragged_element: String,
    resource: String,
    resource_filter: String,
    image_input: String,
    image_receiver: Option<Receiver<Result<ImageReplacement, String>>>,
    image_worker: Option<JoinHandle<()>>,
}

impl App {
    pub fn new(root: &Path) -> Result<Self, String> {
        let config = Config::load(root)?;
        Ok(Self {
            config,
            revision: 1,
            menu_open: true,
            refresh_requested: false,
            template_options: Vec::new(),
            template_actions: Vec::new(),
            root: root.to_owned(),
            section: 0,
            styled: false,
            message: String::new(),
            save_due: None,
            menu_rect: None,
            elements: Vec::new(),
            selected_element: String::new(),
            dragged_element: String::new(),
            resource: String::new(),
            resource_filter: String::new(),
            image_input: String::new(),
            image_receiver: None,
            image_worker: None,
        })
    }

    pub fn flush(&mut self) -> Result<(), String> {
        self.config.save(&self.root)?;
        self.save_due = None;
        Ok(())
    }

    pub fn report(&mut self, message: String) {
        self.message = message;
    }
    pub fn mark_changed(&mut self) {
        self.revision = self.revision.wrapping_add(1);
        self.save_due = Some(Instant::now() + Duration::from_millis(350));
    }

    pub fn draw(&mut self, ctx: &egui::Context, status: &BridgeStatus) {
        if !self.styled {
            let mut fonts = egui::FontDefinitions::default();
            {
                fonts.font_data.insert(
                    "menu".into(),
                    egui::FontData::from_static(assets::menu_font_bytes()).into(),
                );
                fonts
                    .families
                    .get_mut(&egui::FontFamily::Proportional)
                    .unwrap()
                    .insert(0, "menu".into());
                ctx.set_fonts(fonts);
            }
            let mut style = (*ctx.style()).clone();
            style.visuals = egui::Visuals::dark();
            style.visuals.selection.bg_fill = Color32::from_rgb(75, 60, 120);
            style.spacing.item_spacing = vec2(10.0, 10.0);
            style
                .text_styles
                .insert(egui::TextStyle::Body, FontId::proportional(16.0));
            style
                .text_styles
                .insert(egui::TextStyle::Button, FontId::proportional(16.0));
            ctx.set_style(style);
            self.styled = true;
        }
        if let Some(result) = self
            .image_receiver
            .as_ref()
            .and_then(|receiver| receiver.try_recv().ok())
        {
            self.image_receiver = None;
            if let Some(worker) = self.image_worker.take() {
                let _ = worker.join();
            }
            match result {
                Ok(image) if image.template == self.config.template_id() => {
                    let mut next = self.config.data.clone();
                    next["imageOverrides"][&image.path] = json!(image.source);
                    match self.config.apply(&next) {
                        Ok(()) => {
                            self.mark_changed();
                            self.message = "Изображение применено; GIF сохраняет анимацию".into();
                        }
                        Err(error) => self.report(error),
                    }
                }
                Ok(_) => self.report("Шаблон сменился: повторите применение изображения".into()),
                Err(error) => self.report(error),
            }
        }
        self.elements.clear();
        if let Some(view) = status
            .views
            .first()
            .filter(|view| view.width > 0.0 && view.height > 0.0)
        {
            let screen = ctx.screen_rect();
            let scale = vec2(screen.width() / view.width, screen.height() / view.height);
            for element in &view.elements {
                let mut element = element.clone();
                element.x = screen.left() + element.x * scale.x;
                element.y = screen.top() + element.y * scale.y;
                element.width *= scale.x;
                element.height *= scale.y;
                element.parent_scale *= scale.x;
                element.parent_scale_y *= scale.y;
                self.elements.push(element);
            }
        }
        if self.menu_open {
            self.draw_menu(ctx);
            self.edit_layout(ctx);
            draw_cursor(ctx);
        } else {
            self.menu_rect = None;
            self.dragged_element.clear();
        }
        if self.save_due.is_some_and(|due| Instant::now() >= due)
            && let Err(error) = self.flush()
        {
            self.save_due = Some(Instant::now() + Duration::from_secs(5));
            self.report(error);
        }
        ctx.request_repaint_after(Duration::from_millis(16));
    }

    fn draw_menu(&mut self, ctx: &egui::Context) {
        let mut open = self.menu_open;
        let shown = egui::Window::new("HASSLE STUDIO")
            .id(Id::new("hassle-menu"))
            .open(&mut open)
            .collapsible(false)
            .default_size(vec2(850.0, 620.0))
            .min_size(vec2(560.0, 400.0))
            .show(ctx, |ui| {
                ui.horizontal_wrapped(|ui| {
                    for (index, label) in ["Шаблон", "Чат", "Время", "Изображения", "Расположение"]
                        .iter()
                        .enumerate()
                    {
                        ui.selectable_value(&mut self.section, index, *label);
                    }
                });
                ui.separator();
                egui::ScrollArea::vertical()
                    .id_salt(("settings", self.section))
                    .max_height((ui.available_height() - 65.0).max(100.0))
                    .auto_shrink([false, false])
                    .show(ui, |ui| match self.section {
                        0 => self.template_page(ui),
                        1 => self.widget_page(ui, "chat"),
                        2 => self.widget_page(ui, "clock"),
                        3 => self.images_page(ui),
                        _ => self.layout_page(ui),
                    });
                ui.separator();
                ui.label("ЛКМ вне меню — перемещение · Колесо — масштаб · Insert — скрыть меню");
                if !self.message.is_empty() {
                    ui.label(egui::RichText::new(&self.message).color(ACCENT));
                }
            });
        self.menu_open = open;
        self.menu_rect = shown.map(|shown| shown.response.rect);
    }

    fn template_page(&mut self, ui: &mut egui::Ui) {
        let current = self.config.template_id().to_owned();
        let mut selected = current.clone();
        let name = crate::templates::catalog()
            .iter()
            .find(|item| item.id == current)
            .map(|item| format!("{} · {}", item.name, item.edition))
            .unwrap_or_default();
        egui::ComboBox::from_id_salt("template")
            .selected_text(name)
            .width(420.0)
            .height(350.0)
            .show_ui(ui, |ui| {
                for item in crate::templates::catalog() {
                    ui.selectable_value(
                        &mut selected,
                        item.id.clone(),
                        format!("{} · {}", item.name, item.edition),
                    );
                }
            });
        if selected != current {
            match self.config.select_template(&selected) {
                Ok(()) => {
                    self.template_actions.clear();
                    self.template_options.clear();
                    self.resource.clear();
                    self.image_input.clear();
                    self.mark_changed();
                }
                Err(error) => self.report(error),
            }
        }
        ui.label("40 встроенных шаблонов. Настройки каждого сохраняются отдельно в init.ini.");
        for option in self.template_options.clone() {
            let index = option["index"].as_u64().unwrap_or(0) as usize;
            let label = option["label"].as_str().unwrap_or("Параметр");
            ui.push_id(index, |ui| match option["type"].as_u64().unwrap_or(2) {
                1 => {
                    let mut value = option["value"].as_bool().unwrap_or(false);
                    if ui.checkbox(&mut value, label).changed() {
                        self.template_actions.push((index, json!(value)));
                    }
                }
                0 => {
                    let mut value = option["value"].as_f64().unwrap_or(0.0);
                    if ui
                        .add(
                            egui::Slider::new(
                                &mut value,
                                option["min"].as_f64().unwrap_or(0.0)
                                    ..=option["max"].as_f64().unwrap_or(100.0),
                            )
                            .text(label),
                        )
                        .changed()
                    {
                        self.template_actions.push((index, json!(value)));
                    }
                }
                3 => {
                    let mut value = option["selected"].clone();
                    egui::ComboBox::from_id_salt("option")
                        .selected_text(label)
                        .show_ui(ui, |ui| {
                            for item in option["items"].as_array().into_iter().flatten() {
                                let name = item["value"]
                                    .as_str()
                                    .or_else(|| item["label"].as_str())
                                    .unwrap_or("Вариант");
                                if ui
                                    .selectable_value(&mut value, item["id"].clone(), name)
                                    .changed()
                                {
                                    self.template_actions.push((index, value.clone()));
                                }
                            }
                        });
                }
                _ => {
                    ui.label(label);
                }
            });
        }
        ui.separator();
        if ui.button("Сбросить настройки этого шаблона").clicked() {
            match self.config.reset_template() {
                Ok(()) => {
                    self.template_actions.clear();
                    self.refresh_requested = true;
                    self.mark_changed();
                }
                Err(error) => self.report(error),
            }
        }
        if ui.button("Перечитать init.ini").clicked() {
            match Config::load(&self.root) {
                Ok(config) => {
                    self.config = config;
                    self.template_actions.clear();
                    self.refresh_requested = true;
                    self.mark_changed();
                }
                Err(error) => self.report(error),
            }
        }
    }

    fn widget_page(&mut self, ui: &mut egui::Ui, group: &str) {
        let widget = &mut self.config.data["widgets"][group];
        let mut changed = false;
        let flags: &[(&str, &str)] = if group == "chat" {
            &[
                ("enabled", "Изменять оформление чата"),
                ("bold", "Жирный шрифт"),
            ]
        } else {
            &[
                ("enabled", "Показывать время"),
                ("bold", "Жирный шрифт"),
                ("seconds", "Секунды"),
                ("milliseconds", "Миллисекунды"),
                ("format24", "24-часовой формат"),
                ("date", "Показывать дату"),
                ("standalone", "Отдельные часы вместо часов шаблона"),
            ]
        };
        for (key, label) in flags {
            let mut value = widget[*key].as_bool().unwrap_or(false);
            if ui.checkbox(&mut value, *label).changed() {
                widget[*key] = json!(value);
                changed = true;
            }
        }
        let mut font = widget["font"].as_f64().unwrap_or(0.0) as usize;
        egui::ComboBox::from_id_salt("font")
            .selected_text(
                self.config
                    .font_names
                    .get(font)
                    .map(String::as_str)
                    .unwrap_or("Arial"),
            )
            .show_ui(ui, |ui| {
                for (index, name) in self.config.font_names.iter().enumerate() {
                    if ui.selectable_value(&mut font, index, name).changed() {
                        widget["font"] = json!(font);
                        changed = true;
                    }
                }
            });
        let sizes: &[(&str, &str, f64, f64)] = if group == "chat" {
            &[
                ("size", "Размер шрифта", 8.0, 48.0),
                ("lineHeight", "Высота строки", 10.0, 70.0),
                ("lines", "Строк", 1.0, 50.0),
                ("width", "Ширина", 100.0, 2500.0),
                ("x", "X", 0.0, 3000.0),
                ("y", "Y", 0.0, 2000.0),
                ("outline", "Обводка", 0.0, 8.0),
                ("opacity", "Непрозрачность", 0.0, 1.0),
            ]
        } else {
            &[
                ("size", "Размер отдельных часов", 8.0, 96.0),
                ("x", "X отдельных часов", 0.0, 3000.0),
                ("y", "Y отдельных часов", 0.0, 2000.0),
            ]
        };
        for (key, label, min, max) in sizes {
            let mut value = widget[*key].as_f64().unwrap_or(*min);
            if ui
                .add(egui::Slider::new(&mut value, *min..=*max).text(*label))
                .changed()
            {
                widget[*key] = if *key == "lines" {
                    json!(value.round() as u64)
                } else {
                    json!(value)
                };
                changed = true;
            }
        }
        if group == "clock" {
            ui.label("Встроенные часы сохраняют оформление шаблона. Если их нет, используются отдельные часы.");
        }
        if changed {
            self.mark_changed();
        }
    }

    fn images_page(&mut self, ui: &mut egui::Ui) {
        ui.label(
            "Замените существующее или отсутствующее изображение шаблона. PNG и анимированный GIF.",
        );
        ui.add(
            egui::TextEdit::singleline(&mut self.resource_filter).hint_text("Поиск пути ресурса"),
        );
        let paths = crate::templates::image_paths(self.config.template_id());
        egui::ScrollArea::vertical()
            .id_salt("resource-list")
            .max_height(180.0)
            .show(ui, |ui| {
                for path in paths
                    .iter()
                    .filter(|path| path.contains(&self.resource_filter))
                {
                    let missing = crate::templates::file(path).is_none();
                    let overridden = self.config.data["imageOverrides"].get(path).is_some();
                    let label = format!(
                        "{}{}{}",
                        if missing { "[нет] " } else { "" },
                        if overridden { "[замена] " } else { "" },
                        path
                    );
                    if ui.selectable_label(self.resource == *path, label).clicked() {
                        self.resource = path.clone();
                        self.image_input = self.config.data["imageOverrides"][path]
                            .as_str()
                            .unwrap_or("")
                            .to_owned();
                    }
                }
            });
        ui.add(
            egui::TextEdit::singleline(&mut self.resource)
                .hint_text("Путь, например oneas-img/hud/health.svg"),
        );
        ui.add(
            egui::TextEdit::multiline(&mut self.image_input)
                .desired_rows(5)
                .desired_width(f32::INFINITY)
                .hint_text("Base64 или data:image/png;base64,... / data:image/gif;base64,..."),
        );
        ui.horizontal(|ui| {
            if ui
                .add_enabled(
                    self.image_receiver.is_none(),
                    egui::Button::new("Применить"),
                )
                .clicked()
            {
                if !crate::images::valid_path(&self.resource) {
                    self.report("Некорректный путь ресурса".into());
                } else {
                    let path = self.resource.clone();
                    let source = self.image_input.clone();
                    let template = self.config.template_id().to_owned();
                    let (sender, receiver) = mpsc::channel();
                    self.image_receiver = Some(receiver);
                    self.image_worker = Some(std::thread::spawn(move || {
                        let result = crate::images::decode(&source).map(|(bytes, mime)| {
                            use base64::Engine;
                            ImageReplacement {
                                template,
                                path,
                                source: format!(
                                    "data:{mime};base64,{}",
                                    base64::engine::general_purpose::STANDARD.encode(bytes)
                                ),
                            }
                        });
                        let _ = sender.send(result);
                    }));
                }
            }
            if ui.button("Убрать замену").clicked()
                && self.config.data["imageOverrides"]
                    .as_object_mut()
                    .unwrap()
                    .remove(&self.resource)
                    .is_some()
            {
                self.image_input.clear();
                self.mark_changed();
            }
        });
        ui.label("До 2048×2048, 8 МиБ Base64 на файл; GIF — до 240 кадров. Замены отдельные для каждого шаблона.");
    }

    fn layout_page(&mut self, ui: &mut egui::Ui) {
        ui.label(
            "При открытом меню: ЛКМ по элементу — перемещение, колесо — масштаб. Alt не нужен.",
        );
        egui::ComboBox::from_id_salt("element")
            .selected_text(if self.selected_element.is_empty() {
                "Выберите элемент"
            } else {
                &self.selected_element
            })
            .show_ui(ui, |ui| {
                for element in &self.elements {
                    ui.selectable_value(
                        &mut self.selected_element,
                        element.id.clone(),
                        &element.label,
                    );
                }
            });
        if !self.selected_element.is_empty() {
            let layout = self.config.data["layouts"]
                .as_object_mut()
                .unwrap()
                .entry(self.selected_element.clone())
                .or_insert_with(|| json!({"x":0.0,"y":0.0,"scale":1.0}));
            let mut changed = false;
            for (key, label, min, max, default) in [
                ("x", "Смещение X", -10000.0, 10000.0, 0.0),
                ("y", "Смещение Y", -10000.0, 10000.0, 0.0),
                ("scale", "Масштаб", 0.25, 4.0, 1.0),
            ] {
                let mut value = layout[key].as_f64().unwrap_or(default);
                if ui
                    .add(egui::Slider::new(&mut value, min..=max).text(label))
                    .changed()
                {
                    layout[key] = json!(value);
                    changed = true;
                }
            }
            if ui.button("Сбросить элемент").clicked() {
                *layout = json!({"x":0.0,"y":0.0,"scale":1.0});
                changed = true;
            }
            if changed {
                self.mark_changed();
            }
        }
        if ui.button("Сбросить все положения").clicked() {
            self.config.data["layouts"] = json!({});
            self.mark_changed();
        }
    }

    fn edit_layout(&mut self, ctx: &egui::Context) {
        let (pointer, down, pressed, delta, wheel) = ctx.input(|i| {
            (
                i.pointer.hover_pos(),
                i.pointer.primary_down(),
                i.pointer.primary_pressed(),
                i.pointer.delta(),
                i.raw_scroll_delta.y,
            )
        });
        if !down && !self.dragged_element.is_empty() {
            self.dragged_element.clear();
            self.save_due = Some(Instant::now());
        }
        let Some(pointer) = pointer else { return };
        let candidate = if !self.dragged_element.is_empty() {
            self.elements.iter().find(|e| e.id == self.dragged_element)
        } else if self.menu_rect.is_none_or(|r| !r.contains(pointer)) && !ctx.is_pointer_over_area()
        {
            self.elements
                .iter()
                .filter(|e| {
                    e.width > 2.0
                        && e.height > 2.0
                        && Rect::from_min_size(pos2(e.x, e.y), vec2(e.width, e.height))
                            .contains(pointer)
                })
                .min_by(|a, b| (a.width * a.height).total_cmp(&(b.width * b.height)))
        } else {
            None
        };
        let Some(element) = candidate.cloned() else {
            return;
        };
        ctx.set_cursor_icon(egui::CursorIcon::Move);
        if pressed {
            self.dragged_element = element.id.clone();
            self.selected_element = element.id.clone();
        }
        if (!pressed && !self.dragged_element.is_empty() && delta != Vec2::ZERO) || wheel != 0.0 {
            let layout = self.config.data["layouts"]
                .as_object_mut()
                .unwrap()
                .entry(element.id.clone())
                .or_insert_with(|| json!({"x":0.0,"y":0.0,"scale":1.0}));
            if !pressed && !self.dragged_element.is_empty() {
                layout["x"] = json!(
                    (layout["x"].as_f64().unwrap_or(0.0)
                        + f64::from(delta.x / element.parent_scale.max(0.01)))
                    .clamp(-10000.0, 10000.0)
                );
                layout["y"] = json!(
                    (layout["y"].as_f64().unwrap_or(0.0)
                        + f64::from(delta.y / element.parent_scale_y.max(0.01)))
                    .clamp(-10000.0, 10000.0)
                );
            }
            if wheel != 0.0 {
                layout["scale"] = json!(
                    (layout["scale"].as_f64().unwrap_or(1.0)
                        * 1.08_f64.powf(f64::from(wheel / 40.0)))
                    .clamp(0.25, 4.0)
                );
                self.selected_element = element.id.clone();
            }
            self.mark_changed();
        }
        ctx.layer_painter(egui::LayerId::new(
            egui::Order::Foreground,
            Id::new("layout-highlight"),
        ))
        .rect_stroke(
            Rect::from_min_size(
                pos2(element.x, element.y),
                vec2(element.width, element.height),
            ),
            3.0,
            Stroke::new(1.5_f32, ACCENT),
            egui::StrokeKind::Outside,
        );
    }
}

impl Drop for App {
    fn drop(&mut self) {
        if let Some(worker) = self.image_worker.take() {
            let _ = worker.join();
        }
    }
}

fn draw_cursor(ctx: &egui::Context) {
    let Some(position) = ctx.input(|i| i.pointer.hover_pos()) else {
        return;
    };
    let painter = ctx.layer_painter(egui::LayerId::new(egui::Order::Tooltip, Id::new("cursor")));
    let points: Vec<Pos2> = [
        vec2(0.0, 0.0),
        vec2(0.0, 18.0),
        vec2(5.0, 13.0),
        vec2(10.0, 21.0),
        vec2(13.0, 19.0),
        vec2(8.0, 11.0),
        vec2(16.0, 11.0),
    ]
    .into_iter()
    .map(|p| position + p)
    .collect();
    painter.add(egui::Shape::closed_line(
        points.clone(),
        Stroke::new(3.0_f32, Color32::BLACK),
    ));
    painter.add(egui::Shape::line(
        points,
        Stroke::new(1.5_f32, Color32::WHITE),
    ));
}
