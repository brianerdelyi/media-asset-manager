//! Platform-specific drive operations.
//! Version 1.0.0 implements macOS only.
use std::path::Path;

pub fn get_drive_uuid(path: &Path) -> Result<String, crate::error::AppError> {
    #[cfg(target_os = "macos")]
    { get_volume_uuid_macos(path) }

    #[cfg(target_os = "windows")]
    { let _ = path; Err(crate::error::AppError::NotImplemented("Windows drive UUID planned for future release".to_string())) }

    #[cfg(target_os = "linux")]
    { let _ = path; Err(crate::error::AppError::NotImplemented("Linux drive UUID planned for future release".to_string())) }
}

pub fn open_with_default_app(path: &Path) -> Result<(), crate::error::AppError> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open").arg(path).spawn()
            .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    { let _ = path; Err(crate::error::AppError::NotImplemented("open_with_default_app planned for future release".to_string())) }
}

pub fn reveal_in_file_manager(path: &Path) -> Result<(), crate::error::AppError> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open").args(["-R", &path.to_string_lossy()]).spawn()
            .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    { let _ = path; Err(crate::error::AppError::NotImplemented("reveal_in_file_manager planned for future release".to_string())) }
}

#[cfg(target_os = "macos")]
fn get_volume_uuid_macos(path: &Path) -> Result<String, crate::error::AppError> {
    let output = std::process::Command::new("diskutil")
        .args(["info", "-plist", &path.to_string_lossy()])
        .output()
        .map_err(|e| crate::error::AppError::Filesystem(format!("diskutil failed: {}", e)))?;
    if !output.status.success() {
        return Ok(format!("path:{}", path.to_string_lossy()));
    }
    let plist_str = String::from_utf8_lossy(&output.stdout);
    if let Some(uuid) = extract_plist_string(&plist_str, "VolumeUUID") {
        return Ok(uuid);
    }
    Ok(format!("path:{}", path.to_string_lossy()))
}

#[cfg(target_os = "macos")]
fn extract_plist_string(plist: &str, key: &str) -> Option<String> {
    let key_tag = format!("<key>{}</key>", key);
    let pos = plist.find(&key_tag)?;
    let after_key = &plist[pos + key_tag.len()..];
    let start = after_key.find("<string>")? + "<string>".len();
    let end = after_key[start..].find("</string>")?;
    Some(after_key[start..start + end].trim().to_string())
}
