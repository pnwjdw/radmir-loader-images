#![cfg(target_os = "windows")]
#![allow(non_snake_case)]

#[cfg(not(target_arch = "x86_64"))]
compile_error!("Hassle Studio requires Windows x64");

#[path = "resources.rs"]
mod assets;
mod bridge;
mod compositor;
mod graphics;
mod images;
mod input;
mod raster;
mod settings;
mod templates;
mod ui;

use std::ffi::c_void;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicIsize, AtomicU32, Ordering};

static MODULE: AtomicIsize = AtomicIsize::new(0);
static STOP: AtomicBool = AtomicBool::new(false);
static ACTIVE: AtomicBool = AtomicBool::new(false);
static RESULT: AtomicU32 = AtomicU32::new(0);
static WORKER: Mutex<isize> = Mutex::new(0);

#[link(name = "kernel32")]
unsafe extern "system" {
    fn CreateThread(
        attributes: *const c_void,
        stack: usize,
        entry: unsafe extern "system" fn(*mut c_void) -> u32,
        parameter: *mut c_void,
        flags: u32,
        id: *mut u32,
    ) -> isize;
    fn GetModuleHandleExW(flags: u32, address: *const u16, module: *mut isize) -> i32;
    fn GetModuleFileNameW(module: isize, buffer: *mut u16, length: u32) -> u32;
    fn FreeLibrary(module: isize) -> i32;
    fn FreeLibraryAndExitThread(module: isize, code: u32) -> !;
    fn WaitForSingleObject(handle: isize, milliseconds: u32) -> u32;
    fn CloseHandle(handle: isize) -> i32;
    fn DisableThreadLibraryCalls(module: isize) -> i32;
}

fn directory() -> std::path::PathBuf {
    let mut path = vec![0u16; 32768];
    let length = unsafe {
        GetModuleFileNameW(
            MODULE.load(Ordering::Acquire),
            path.as_mut_ptr(),
            path.len() as u32,
        )
    };
    std::path::PathBuf::from(String::from_utf16_lossy(&path[..length as usize]))
        .parent()
        .unwrap_or(std::path::Path::new("."))
        .to_owned()
}

unsafe extern "system" fn worker(parameter: *mut c_void) -> u32 {
    let root = directory();
    let outcome = std::panic::catch_unwind(|| graphics::run(root, &STOP));
    let code = match outcome {
        Ok(Ok(())) => 0,
        Ok(Err(error)) => {
            graphics::set_error(error);
            31
        }
        Err(_) => {
            graphics::set_error("Rust worker panic".into());
            31
        }
    };
    RESULT.store(code, Ordering::Release);
    ACTIVE.store(false, Ordering::Release);
    unsafe { FreeLibraryAndExitThread(parameter as isize, code) }
}

#[unsafe(no_mangle)]
pub extern "system" fn DllMain(module: isize, reason: u32, _: *mut c_void) -> i32 {
    if reason == 1 {
        MODULE.store(module, Ordering::Release);
        unsafe {
            DisableThreadLibraryCalls(module);
        }
    }
    if reason == 0 {
        STOP.store(true, Ordering::Release);
    }
    1
}

#[unsafe(no_mangle)]
pub extern "system" fn HassleStudioStart(_: *mut c_void) -> u32 {
    let Ok(mut slot) = WORKER.lock() else {
        return 31;
    };
    if ACTIVE.load(Ordering::Acquire) {
        graphics::set_visible(true);
        return 0;
    }
    if RESULT.load(Ordering::Acquire) != 0 {
        return RESULT.load(Ordering::Acquire);
    }
    if *slot != 0 {
        unsafe {
            CloseHandle(*slot);
        }
        *slot = 0;
    }
    let mut reference = 0;
    if unsafe { GetModuleHandleExW(4, worker as *const u16, &mut reference) } == 0 {
        return 31;
    }
    STOP.store(false, Ordering::Release);
    ACTIVE.store(true, Ordering::Release);
    let thread = unsafe {
        CreateThread(
            std::ptr::null(),
            0,
            worker,
            reference as *mut c_void,
            0,
            std::ptr::null_mut(),
        )
    };
    if thread == 0 {
        ACTIVE.store(false, Ordering::Release);
        unsafe {
            FreeLibrary(reference);
        }
        return 31;
    }
    *slot = thread;
    0
}

#[unsafe(no_mangle)]
pub extern "system" fn HassleStudioStop(_: *mut c_void) -> u32 {
    let Ok(mut slot) = WORKER.lock() else {
        return 31;
    };
    STOP.store(true, Ordering::Release);
    if *slot == 0 {
        return RESULT.load(Ordering::Acquire);
    }
    if unsafe { WaitForSingleObject(*slot, 20000) } != 0 {
        return 21;
    }
    unsafe {
        CloseHandle(*slot);
    }
    *slot = 0;
    RESULT.load(Ordering::Acquire)
}

#[unsafe(no_mangle)]
pub extern "system" fn HassleStudioState(_: *mut c_void) -> u32 {
    graphics::state()
}

#[unsafe(no_mangle)]
pub extern "system" fn HassleStudioMenu(parameter: *mut c_void) -> u32 {
    graphics::set_visible(!parameter.is_null());
    0
}

#[unsafe(no_mangle)]
pub extern "system" fn HassleStudioReload(_: *mut c_void) -> u32 {
    graphics::reload();
    0
}
