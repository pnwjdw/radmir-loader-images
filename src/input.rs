use egui::{Event, Key, Modifiers, PointerButton, pos2};
use std::ffi::c_void;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicIsize, AtomicU32, Ordering};

type WndProc = unsafe extern "system" fn(isize, u32, usize, isize) -> isize;
static PREVIOUS: AtomicIsize = AtomicIsize::new(0);
static CAPTURE: AtomicBool = AtomicBool::new(false);
static HOTKEY: AtomicU32 = AtomicU32::new(0x2d);
static EVENTS: Mutex<Vec<Event>> = Mutex::new(Vec::new());
static TOGGLE: AtomicBool = AtomicBool::new(false);
const DETACH: u32 = 0x8000 + 0x531;

#[repr(C)]
#[derive(Default)]
struct Point {
    x: i32,
    y: i32,
}
#[repr(C)]
#[derive(Default, Clone, Copy)]
struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[link(name = "user32")]
unsafe extern "system" {
    fn EnumWindows(
        callback: unsafe extern "system" fn(isize, isize) -> i32,
        parameter: isize,
    ) -> i32;
    fn GetWindowThreadProcessId(window: isize, process: *mut u32) -> u32;
    fn IsWindowVisible(window: isize) -> i32;
    fn GetWindow(window: isize, command: u32) -> isize;
    fn GetClientRect(window: isize, rect: *mut Rect) -> i32;
    fn GetWindowLongPtrW(window: isize, index: i32) -> isize;
    fn SetWindowLongPtrW(window: isize, index: i32, value: isize) -> isize;
    fn CallWindowProcW(
        procedure: Option<WndProc>,
        window: isize,
        message: u32,
        wparam: usize,
        lparam: isize,
    ) -> isize;
    fn GetForegroundWindow() -> isize;
    fn GetCursorPos(point: *mut Point) -> i32;
    fn ScreenToClient(window: isize, point: *mut Point) -> i32;
    fn GetAsyncKeyState(key: i32) -> i16;
    fn GetClipCursor(rect: *mut Rect) -> i32;
    fn ClipCursor(rect: *const Rect) -> i32;
    fn SetCursor(cursor: isize) -> isize;
    fn GetCursor() -> isize;
    fn LoadCursorW(instance: isize, name: *const u16) -> isize;
    fn SendMessageTimeoutW(
        window: isize,
        message: u32,
        wparam: usize,
        lparam: isize,
        flags: u32,
        timeout: u32,
        result: *mut usize,
    ) -> isize;
}

pub fn modifiers() -> Modifiers {
    let down = |key| unsafe { GetAsyncKeyState(key) } < 0;
    Modifiers {
        alt: down(0x12),
        ctrl: down(0x11),
        shift: down(0x10),
        mac_cmd: false,
        command: down(0x11),
    }
}

fn key(code: usize) -> Option<Key> {
    Some(match code {
        0x08 => Key::Backspace,
        0x09 => Key::Tab,
        0x0d => Key::Enter,
        0x1b => Key::Escape,
        0x20 => Key::Space,
        0x21 => Key::PageUp,
        0x22 => Key::PageDown,
        0x23 => Key::End,
        0x24 => Key::Home,
        0x25 => Key::ArrowLeft,
        0x26 => Key::ArrowUp,
        0x27 => Key::ArrowRight,
        0x28 => Key::ArrowDown,
        0x2d => Key::Insert,
        0x2e => Key::Delete,
        0x41 => Key::A,
        0x43 => Key::C,
        0x56 => Key::V,
        0x58 => Key::X,
        0x59 => Key::Y,
        0x5a => Key::Z,
        _ => return None,
    })
}

