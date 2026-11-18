mod windows;

use std::path::Path;

fn run(root: &Path, arguments: &[String]) -> Result<String, String> {
    if arguments.iter().any(|argument| argument == "--help") {
        return Ok("HassleStudioLauncher [--pid PID] [--quiet] [--show | --hide | --status | --reload | --stop | --unload]".into());
    }
    let selected = arguments
        .iter()
        .position(|argument| argument == "--pid")
        .map(|index| {
            arguments
                .get(index + 1)
                .ok_or("Missing PID")
                .and_then(|value| value.parse::<u32>().map_err(|_| "Invalid PID"))
        })
        .transpose()?;
    let candidates = selected
        .map(|pid| vec![pid])
        .unwrap_or(windows::processes()?);
    let mut games = Vec::new();
    for pid in candidates {
        let process = windows::open_process(0x1000, pid);
        if process.0 == 0 {
            continue;
        }
        let path = windows::path_of(process.0)?;
        if path.file_name().is_some_and(|name| {
            name.to_string_lossy()
                .eq_ignore_ascii_case("HassleOnline-Win64-Shipping.exe")
        }) {
            games.push(pid);
        }
    }
    if games.len() != 1 {
        return Err(
            "Запустите Hassle Online x64. Если запущено несколько игр, укажите --pid PID".into(),
        );
    }
    let pid = games[0];
    let dll = root.join("HassleStudio.dll");
    let bytes = std::fs::read(&dll).map_err(|error| format!("{}: {error}", dll.display()))?;
    let pe = bytes
        .get(60..64)
        .map(|bytes| u32::from_le_bytes(bytes.try_into().unwrap()) as usize)
        .ok_or("Invalid DLL")?;
    if bytes.get(pe..pe + 4) != Some(b"PE\0\0")
        || bytes.get(pe + 4..pe + 6) != Some(&0x8664u16.to_le_bytes())
    {
        return Err("Требуется DLL x64".into());
    }
    let modules = windows::modules(pid)?;
    let existing = modules
        .iter()
        .find(|(name, _, _)| name.eq_ignore_ascii_case("HassleStudio.dll"));
    let operation = if arguments
        .iter()
        .any(|argument| argument == "--unload" || argument == "--stop")
    {
        "HassleStudioStop"
    } else if arguments.iter().any(|argument| argument == "--status") {
        "HassleStudioState"
    } else if arguments
        .iter()
        .any(|argument| argument == "--show" || argument == "--hide")
    {
        "HassleStudioMenu"
    } else if arguments.iter().any(|argument| argument == "--reload") {
        "HassleStudioReload"
    } else {
        "HassleStudioStart"
    };
    if existing.is_none() && operation != "HassleStudioStart" {
        return Err("Модуль не загружен".into());
    }
    let process = windows::open_process(0x43a, pid);
    if process.0 == 0 {
        return Err(windows::win_error("Open Hassle"));
    }
    let base = if let Some((_, path, base)) = existing {
        if !path.eq_ignore_ascii_case(&dll.to_string_lossy()) {
            return Err("Другая копия HassleStudio уже загружена".into());
        }
        *base
    } else {
        windows::load(process.0, pid, &dll)?
    };
    let parameter = usize::from(arguments.iter().any(|argument| argument == "--show"));
    let code = windows::thread(
        process.0,
        base + windows::export_offset(&dll, operation)?,
        parameter,
    )?;
    if operation != "HassleStudioState" && code != 0 {
        return Err(format!("{operation}: {code}"));
    }
    if arguments.iter().any(|argument| argument == "--unload") {
        windows::unload(process.0, pid, base)?;
        if windows::modules(pid)?
            .iter()
            .any(|(name, _, _)| name.eq_ignore_ascii_case("HassleStudio.dll"))
        {
            return Err(
                "DLL осталась загружена: обнаружена дополнительная ссылка на модуль".into(),
            );
        }
        return Ok("HassleStudio выгружен. Оригинальный интерфейс восстановлен".into());
    }
    Ok(format!("{operation}: {code}, PID {pid}"))
}

fn main() {
    let arguments: Vec<_> = std::env::args().skip(1).collect();
    let root = std::env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(Path::to_owned))
        .unwrap_or_default();
    match run(&root, &arguments) {
        Ok(message) => println!("{message}"),
        Err(error) => {
            eprintln!("{error}");
            if !arguments.iter().any(|argument| argument == "--quiet") {
                windows::show_message(&error, true);
            }
            std::process::exit(1);
        }
    }
}
