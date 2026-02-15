"""
Resizes and converts PNGs to WebP, preserving transparency.
Requires pip install Pillow 
<3
"""

from PIL import Image
import os
import shutil

# Configuration: folder -> max dimension in pixels
# 2x the display size for retina sharpness
FOLDER_SIZES = {
    "balls":     200,   # displayed at ~100px
    "bestballs": 200,
    "ppl":       160,   # displayed at ~80px
    "bestppl":   160,
    "other":     200,
    "particles": 100,   # small particle effects
}

# Special folder files - individual sizes
SPECIAL_SIZES = {
    "desktop-logo.png": None,   # keep original size
    "mobile-logo.png":  None,
    "logo-long.psd":    None,   # skip PSD files
    "longlogo.psd":     None,
    "mobile-logo.psd":  None,
    "baddie.png":       200,
    "black-circle.png": 100,
    "cat.png":          200,
    "empty_circle.png": 100,
    "open.png":         200,
    "point.png":        100,
    "special.png":      200,
    "trees.png":        200,
    "ppl_3.png":        160,
    "ppl_32.png":       160,
    "ppl_33.png":       160,
}

WEBP_QUALITY = 85
OUTPUT_DIR = "optimized"


def optimize_image(src_path, dst_path, max_dimension=None):
    """Resize and convert a single image to WebP."""
    try:
        img = Image.open(src_path)
    except Exception as e:
        print(f"  SKIP (can't open): {src_path} - {e}")
        return None

    original_size = os.path.getsize(src_path)

    # Ensure RGBA for transparency support
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Resize if needed
    if max_dimension and max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # Save as WebP
    img.save(dst_path, "WEBP", quality=WEBP_QUALITY)
    new_size_bytes = os.path.getsize(dst_path)

    return {
        "original_kb": original_size / 1024,
        "new_kb": new_size_bytes / 1024,
        "original_dimensions": Image.open(src_path).size,
        "new_dimensions": img.size,
    }


def process_folder(folder_name, max_dimension):
    """Process all images in a folder, including subfolders."""
    if not os.path.isdir(folder_name):
        print(f"\n  Folder '{folder_name}/' not found, skipping")
        return 0, 0

    total_orig = 0
    total_new = 0
    count = 0

    for root, dirs, files in os.walk(folder_name):
        # Create matching output subfolder
        rel_path = os.path.relpath(root, ".")
        dst_folder = os.path.join(OUTPUT_DIR, rel_path)
        os.makedirs(dst_folder, exist_ok=True)

        for filename in sorted(files):
            if not filename.lower().endswith(".png"):
                continue

            src = os.path.join(root, filename)
            dst = os.path.join(dst_folder, filename.replace(".png", ".webp"))

            result = optimize_image(src, dst, max_dimension)
            if result:
                total_orig += result["original_kb"]
                total_new += result["new_kb"]
                count += 1
                savings = (1 - result["new_kb"] / result["original_kb"]) * 100
                display_path = os.path.relpath(src, folder_name)
                print(f"  {display_path}: {result['original_dimensions'][0]}x{result['original_dimensions'][1]} ({result['original_kb']:.0f}KB) -> {result['new_dimensions'][0]}x{result['new_dimensions'][1]} ({result['new_kb']:.1f}KB) [{savings:.0f}% smaller]")

    return total_orig, total_new


def process_special():
    """Process the special/ folder with per-file sizes."""
    folder = "special"
    if not os.path.isdir(folder):
        print(f"\n  Folder '{folder}/' not found, skipping")
        return 0, 0

    dst_folder = os.path.join(OUTPUT_DIR, folder)
    os.makedirs(dst_folder, exist_ok=True)

    total_orig = 0
    total_new = 0

    for filename in sorted(os.listdir(folder)):
        # Skip PSD files
        if filename.lower().endswith(".psd"):
            continue

        if not filename.lower().endswith(".png"):
            continue

        max_dim = SPECIAL_SIZES.get(filename)
        # None means keep original size but still convert to WebP

        src = os.path.join(folder, filename)
        dst = os.path.join(dst_folder, filename.replace(".png", ".webp"))

        result = optimize_image(src, dst, max_dim)
        if result:
            total_orig += result["original_kb"]
            total_new += result["new_kb"]
            savings = (1 - result["new_kb"] / result["original_kb"]) * 100
            print(f"  {filename}: {result['original_dimensions'][0]}x{result['original_dimensions'][1]} ({result['original_kb']:.0f}KB) -> {result['new_dimensions'][0]}x{result['new_dimensions'][1]} ({result['new_kb']:.1f}KB) [{savings:.0f}% smaller]")

    return total_orig, total_new


def main():
    print("=" * 60)
    print("Toronto Games Week - Image Optimizer")
    print("=" * 60)

    grand_orig = 0
    grand_new = 0

    # Process each folder
    for folder, max_dim in FOLDER_SIZES.items():
        print(f"\n📁 {folder}/ (max {max_dim}px)")
        orig, new = process_folder(folder, max_dim)
        grand_orig += orig
        grand_new += new

    # Process special folder
    print(f"\n📁 special/ (mixed sizes)")
    orig, new = process_special()
    grand_orig += orig
    grand_new += new

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Original total:  {grand_orig/1024:.1f} MB")
    print(f"  Optimized total: {grand_new/1024:.1f} MB")
    if grand_orig > 0:
        print(f"  Savings:         {(1 - grand_new/grand_orig)*100:.0f}%")
    print(f"\n  Output in: {os.path.abspath(OUTPUT_DIR)}/")
   


if __name__ == "__main__":
    main()