unsafe extern "system" fn procedure(
    window: isize,
    message: u32,
    wparam: usize,
    lparam: isize,
) -> isize {
    if message == DETACH && wparam == procedure as *const c_void as usize {
        if unsafe { GetWindowLongPtrW(window, -4) } != procedure as *const c_void as isize {
            return 0;
        }
        if unsafe { SetWindowLongPtrW(window, -4, PREVIOUS.load(Ordering::Acquire)) } == 0 {
            return 0;
        }
        return 1;
    }
    if (message == 0x100 || message == 0x104)
        && wparam as u32 == HOTKEY.load(Ordering::Relaxed)
        && lparam & (1 << 30) == 0
    {
        TOGGLE.store(true, Ordering::Release);
        return 0;
    }
    if CAPTURE.load(Ordering::Acquire) {
        if let Ok(mut events) = EVENTS.lock()
            && events.len() < 4096
        {
            match message {
                0x100 | 0x101 | 0x104 | 0x105 => {
                    if message == 0x100 && wparam == 0x56 && modifiers().ctrl {
                        if let Some(text) = clipboard_text() {
                            events.push(Event::Paste(text));
                        }
                        return 0;
                    }
                    if let Some(key) = key(wparam) {
                        events.push(Event::Key {
                            key,
                            physical_key: None,
                            pressed: message == 0x100 || message == 0x104,
                            repeat: lparam & (1 << 30) != 0,
                            modifiers: modifiers(),
                        });
                    }
                }
                0x102 => {
                    if let Some(character) =
                        char::from_u32(wparam as u32).filter(|c| !c.is_control())
                    {
                        events.push(Event::Text(character.to_string()));
                    }
                }
                0x20a => events.push(Event::MouseWheel {
                    unit: egui::MouseWheelUnit::Point,
                    delta: egui::vec2(0.0, ((wparam >> 16) as u16 as i16) as f32 * 0.35),
                    modifiers: modifiers(),
                }),
                _ => {}
            }
        }
        if message == 0x20 {
            unsafe {
                SetCursor(LoadCursorW(0, 32512usize as *const u16));
            }
            return 1;
        }
        if (0x100..=0x109).contains(&message)
            || (0x200..=0x20e).contains(&message)
            || message == 0xff
        {
            return 0;
        }
    }
    let previous = PREVIOUS.load(Ordering::Acquire);
    unsafe {
        CallWindowProcW(
            (previous != 0).then(|| std::mem::transmute::<isize, WndProc>(previous)),
            window,
            message,
            wparam,
            lparam,
        )
    }
}

fn clipboard_text() -> Option<String> {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn OpenClipboard(window: isize) -> i32;
        fn CloseClipboard() -> i32;
        fn GetClipboardData(format: u32) -> isize;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GlobalLock(memory: isize) -> *const u16;
        fn GlobalUnlock(memory: isize) -> i32;
        fn GlobalSize(memory: isize) -> usize;
    }
    unsafe {
        if OpenClipboard(0) == 0 {
            return None;
        }
        let handle = GetClipboardData(13);
        let size = if handle != 0 { GlobalSize(handle) } else { 0 };
        let text = if size > 0 && size <= 16_777_216 {
            let pointer = GlobalLock(handle);
            if pointer.is_null() {
                None
            } else {
                let buffer = std::slice::from_raw_parts(pointer, size / 2);
                let length = buffer
                    .iter()
                    .position(|&value| value == 0)
                    .unwrap_or(buffer.len());
                let text = String::from_utf16_lossy(&buffer[..length]);
                GlobalUnlock(handle);
                Some(text)
            }
        } else {
            None
        };
        CloseClipboard();
        text
    }
}

unsafe extern "system" fn find_window(window: isize, parameter: isize) -> i32 {
    let (pid, found) = unsafe { &mut *(parameter as *mut (u32, isize)) };
    let mut owner = 0;
    unsafe {
        GetWindowThreadProcessId(window, &mut owner);
    }
    if owner == *pid
        && unsafe { IsWindowVisible(window) } != 0
        && unsafe { GetWindow(window, 4) } == 0
    {
        let mut rect = Rect::default();
        unsafe {
            GetClientRect(window, &mut rect);
        }
        if rect.right >= 640 && rect.bottom >= 480 {
            *found = window;
            return 0;
        }
    }
    1
}

pub struct Input {
    window: isize,
    buttons: [bool; 2],
    clip: Rect,
    cursor: isize,
    captured: bool,
}

