#!/usr/bin/env python3
"""
Sprite Sheet Packer for Toronto Games Week
==========================================
Packs individual .webp images into sprite sheets at two resolutions.
Outputs sprite sheets + a JS manifest file.

Usage:
    python3 pack_sprites.py

Run from the directory containing your image folders:
    balls/, bestballs/, ppl/, bestppl/, other/, particles/, special/

Expected folder structure (same directory as this script):
    balls/           ball_1.webp  .. ball_39.webp
    bestballs/       ball_1.webp  .. ball_15.webp
    ppl/             ppl_1.webp   .. ppl_29.webp
    bestppl/         ppl_0.webp   .. ppl_20.webp
    other/           o_1.webp     .. o_14.webp
    particles/
      stars/         star_1.webp  .. star_3.webp
      hot/           heart.webp, ko.webp
    special/         (various individual images)
"""

import os
import sys
import math
import json
from PIL import Image


# --------------- Configuration ---------------

# Two output sizes: desktop (@2x) and mobile (@1x)
DESKTOP_CELL = 200   # px
MOBILE_CELL  = 100   # px

WEBP_QUALITY = 82

# Indexed sprite sheet groups
# Each group: name, folder, filename pattern, start index, count
GROUPS = [
    {
        "name": "balls",
        "folder": "balls",
        "pattern": "ball_{i}.webp",
        "start": 1,
        "count": 39,
    },
    {
        "name": "bestballs",
        "folder": "bestballs",
        "pattern": "ball_{i}.webp",
        "start": 1,
        "count": 15,
    },
    {
        "name": "ppl",
        "folder": "ppl",
        "pattern": "ppl_{i}.webp",
        "start": 1,
        "count": 29,
    },
    {
        "name": "bestppl",
        "folder": "bestppl",
        "pattern": "ppl_{i}.webp",
        "start": 1,
        "count": 21,
    },
    {
        "name": "other",
        "folder": "other",
        "pattern": "o_{i}.webp",
        "start": 1,
        "count": 14,
    },
    {
        "name": "stars",
        "folder": os.path.join("particles", "stars"),
        "pattern": "star_{i}.webp",
        "start": 1,
        "count": 3,
    },
]

# Individual particle images — packed into a small "particles" sheet
PARTICLE_IMAGES = [
    {"name": "heart", "path": os.path.join("particles", "hot", "heart.webp")},
    {"name": "ko",    "path": os.path.join("particles", "hot", "ko.webp")},
]

# Special images — packed into a "special" sheet.
# UPDATE THIS LIST: remove any you don't use, add any that are missing.
# Logos are kept SEPARATE (not in any sheet) because of their unusual aspect ratio.
SPECIAL_IMAGES = [
    {"name": "baddie",       "path": os.path.join("special", "baddie.webp")},
    {"name": "black-circle", "path": os.path.join("special", "black-circle.webp")},
    {"name": "cat",          "path": os.path.join("special", "cat.webp")},
    {"name": "empty_circle", "path": os.path.join("special", "empty_circle.webp")},
    {"name": "open",         "path": os.path.join("special", "open.webp")},
    {"name": "point",        "path": os.path.join("special", "point.webp")},
    {"name": "ppl_3",        "path": os.path.join("special", "ppl_3.webp")},
    {"name": "ppl_32",       "path": os.path.join("special", "ppl_32.webp")},
    {"name": "ppl_33",       "path": os.path.join("special", "ppl_33.webp")},
    {"name": "special",      "path": os.path.join("special", "special.webp")},
    {"name": "trees",        "path": os.path.join("special", "trees.webp")},
]

# These stay as individual files — just resized per tier, no sheet
SEPARATE_IMAGES = [
    {"name": "desktop-logo", "path": os.path.join("special", "desktop-logo.webp")},
    {"name": "mobile-logo",  "path": os.path.join("special", "mobile-logo.webp")},
]


def resize_to_fit(img, cell_size):
    """Resize image to fit within cell_size, maintaining aspect ratio. Never upscales."""
    if img is None:
        return None, 0, 0
    w, h = img.size
    scale = min(cell_size / w, cell_size / h, 1.0)
    new_w = max(1, round(w * scale))
    new_h = max(1, round(h * scale))
    if scale < 1.0:
        return img.resize((new_w, new_h), Image.LANCZOS), new_w, new_h
    return img, w, h


def load_indexed_images(root, group):
    """Load numbered images for a sprite group."""
    folder = os.path.join(root, group["folder"])
    images = []
    for i in range(group["start"], group["start"] + group["count"]):
        filename = group["pattern"].format(i=i)
        filepath = os.path.join(folder, filename)
        if os.path.exists(filepath):
            img = Image.open(filepath).convert("RGBA")
            images.append({"index": i, "image": img, "filename": filename})
        else:
            print(f"  WARNING: Missing {filepath}")
            images.append({"index": i, "image": None, "filename": filename})
    return images


