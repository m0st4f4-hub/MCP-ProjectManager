# Project Manager - Brand Assets Guide

This document outlines the primary brand assets, color palette, and typography for the Project Manager suite.

## 1. Core Visual Assets

All assets are available in the project root directory.

### Logos (Icon + Text)
- **Light Theme:** `frontend/public/assets/images/logo_light.png`
- **Dark Theme:** `frontend/public/assets/images/logo_dark.png`
- **Usage:** Main branding for website headers (e.g., sidebar), documentation, promotional materials.

### Icons (Standalone)
- **Light Theme:** `frontend/public/assets/images/icon_light.png`
- **Dark Theme:** `frontend/public/assets/images/icon_dark.png`
- **Usage:** Smaller contexts where full logo is not suitable (e.g., collapsed sidebar), social media profiles, UI elements.

### Favicons
- **Light Theme (32x32):** `frontend/public/favicon_light_32.png`
- **Light Theme (64x64):** `frontend/public/favicon_light_64.png`
- **Dark Theme (32x32):** `frontend/public/favicon_dark_32.png`
- **Dark Theme (64x64):** `frontend/public/favicon_dark_64.png`
- **Usage:** Browser tabs, bookmarks. (Referenced directly from `/public` in `layout.tsx`)

### Social Preview Images
- *(Placeholder - To be created based on final branding)*
- `social_preview_light.png` (e.g., 1200x630)
- `social_preview_dark.png` (e.g., 1200x630)
- **Usage:** For sharing links on social media platforms.

## 2. Color Palette

Colors are defined in `frontend/src/theme/index.ts` using Chakra UI's theme specification.

### Primary Colors (Brand - Teal/Cyan)
- `brand.50`: `#f0fdfa` (Lightest)
- `brand.100`: `#ccfbf1`
- `brand.200`: `#99f6e4`
- `brand.300`: `#5eead4`
- `brand.400`: `#2dd4bf`
- `brand.500`: `#14b8a6` (Primary Action Color / Logo Color)
- `brand.600`: `#0d9488`
- `brand.700`: `#0f766e`
- `brand.800`: `#115e59`
- `brand.900`: `#134e4a` (Darkest / Dark Theme App Background)

### Neutral Colors (Stone Gray)
- `neutral.50`: `#fafaf9` (Light Theme App/Page Background)
- `neutral.100`: `#f5f5f4` (Light Theme Sidebar Background)
- `neutral.200`: `#e7e5e4` (Light Theme Borders)
- `neutral.300`: `#d6d3d1` (Light Theme Stronger Borders/Input Borders)
- `neutral.400`: `#a8a29e` (Muted/Placeholder Text, Disabled Elements)
- `neutral.500`: `#78716c` (Secondary Text - Light)
- `neutral.600`: `#57534e` (Secondary Text - Dark / Dark Theme Borders)
- `neutral.700`: `#44403c` (Dark Theme Elevated Surfaces/Cards, Sidebar)
- `neutral.800`: `#292524` (Dark Theme Surface/Header/Content Background)
- `neutral.900`: `#1c1917` (Dark Theme Page Background / Inverted Text Dark)

### Accent Colors (Indigo)
- `accent.300`: `#a5b4fc` (Dark Theme Accent Border)
- `accent.400`: `#818cf8` (Dark Theme Button Hover)
- `accent.500`: `#6366f1` (Primary Accent Button)
- `accent.600`: `#4f46e5` (Light Theme Button Hover)

### Semantic Usage (from `semanticTokens` in theme):
- **Light Theme Backgrounds:**
    - App/Page: `neutral.50`
    - Surface/Header/Content/Card: `white`
    - Sidebar: `neutral.100`
- **Dark Theme Backgrounds:**
    - App: `brand.900`
    - Page: `neutral.900`
    - Surface/Header/Content: `neutral.800`
    - Card/Elevated/Sidebar: `neutral.700`
- **Text (Light/Dark):** See `text.primary`, `text.secondary`, `text.link` in `semanticTokens`.

## 3. Typography

Fonts are defined in `frontend/src/theme/index.ts`.

- **Headings:** `'Inter', sans-serif`
    - Weights: `semibold` (600), `bold` (700) typically used.
- **Body Text:** `'Open Sans', sans-serif`
    - Weights: `normal` (400), `medium` (500) typically used.
- **Monospace (Code):** `'Fira Code', monospace`

### Font Sizes (Chakra UI scale):
- `xs`: `0.75rem`
- `sm`: `0.875rem`
- `md`: `1rem` (Base body size)
- `lg`: `1.125rem`
- `xl`: `1.25rem`
- `2xl` to `7xl` for larger headings.

## 4. Asset Generation Script (`crop_logo.py`)

The project includes a Python script named `crop_logo.py` located in the project root. This script is used to generate the various logo and icon assets listed in section 1 (Logos, Icons, Favicons) from master source images.

### 4.1. Purpose
- To automate the cropping, resizing, and background transparency adjustments needed to create consistent themed assets from source images (`image-light.png` and `image-dark.png`, expected in the project root).
- To ensure all derived assets (like favicons and theme-specific icons) originate from a common source, maintaining brand consistency.

### 4.2. How it Works
- The script uses the Pillow (PIL) library for image manipulation.
- It defines specific coordinates (e.g., `MAIN_LOGO_WITH_TEXT_COORDS`, `STANDALONE_ICON_COORDS`) to crop the relevant parts from the source images.
- It can make specified background colors transparent (e.g., white for light theme, black for dark theme) within a defined tolerance.
- It resizes and pads the standalone icon to create square favicons of various sizes.
- Generated assets are saved to `frontend/public/assets/images/` and `frontend/public/`.

### 4.3. Usage
1.  **Prerequisites**: Ensure Python and Pillow are installed (`pip install Pillow`).
2.  **Source Images**: Place your master logo images named `image-light.png` and `image-dark.png` in the project root directory.
3.  **Configure Coordinates & Colors**: 
    -   Open `crop_logo.py` in a text editor.
    -   **Crucially, adjust the coordinate tuples** at the top of the script (`MAIN_LOGO_WITH_TEXT_COORDS`, `STANDALONE_ICON_COORDS`) to match the layout of your source images. The script provides comments and initial estimates, but these will likely need tuning.
    -   Adjust `LIGHT_THEME_BG_COLOR_RGB`, `DARK_THEME_BG_COLOR_RGB`, and their respective `_TOLERANCE` values if your source images have different background colors or if the transparency effect needs refinement.
4.  **Run the Script**: Execute the script from the project root directory:
    ```bash
    python crop_logo.py
    ```
5.  **Verify Output**: Check the `frontend/public/assets/images/` and `frontend/public/` directories for the generated assets.

**Note**: This script is intended for developers managing the visual assets of the project. If the source images or desired cropping changes, this script will need to be re-configured and re-run.

--- 
*This guide should be updated if assets, colors, or fonts change.* 