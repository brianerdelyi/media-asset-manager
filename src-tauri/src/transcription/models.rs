//! Whisper model definitions and management.
use serde::Serialize;

/// All available GGML whisper models.
pub struct ModelDef {
    pub name: &'static str,
    pub filename: &'static str,
    pub size_bytes: u64,
    pub url: &'static str,
    /// Real-time factor on Apple M1 (1.0 = real-time, 0.1 = 10× faster)
    pub rtf: f32,
}

pub const MODELS: &[ModelDef] = &[
    ModelDef {
        name: "tiny",
        filename: "ggml-tiny.bin",
        size_bytes: 77_704_512,
        url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
        rtf: 0.05,
    },
    ModelDef {
        name: "base",
        filename: "ggml-base.bin",
        size_bytes: 147_964_211,
        url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        rtf: 0.10,
    },
    ModelDef {
        name: "small",
        filename: "ggml-small.bin",
        size_bytes: 487_601_152,
        url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
        rtf: 0.25,
    },
    ModelDef {
        name: "medium",
        filename: "ggml-medium.bin",
        size_bytes: 1_533_763_584,
        url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
        rtf: 0.60,
    },
    ModelDef {
        name: "large-v3",
        filename: "ggml-large-v3.bin",
        size_bytes: 3_094_623_691,
        url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin",
        rtf: 1.20,
    },
];

#[derive(Debug, Serialize, Clone)]
pub struct ModelInfo {
    pub name: String,
    pub filename: String,
    pub size_bytes: u64,
    pub installed: bool,
    pub path: Option<String>,
    pub rtf: f32,
}

/// Returns all models with installed status based on files present in models_dir.
pub fn list_models(models_dir: &std::path::Path) -> Vec<ModelInfo> {
    MODELS.iter().map(|def| {
        let path = models_dir.join(def.filename);
        let installed = path.exists();
        ModelInfo {
            name: def.name.to_string(),
            filename: def.filename.to_string(),
            size_bytes: def.size_bytes,
            installed,
            path: if installed { path.to_str().map(|s| s.to_string()) } else { None },
            rtf: def.rtf,
        }
    }).collect()
}

/// Returns the RTF for a given model name, defaulting to 0.5 if unknown.
pub fn get_rtf(model_name: &str) -> f32 {
    MODELS.iter()
        .find(|m| m.name == model_name)
        .map(|m| m.rtf)
        .unwrap_or(0.5)
}