def load_named_images(root, image_list):
    """Load a list of named images. Returns list of {name, image}. Skips missing files."""
    images = []
    for item in image_list:
        filepath = os.path.join(root, item["path"])
        if os.path.exists(filepath):
            img = Image.open(filepath).convert("RGBA")
            images.append({"name": item["name"], "image": img})
        else:
            print(f"  WARNING: Missing {filepath} — skipping")
    return images


def pack_sheet(images_with_data, cell_size, get_image_fn):
    """
    Pack images into a sprite sheet grid.
    get_image_fn(item) should return a PIL Image or None.
    Returns (sheet_image, frame_data, cols, rows).
    """
    count = len(images_with_data)
    if count == 0:
        return None, [], 0, 0

    cols = math.ceil(math.sqrt(count))
    rows = math.ceil(count / cols)
    sheet = Image.new("RGBA", (cols * cell_size, rows * cell_size), (0, 0, 0, 0))
    frames = []

    for idx, item in enumerate(images_with_data):
        col = idx % cols
        row = idx // cols
        cell_x = col * cell_size
        cell_y = row * cell_size

        src_img = get_image_fn(item)
        resized, w, h = resize_to_fit(src_img, cell_size)

        if resized is not None:
            ox = (cell_size - w) // 2
            oy = (cell_size - h) // 2
            sheet.paste(resized, (cell_x + ox, cell_y + oy))
            frames.append({"x": cell_x, "y": cell_y, "w": w, "h": h, "ox": ox, "oy": oy})
        else:
            frames.append({"x": cell_x, "y": cell_y, "w": 0, "h": 0, "ox": 0, "oy": 0})

    return sheet, frames, cols, rows


def save_sheet(sheet, filepath, quality=WEBP_QUALITY):
    """Save a sprite sheet and return file size in bytes."""
    sheet.save(filepath, "WEBP", quality=quality)
    return os.path.getsize(filepath)


