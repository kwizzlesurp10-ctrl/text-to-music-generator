#!/usr/bin/env python3
"""
Text-to-Music Generator using Meta's Audiocraft/MusicGen

This script generates music from text descriptions using the open-source
Audiocraft library. It reads prompts from a text file and outputs WAV files.

Requirements:
    pip install -U audiocraft torch torchaudio

Usage:
    python generate_music.py
"""

import os
import argparse
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import torch


def generate_music(prompts_file='prompts.txt', output_dir='output', 
                   model_size='small', duration=30, cfg_scale=3.5):
    """
    Generate music from text prompts.
    
    Args:
        prompts_file (str): Path to text file with prompts (one per line)
        output_dir (str): Directory to save generated music
        model_size (str): Model size - 'small', 'medium', 'melody', or 'large'
        duration (int): Duration of generated music in seconds
        cfg_scale (float): Classifier-free guidance scale (higher = more adherence to prompt)
    """
    # Setup device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Load model
    print(f"Loading MusicGen model: {model_size}...")
    model = MusicGen.get_pretrained(f'facebook/musicgen-{model_size}')
    model.set_generation_params(
        duration=duration,
        cfg_coef=cfg_scale,
        temperature=1.0,
        top_k=250,
        top_p=0.0
    )
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Read prompts
    if not os.path.exists(prompts_file):
        print(f"Error: {prompts_file} not found. Creating sample file...")
        with open(prompts_file, 'w') as f:
            f.write("upbeat electronic dance music with synth leads\n")
            f.write("calm acoustic guitar with gentle piano\n")
            f.write("epic orchestral soundtrack with drums and strings\n")
        print(f"Sample prompts created in {prompts_file}. Edit and run again.")
        return
    
    with open(prompts_file, 'r') as f:
        prompts = [line.strip() for line in f if line.strip()]
    
    print(f"\nGenerating {len(prompts)} tracks...\n")
    
    # Generate music for each prompt
    for i, prompt in enumerate(prompts, 1):
        print(f"[{i}/{len(prompts)}] Generating: '{prompt}'")
        
        # Generate
        wav = model.generate([prompt], progress=True)
        
        # Save
        safe_prompt = prompt[:30].replace(' ', '_').replace('/', '-')
        filename = f"{output_dir}/track_{i:02d}_{safe_prompt}"
        audio_write(filename, wav[0].cpu(), model.sample_rate, strategy="loudness")
        
        print(f"Saved: {filename}.wav\n")
    
    print(f"\nBatch complete! Generated {len(prompts)} tracks in '{output_dir}/'")


def main():
    parser = argparse.ArgumentParser(
        description='Generate music from text descriptions using MusicGen'
    )
    parser.add_argument(
        '--prompts', '-p',
        default='prompts.txt',
        help='Path to prompts file (default: prompts.txt)'
    )
    parser.add_argument(
        '--output', '-o',
        default='output',
        help='Output directory (default: output)'
    )
    parser.add_argument(
        '--model', '-m',
        default='small',
        choices=['small', 'medium', 'melody', 'large'],
        help='Model size (default: small)'
    )
    parser.add_argument(
        '--duration', '-d',
        type=int,
        default=30,
        help='Duration in seconds (default: 30)'
    )
    parser.add_argument(
        '--guidance', '-g',
        type=float,
        default=3.5,
        help='Guidance scale for prompt adherence (default: 3.5)'
    )
    
    args = parser.parse_args()
    
    generate_music(
        prompts_file=args.prompts,
        output_dir=args.output,
        model_size=args.model,
        duration=args.duration,
        cfg_scale=args.guidance
    )


if __name__ == '__main__':
    main()
