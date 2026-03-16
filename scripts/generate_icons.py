"""
generate_icons.py
Gera todos os tamanhos de ícone do app Android a partir de public/icon-512.png
"""
from PIL import Image
import os

src = Image.open("public/icon-512.png").convert("RGBA")

sizes = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

base = "android/app/src/main/res"

for folder, size in sizes.items():
    path = f"{base}/{folder}"
    os.makedirs(path, exist_ok=True)

    icon = src.resize((size, size), Image.LANCZOS)
    icon.save(f"{path}/ic_launcher.png", "PNG")
    icon.save(f"{path}/ic_launcher_round.png", "PNG")

    # Foreground para ícone adaptativo (com padding)
    fg_size = int(size * 1.5)
    fg = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    offset = int(size * 0.25)
    fg.paste(icon, (offset, offset), icon)
    fg.save(f"{path}/ic_launcher_foreground.png", "PNG")

    print(f"✓ {folder}: {size}px")

# Adaptive icon XMLs
anydpi_dir = f"{base}/mipmap-anydpi-v26"
os.makedirs(anydpi_dir, exist_ok=True)

adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""

for name in ["ic_launcher.xml", "ic_launcher_round.xml"]:
    with open(f"{anydpi_dir}/{name}", "w") as f:
        f.write(adaptive_xml)

print("✓ Adaptive icon XMLs written")
print("✓ All icons generated")