def main():
    # Root = directory where this script lives
    root = os.path.dirname(os.path.abspath(__file__))
    print(f"Image root: {root}")

    # Verify we can see the expected folders
    expected = ["balls", "ppl", "other"]
    for folder in expected:
        if not os.path.isdir(os.path.join(root, folder)):
            print(f"ERROR: Cannot find '{folder}/' in {root}")
            print(f"Make sure this script is in the same directory as your image folders.")
            sys.exit(1)

    # Output directories
    out_desktop = os.path.join(root, "sprites", "desktop")
    out_mobile = os.path.join(root, "sprites", "mobile")
    os.makedirs(out_desktop, exist_ok=True)
    os.makedirs(out_mobile, exist_ok=True)

    manifest = {
        "desktop": {"cellSize": DESKTOP_CELL, "sheets": {}, "named": {}, "separate": {}},
        "mobile":  {"cellSize": MOBILE_CELL,  "sheets": {}, "named": {}, "separate": {}},
    }

    total_bytes = {"desktop": 0, "mobile": 0}
    total_requests = 0

    # ---- 1. Indexed sprite sheets (balls, ppl, stars, etc.) ----
    for group in GROUPS:
        print(f"\n📦 {group['name']}")
        images = load_indexed_images(root, group)
        found = sum(1 for x in images if x["image"] is not None)
        print(f"  Found {found}/{group['count']} images")

        for tier, cell_size, out_dir in [("desktop", DESKTOP_CELL, out_desktop),
                                          ("mobile", MOBILE_CELL, out_mobile)]:
            sheet, frames, cols, rows = pack_sheet(
                images, cell_size, lambda item: item["image"]
            )
            if sheet is None:
                continue

            filename = f"{group['name']}.webp"
            filepath = os.path.join(out_dir, filename)
            size = save_sheet(sheet, filepath)
            total_bytes[tier] += size

            print(f"  {tier}: {sheet.size[0]}x{sheet.size[1]}px, {cols}x{rows} grid, {size/1024:.1f}KB")

            manifest[tier]["sheets"][group["name"]] = {
                "file": f"sprites/{tier}/{filename}",
                "cols": cols,
                "rows": rows,
                "count": len(images),
                "startIndex": group["start"],
                "cellSize": cell_size,
                "sheetWidth": sheet.size[0],
                "sheetHeight": sheet.size[1],
                "frames": frames,
            }

        total_requests += 1

    # ---- 2. Particle images → "particles" named sheet ----
    print(f"\n📦 particles (heart, ko)")
    particle_imgs = load_named_images(root, PARTICLE_IMAGES)
    if particle_imgs:
        for tier, cell_size, out_dir in [("desktop", DESKTOP_CELL, out_desktop),
                                          ("mobile", MOBILE_CELL, out_mobile)]:
            sheet, frames, cols, rows = pack_sheet(
                particle_imgs, cell_size, lambda item: item["image"]
            )
            if sheet is None:
                continue

            filename = "particles.webp"
            filepath = os.path.join(out_dir, filename)
            size = save_sheet(sheet, filepath)
            total_bytes[tier] += size
            print(f"  {tier}: {sheet.size[0]}x{sheet.size[1]}px, {size/1024:.1f}KB")

            name_map = {}
            for idx, item in enumerate(particle_imgs):
                name_map[item["name"]] = idx

            manifest[tier]["named"]["particles"] = {
                "file": f"sprites/{tier}/{filename}",
                "cols": cols,
                "rows": rows,
                "count": len(particle_imgs),
                "cellSize": cell_size,
                "sheetWidth": sheet.size[0],
                "sheetHeight": sheet.size[1],
                "frames": frames,
                "nameMap": name_map,
            }

        total_requests += 1

    # ---- 3. Special images → "special" named sheet ----
    print(f"\n📦 special")
    special_imgs = load_named_images(root, SPECIAL_IMAGES)
    if special_imgs:
        found_names = [x["name"] for x in special_imgs]
        print(f"  Found: {', '.join(found_names)}")

        for tier, cell_size, out_dir in [("desktop", DESKTOP_CELL, out_desktop),
                                          ("mobile", MOBILE_CELL, out_mobile)]:
            sheet, frames, cols, rows = pack_sheet(
                special_imgs, cell_size, lambda item: item["image"]
            )
            if sheet is None:
                continue

            filename = "special.webp"
            filepath = os.path.join(out_dir, filename)
            size = save_sheet(sheet, filepath)
            total_bytes[tier] += size
            print(f"  {tier}: {sheet.size[0]}x{sheet.size[1]}px, {size/1024:.1f}KB")

            name_map = {}
            for idx, item in enumerate(special_imgs):
                name_map[item["name"]] = idx

            manifest[tier]["named"]["special"] = {
                "file": f"sprites/{tier}/{filename}",
                "cols": cols,
                "rows": rows,
                "count": len(special_imgs),
                "cellSize": cell_size,
                "sheetWidth": sheet.size[0],
                "sheetHeight": sheet.size[1],
                "frames": frames,
                "nameMap": name_map,
            }

        total_requests += 1

    # ---- 4. Logos — separate files, just resized per tier ----
    print(f"\n🖼️  logos (separate files)")
    for item in SEPARATE_IMAGES:
        filepath = os.path.join(root, item["path"])
        if not os.path.exists(filepath):
            print(f"  WARNING: Missing {filepath}")
            continue

        img = Image.open(filepath).convert("RGBA")
        print(f"  {item['name']}: {img.size[0]}x{img.size[1]}px")

        for tier, max_width, out_dir in [("desktop", 2000, out_desktop),
                                           ("mobile", 800, out_mobile)]:
            w, h = img.size
            if w > max_width:
                scale = max_width / w
                resized = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
            else:
                resized = img

            filename = f"{item['name']}.webp"
            out_path = os.path.join(out_dir, filename)
            resized.save(out_path, "WEBP", quality=WEBP_QUALITY)
            size = os.path.getsize(out_path)
            total_bytes[tier] += size
            print(f"    {tier}: {resized.size[0]}x{resized.size[1]}px, {size/1024:.1f}KB")

            manifest[tier]["separate"][item["name"]] = {
                "file": f"sprites/{tier}/{filename}",
                "w": resized.size[0],
                "h": resized.size[1],
            }

        total_requests += 1

    # ---- Write manifest ----
    manifest_path = os.path.join(root, "sprites", "sprite-manifest.js")
    with open(manifest_path, "w") as f:
        f.write("// Auto-generated by pack_sprites.py — do not edit\n")
        f.write(f"const SpriteManifest = {json.dumps(manifest, indent=2)};\n")

    json_path = os.path.join(root, "sprites", "sprite-manifest.json")
    with open(json_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # ---- Summary ----
    orig_requests = sum(g["count"] for g in GROUPS) + len(PARTICLE_IMAGES) + len(SPECIAL_IMAGES) + len(SEPARATE_IMAGES)

    print(f"\n{'='*55}")
    print(f"  ✅ DONE!")
    print(f"")
    print(f"  Desktop: {total_bytes['desktop']/1024:.0f}KB total")
    print(f"  Mobile:  {total_bytes['mobile']/1024:.0f}KB total")
    print(f"  Requests: {total_requests} instead of {orig_requests}")
    print(f"")
    print(f"  Output:   sprites/desktop/  and  sprites/mobile/")
    print(f"  Manifest: sprites/sprite-manifest.js")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()