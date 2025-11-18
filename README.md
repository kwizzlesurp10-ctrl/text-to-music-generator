# 🎵 Cuddly Tribble - AI Music Generation

> **Transform text into music with Meta's Audiocraft/MusicGen**

Cuddly Tribble is an open-source text-to-music generator that leverages Meta's powerful Audiocraft library and MusicGen models to create high-quality music from simple text descriptions.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

## ✨ Features

- 🎹 **Multiple Model Sizes**: Choose from small (fast), medium (balanced), melody (conditional), or large (highest quality)
- 📝 **Batch Processing**: Generate multiple tracks from a simple text file
- ⚙️ **Configurable Parameters**: Fine-tune duration, guidance scale, and generation settings
- 🚀 **GPU Accelerated**: Automatic CUDA detection for faster generation
- 💾 **Professional Output**: High-quality WAV files with loudness normalization
- 🎨 **Prompt Engineering**: Advanced text conditioning for precise musical control

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- CUDA-capable GPU (recommended, but CPU works too)
- 8GB+ RAM (16GB+ recommended for large models)

### Installation

```bash
# Clone the repository
git clone https://github.com/kwizzlesurp10-ctrl/cuddly-tribble.git
cd cuddly-tribble

# Install dependencies
pip install -r requirements.txt

# For GPU support (optional but recommended)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### Basic Usage

```bash
# Generate music with default settings
python generate_music.py

# Use a specific model size
python generate_music.py --model medium

# Generate longer tracks (60 seconds)
python generate_music.py --duration 60

# Increase prompt adherence
python generate_music.py --guidance 5.0
```

### Creating Custom Prompts

Create a `prompts.txt` file with your desired music descriptions (one per line):

```text
upbeat electronic dance music with synth leads and heavy bass
calm acoustic guitar with gentle piano and soft strings
epic orchestral soundtrack with dramatic drums and brass
lo-fi hip hop beats with vinyl crackle and mellow vibes
jazzy saxophone solo over smooth double bass
```

Then run:

```bash
python generate_music.py --prompts prompts.txt --output my_music/
```

## 📖 Documentation

### Model Sizes

| Model | Parameters | VRAM | Generation Speed | Quality |
|-------|------------|------|------------------|----------|
| **small** | 300M | ~4GB | Fast | Good |
| **medium** | 1.5B | ~10GB | Moderate | Great |
| **melody** | 3.3B | ~16GB | Slow | Excellent (with melody conditioning) |
| **large** | 3.3B+ | ~24GB | Slowest | Best |

### Command Line Options

```bash
python generate_music.py [OPTIONS]

Options:
  -p, --prompts FILE     Path to prompts file (default: prompts.txt)
  -o, --output DIR       Output directory (default: output)
  -m, --model SIZE       Model size: small/medium/melody/large (default: small)
  -d, --duration SECS    Duration in seconds (default: 30)
  -g, --guidance FLOAT   Guidance scale 1.0-7.0 (default: 3.5)
```

### Prompt Engineering Tips

- **Be specific**: "upbeat 80s synthwave with driving bassline" works better than "synthwave"
- **Include instruments**: Mention specific instruments for better control
- **Set the mood**: Descriptors like "energetic", "melancholic", "chill" help guide the output
- **Add genre markers**: "in the style of X" or "Y-inspired" can be effective
- **Experiment**: Try different phrasings and combinations

## 🎼 Example Outputs

Generated tracks will be saved as:
```
output/
├── track_01_upbeat_electronic_dance.wav
├── track_02_calm_acoustic_guitar.wav
└── track_03_epic_orchestral.wav
```

## 🔧 Advanced Configuration

### Using Different Generation Parameters

```python
from generate_music import generate_music

generate_music(
    prompts_file='my_prompts.txt',
    output_dir='compositions',
    model_size='large',
    duration=90,
    cfg_scale=4.5  # Higher values = more adherence to prompt
)
```

### Melody Conditioning (experimental)

Use the `melody` model to condition generation on a reference melody:

```python
# Coming soon: melody conditioning support
```

## 🛠️ Technical Details

### Architecture

- **Base Model**: Meta's MusicGen (autoregressive transformer)
- **Audio Codec**: EnCodec for efficient audio tokenization
- **Conditioning**: T5/FLAN-T5 text encoder + EnCLAP
- **Output**: 32kHz stereo WAV files

### How It Works

1. Text prompt is encoded using T5 language model
2. MusicGen generates compressed audio tokens autoregressively
3. EnCodec decoder converts tokens back to high-quality audio
4. Output is normalized and saved as WAV

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- [ ] Melody conditioning interface
- [ ] Web UI for easier interaction
- [ ] Batch generation optimization
- [ ] Model fine-tuning scripts
- [ ] Additional output formats (MP3, FLAC)
- [ ] Real-time generation preview

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Meta AI for the incredible [Audiocraft](https://github.com/facebookresearch/audiocraft) library
- MusicGen paper: [Simple and Controllable Music Generation](https://arxiv.org/abs/2306.05284)
- Hugging Face for model hosting and distribution

## 🔗 Links

- [MusicGen Demo](https://huggingface.co/spaces/facebook/MusicGen)
- [Audiocraft Documentation](https://github.com/facebookresearch/audiocraft)
- [Paper (arXiv)](https://arxiv.org/abs/2306.05284)

## ⚠️ Limitations

- Generation can be slow on CPU (GPU highly recommended)
- Large models require significant VRAM (16GB+)
- Output quality varies with prompt specificity
- No real-time generation (yet)
- Limited to instrumental music (no vocals)

---

**Made with ❤️ for AI music enthusiasts | Star ⭐ if you found this useful!**
