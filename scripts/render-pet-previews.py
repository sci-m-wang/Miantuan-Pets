#!/usr/bin/env python3
"""Render homepage APNG previews from Codex pet spritesheets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

CELL_WIDTH = 192
CELL_HEIGHT = 208
IDLE_FRAMES = 6
IDLE_DURATIONS = [280, 110, 110, 140, 140, 320]


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def crop_idle_frames(spritesheet: Path) -> list[Image.Image]:
    with Image.open(spritesheet) as opened:
        atlas = opened.convert("RGBA")

    frames: list[Image.Image] = []
    for index in range(IDLE_FRAMES):
        left = index * CELL_WIDTH
        frame = atlas.crop((left, 0, left + CELL_WIDTH, CELL_HEIGHT))
        frames.append(remove_chroma_edge(frame))
    return frames


def remove_chroma_edge(frame: Image.Image) -> Image.Image:
    image = frame.copy()
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0:
                continue
            neon_green = green > 150 and green > red * 1.45 and green > blue * 1.45
            neon_magenta = red > 150 and blue > 130 and green < 130 and red > green * 1.4 and blue > green * 1.2
            if neon_green or neon_magenta:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def save_preview(frames: list[Image.Image], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        output,
        format="PNG",
        save_all=True,
        append_images=frames[1:],
        duration=IDLE_DURATIONS,
        loop=0,
        disposal=2,
        optimize=False,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    index = read_json(root / "data/pets/index.json")
    rendered = []

    for item in index["pets"]:
        pet = read_json(root / (item.get("entry") or f"data/pets/{item['id']}.json"))
        spritesheet = root / pet["assets"]["spritesheet"]
        output = root / f"assets/pets/{pet['id']}/animated-preview.png"
        save_preview(crop_idle_frames(spritesheet), output)
        rendered.append(str(output.relative_to(root)))

    print(json.dumps({"ok": True, "rendered": rendered}, indent=2))


if __name__ == "__main__":
    main()