impl Input {
    pub fn new(pid: u32) -> Result<Self, String> {
        let mut target = (pid, 0isize);
        unsafe {
            EnumWindows(find_window, &mut target as *mut _ as isize);
        }
        if target.1 == 0 {
            return Err("Окно Hassle не найдено".into());
        }
        let original = unsafe { GetWindowLongPtrW(target.1, -4) };
        if original == 0 {
            return Err("Не удалось прочитать оконную процедуру Hassle".into());
        }
        PREVIOUS.store(original, Ordering::Release);
        if unsafe { SetWindowLongPtrW(target.1, -4, procedure as *const c_void as isize) } == 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
        Ok(Self {
            window: target.1,
            buttons: [false; 2],
            clip: Rect::default(),
            cursor: 0,
            captured: false,
        })
    }

    pub fn capture(&mut self, visible: bool) {
        if self.window == 0 {
            return;
        }
        let active = visible && unsafe { GetForegroundWindow() } == self.window;
        if active && !self.captured {
            unsafe {
                GetClipCursor(&mut self.clip);
            }
            self.cursor = unsafe { GetCursor() };
        }
        if active {
            unsafe {
                ClipCursor(std::ptr::null());
            }
        }
        if !active && self.captured {
            unsafe {
                ClipCursor(&self.clip);
                SetCursor(self.cursor);
            }
            if let Ok(mut events) = EVENTS.lock() {
                events.push(Event::PointerGone);
            }
        }
        self.captured = active;
        CAPTURE.store(active, Ordering::Release);
    }

    pub fn take(&mut self, scale: f32, viewport: [u32; 2]) -> Vec<Event> {
        let mut events = EVENTS
            .lock()
            .map(|mut events| std::mem::take(&mut *events))
            .unwrap_or_default();
        if self.captured {
            let mut point = Point::default();
            unsafe {
                GetCursorPos(&mut point);
                ScreenToClient(self.window, &mut point);
            }
            let mut rect = Rect::default();
            unsafe {
                GetClientRect(self.window, &mut rect);
            }
            let position = pos2(
                point.x as f32 * viewport[0] as f32
                    / (rect.right - rect.left).max(1) as f32
                    / scale,
                point.y as f32 * viewport[1] as f32
                    / (rect.bottom - rect.top).max(1) as f32
                    / scale,
            );
            events.push(Event::PointerMoved(position));
            for (index, code) in [1, 2].into_iter().enumerate() {
                let pressed = unsafe { GetAsyncKeyState(code) } < 0;
                if pressed != self.buttons[index] {
                    events.push(Event::PointerButton {
                        pos: position,
                        button: if index == 0 {
                            PointerButton::Primary
                        } else {
                            PointerButton::Secondary
                        },
                        pressed,
                        modifiers: modifiers(),
                    });
                    self.buttons[index] = pressed;
                }
            }
        }
        events
    }

    pub fn toggle(&self) -> bool {
        TOGGLE.swap(false, Ordering::AcqRel)
    }
    pub fn hotkey(&self, code: u32) {
        HOTKEY.store(code, Ordering::Release);
    }

    pub fn detach(&mut self) -> Result<(), String> {
        self.capture(false);
        if self.window == 0 {
            return Ok(());
        }
        if unsafe { GetWindowLongPtrW(self.window, -4) } != procedure as *const c_void as isize {
            return Err(
                "Оконная процедура изменена другим модулем. Выгрузка DLL заблокирована".into(),
            );
        }
        let mut result = 0;
        let completed = unsafe {
            SendMessageTimeoutW(
                self.window,
                DETACH,
                procedure as *const c_void as usize,
                0,
                0x2,
                5000,
                &mut result,
            )
        };
        if completed == 0 || result != 1 {
            return Err("Не удалось безопасно снять обработчик ввода. DLL оставлена в игре".into());
        }
        self.window = 0;
        if let Ok(mut events) = EVENTS.lock() {
            events.clear();
        }
        Ok(())
    }
}

impl Drop for Input {
    fn drop(&mut self) {
        let _ = self.detach();
    }
}
