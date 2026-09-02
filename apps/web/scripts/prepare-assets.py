"""Non-destructive runtime asset derivatives.

Requires Pillow. Sources are never edited or deleted; generated files live beside
the runtime bundle and can be reproduced with this script.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"


def webp(source: Path, destination: Path, *, max_width: int, quality: int = 82) -> None:
    with Image.open(source) as image:
        image = image.convert("RGB")
        if image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    guide = ASSETS / "guia-ilustrada"
    runtime = guide / "runtime"
    for index in range(4):
        webp(guide / f"{index}_Mosca.png", runtime / f"{index}_Mosca.webp", max_width=1055, quality=84)
    pages = []
    try:
        for index in range(4):
            with Image.open(guide / f"{index}_Mosca.png") as source:
                image = source.convert("RGB")
                if image.width > 1240:
                    image.thumbnail((1240, 1754), Image.Resampling.LANCZOS)
                pages.append(image.copy())
        pages[0].save(
            runtime / "La_Mosca_Guia_Ilustrada.pdf",
            "PDF",
            save_all=True,
            append_images=pages[1:],
            resolution=150,
            quality=84,
            optimize=True,
        )
    finally:
        for page in pages:
            page.close()
    webp(ASSETS / "table" / "bodegon-editorial.png", ASSETS / "table" / "bodegon-editorial.webp", max_width=1664, quality=84)
    table = ASSETS / "table"
    webp(table / "scene-b-wood.png", table / "scene-b-wood.webp", max_width=1254, quality=86)
    webp(table / "scene-b-surround.png", table / "scene-b-surround.webp", max_width=1536, quality=84)


if __name__ == "__main__":
    main()
