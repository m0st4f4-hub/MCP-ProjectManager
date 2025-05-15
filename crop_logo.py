from PIL import Image, ImageDraw

# --- IMPORTANT: ADJUST THESE COORDINATES ---
# These coordinates are ESTIMATES for a 1024x1024 image.
# You WILL LIKELY need to adjust them for your specific images.
# Format: (left, upper, right, lower)

# Coordinates for the main logo WITH "Project Manager" text (usually the larger, top part)
MAIN_LOGO_WITH_TEXT_COORDS = (50, 50, 974, 750)  # x1, y1, x2, y2

# Coordinates for the SMALLER STANDALONE ICON (usually at the bottom, without text)
# This will be used for icon_{theme}.png and the favicons.
STANDALONE_ICON_COORDS = (300, 760, 724, 990) # x1, y1, x2, y2

# --- TARGET COLORS FOR BACKGROUND REMOVAL (USER TO CONFIRM/PROVIDE) ---
# For light theme images (e.g., making white transparent)
LIGHT_THEME_BG_COLOR_RGB = (255, 255, 255) # Pure White
LIGHT_THEME_BG_TOLERANCE = 50 # Increased tolerance

# For dark theme images
DARK_THEME_BG_COLOR_RGB = (0, 0, 0) # Pure Black
DARK_THEME_BG_TOLERANCE = 30 # Starting tolerance for black
# --- END OF TARGET COLORS ---

def make_color_transparent(img: Image.Image, target_color_rgb: tuple, tolerance: int) -> Image.Image:
    """
    Makes pixels of target_color_rgb (within tolerance) transparent in the given Pillow Image object.
    Returns the modified Image object.
    """
    if target_color_rgb is None:
        return img

    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel color is within tolerance of the target_color_rgb
        is_target_color = True
        for i in range(3): # R, G, B channels
            if not (target_color_rgb[i] - tolerance <= item[i] <= target_color_rgb[i] + tolerance):
                is_target_color = False
                break
        
        if is_target_color:
            newData.append((item[0], item[1], item[2], 0)) # Set alpha to 0 (transparent)
        else:
            newData.append(item) # Keep original pixel data (including original alpha)

    img.putdata(newData)
    return img

def resize_and_pad_to_square(img: Image.Image, target_size: int) -> Image.Image:
    """
    Resizes an image to fit within a square of target_size x target_size,
    maintaining aspect ratio, and pads with transparency if needed.
    """
    original_width, original_height = img.size
    aspect_ratio = original_width / float(original_height)

    if original_width == original_height:
        # Already square, just resize
        new_img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    elif aspect_ratio > 1:
        # Wider than tall
        new_width = target_size
        new_height = int(target_size / aspect_ratio)
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        # Create a new square transparent canvas
        new_img = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
        # Paste the resized image onto the center of the canvas
        upper_left_y = (target_size - new_height) // 2
        new_img.paste(resized_img, (0, upper_left_y))
    else:
        # Taller than wide (or perfectly vertical)
        new_height = target_size
        new_width = int(target_size * aspect_ratio)
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        # Create a new square transparent canvas
        new_img = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
        # Paste the resized image onto the center of the canvas
        upper_left_x = (target_size - new_width) // 2
        new_img.paste(resized_img, (upper_left_x, 0))
    return new_img

