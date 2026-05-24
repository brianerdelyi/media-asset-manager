#!/usr/bin/env python3
"""
Run once to generate the correct app icon, then regenerate all Tauri icon sizes.

Usage:
    cd ~/Documents/Claude/Projects/media-asset-manager
    python3 generate_icon.py
    pnpm tauri icon src-tauri/icons/icon.png
"""
from PIL import Image, ImageDraw
import pathlib, sys

SIZE   = 1024
# 60% content, 20% padding each side — matches standard macOS icon proportions
SCALE  = 0.60
PAD    = int((1 - SCALE) / 2 * SIZE)   # 205px each side

img  = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

def card(base, ox, oy):
    """Draw one card offset by ox,oy from the padded origin."""
    W, H, R = int(620 * SCALE), int(390 * SCALE), int(52 * SCALE)
    x = PAD + int(ox * SCALE)
    y = PAD + int(oy * SCALE)
    return x, y, W, H, R

def draw(base, x, y, w, h, r, hex_color, alpha_float):
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ri, gi, bi = int(hex_color[1:3],16), int(hex_color[3:5],16), int(hex_color[5:7],16)
    d.rounded_rectangle([x, y, x+w, y+h], radius=r,
                        fill=(ri, gi, bi, int(255 * alpha_float)))
    base.alpha_composite(layer)

# Back card  (green,  top-right offset)
x,y,w,h,r = card(img, 152, 267); draw(img, x, y, w, h, r, "#30D158", 0.35)
# Middle card (purple, mid offset)
x,y,w,h,r = card(img, 202, 317); draw(img, x, y, w, h, r, "#BF5AF2", 0.65)
# Front card  (blue,   origin)
x,y,w,h,r = card(img, 252, 367); draw(img, x, y, w, h, r, "#0A84FF", 1.00)

# Sanity checks
assert img.getpixel((0,    0   ))[3] == 0,   "Top-left corner not transparent!"
assert img.getpixel((1023, 0   ))[3] == 0,   "Top-right corner not transparent!"
assert img.getpixel((0,    1023))[3] == 0,   "Bottom-left corner not transparent!"
assert img.getpixel((1023, 1023))[3] == 0,   "Bottom-right corner not transparent!"

out = pathlib.Path(__file__).parent / "src-tauri" / "icons" / "icon.png"
img.save(str(out), "PNG")

print(f"✓ Written {SIZE}×{SIZE} transparent PNG ({out.stat().st_size:,} bytes)")
print(f"  Content scale : {SCALE*100:.0f}%  ({PAD}px padding each side)")
print(f"  Corner alpha  : {img.getpixel((0,0))[3]}  (must be 0)")
print()
print("Next step:")
print("  pnpm tauri icon src-tauri/icons/icon.png")
