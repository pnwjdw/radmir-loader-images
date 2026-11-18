use std::{env, fs, path::Path};

fn walk(root: &Path, folder: &Path, output: &mut String) {
    let mut entries: Vec<_> = fs::read_dir(folder)
        .unwrap()
        .map(|e| e.unwrap().path())
        .collect();
    entries.sort();
    for path in entries {
        if path.is_dir() {
            walk(root, &path, output);
        } else {
            let name = path
                .strip_prefix(root)
                .unwrap()
                .to_string_lossy()
                .replace('\\', "/");
            let absolute = fs::canonicalize(&path)
                .unwrap()
                .to_string_lossy()
                .into_owned();
            output.push_str(&format!("({name:?}, include_bytes!({absolute:?})),\n"));
        }
    }
}

fn main() {
    println!("cargo:rerun-if-changed=assets/templates");
    let root = Path::new("assets/templates");
    let mut output = String::from("pub const FILES: &[(&str, &[u8])] = &[\n");
    walk(root, root, &mut output);
    output.push_str("];\n");
    fs::write(
        Path::new(&env::var("OUT_DIR").unwrap()).join("embedded.rs"),
        output,
    )
    .unwrap();
}