def process_assets_from_image(
    source_image_path: str, 
    theme_suffix: str,
    bg_color_to_remove: tuple | None, # RGB tuple or None
    bg_removal_tolerance: int
):
    """
    Crops the source image to extract:
    1. The main logo with text.
    2. The smaller standalone icon (for favicons and icon_{theme}.png).
    Applies background transparency if bg_color_to_remove is specified.
    Saves them with the given theme_suffix (_light or _dark).
    """
    try:
        img_source = Image.open(source_image_path)
        img_source = img_source.convert("RGBA") # Ensure source is RGBA
    except FileNotFoundError:
        print(f"Error: Source image '{source_image_path}' not found in project root.")
        return
    except Exception as e:
        print(f"Error opening source image {source_image_path}: {e}")
        return

    print(f"Processing '{source_image_path}' for {theme_suffix.replace('_', '')} theme...")

    # 1. Crop and save the main logo with text
    try:
        img_logo_cropped = img_source.crop(MAIN_LOGO_WITH_TEXT_COORDS)
        if bg_color_to_remove:
            print(f"Attempting to make background {bg_color_to_remove} transparent for logo{theme_suffix}.png...")
            img_logo_processed = make_color_transparent(img_logo_cropped.copy(), bg_color_to_remove, bg_removal_tolerance)
        else:
            img_logo_processed = img_logo_cropped
        main_logo_filename = f"logo{theme_suffix}.png"
        logo_save_path = f"frontend/public/assets/images/{main_logo_filename}"
        img_logo_processed.save(logo_save_path)
        print(f"  Saved {logo_save_path} (cropped from {MAIN_LOGO_WITH_TEXT_COORDS})")
    except Exception as e:
        print(f"  Error cropping/saving main logo: {e}")

    # 2. Crop and save the smaller standalone icon
    try:
        img_icon_cropped = img_source.crop(STANDALONE_ICON_COORDS)
        if bg_color_to_remove:
            print(f"Attempting to make background {bg_color_to_remove} transparent for icon{theme_suffix}.png...")
            img_icon_processed = make_color_transparent(img_icon_cropped.copy(), bg_color_to_remove, bg_removal_tolerance)
        else:
            img_icon_processed = img_icon_cropped
        standalone_icon_filename = f"icon{theme_suffix}.png"
        icon_save_path = f"frontend/public/assets/images/{standalone_icon_filename}"
        img_icon_processed.save(icon_save_path)
        print(f"  Saved {icon_save_path} (cropped from {STANDALONE_ICON_COORDS})")

        # 3. Create and save favicons from the standalone icon (aspect ratio preserved)
        try:
            base_favicon_img = img_icon_processed 

            favicon_32_filename = f"favicon{theme_suffix}_32.png"
            favicon_32_save_path = f"frontend/public/{favicon_32_filename}"
            favicon_32 = resize_and_pad_to_square(base_favicon_img.copy(), 32)
            favicon_32.save(favicon_32_save_path)
            print(f"  Saved {favicon_32_save_path}")
        except Exception as e:
            print(f"  Error creating 32x32 favicon: {e}")

        try:
            favicon_64_filename = f"favicon{theme_suffix}_64.png"
            favicon_64_save_path = f"frontend/public/{favicon_64_filename}"
            favicon_64 = resize_and_pad_to_square(base_favicon_img.copy(), 64)
            favicon_64.save(favicon_64_save_path)
            print(f"  Saved {favicon_64_save_path}")
        except Exception as e:
            print(f"  Error creating 64x64 favicon: {e}")

    except Exception as e:
        print(f"  Error cropping/saving standalone icon: {e}")

    print(f"Finished processing for {theme_suffix.replace('_', '')} theme.")

if __name__ == "__main__":
    print("--- Image Processing Script ---")
    print("Please ensure 'image-light.png' and 'image-dark.png' are in the project root.")
    print("If cropping is incorrect, adjust MAIN_LOGO_WITH_TEXT_COORDS and STANDALONE_ICON_COORDS in this script.\n")

    print(f"Using coordinates for Main Logo with Text: {MAIN_LOGO_WITH_TEXT_COORDS}")
    print(f"Using coordinates for Standalone Icon: {STANDALONE_ICON_COORDS}")
    print("-" * 30)

    # Process light theme assets
    print("Processing Light Theme Assets (image-light.png)...")
    if LIGHT_THEME_BG_COLOR_RGB:
        print(f"Targeting background color for transparency: RGB{LIGHT_THEME_BG_COLOR_RGB} with tolerance {LIGHT_THEME_BG_TOLERANCE}")
    else:
        print("No background color targeted for transparency for light theme (LIGHT_THEME_BG_COLOR_RGB is None).")
    process_assets_from_image(
        source_image_path="image-light.png", 
        theme_suffix="_light",
        bg_color_to_remove=LIGHT_THEME_BG_COLOR_RGB,
        bg_removal_tolerance=LIGHT_THEME_BG_TOLERANCE
    )

    # Process dark theme assets
    print("Processing Dark Theme Assets (image-dark.png)...")
    if DARK_THEME_BG_COLOR_RGB:
        print(f"Targeting background color for transparency: RGB{DARK_THEME_BG_COLOR_RGB} with tolerance {DARK_THEME_BG_TOLERANCE}")
    else:
        print("No background color targeted for transparency for dark theme (DARK_THEME_BG_COLOR_RGB is None).")
    process_assets_from_image(
        source_image_path="image-dark.png", 
        theme_suffix="_dark",
        bg_color_to_remove=DARK_THEME_BG_COLOR_RGB,
        bg_removal_tolerance=DARK_THEME_BG_TOLERANCE
    )

    print("\n--- All Processing Complete ---") 