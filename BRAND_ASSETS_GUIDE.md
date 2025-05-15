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

--- 
*This guide should be updated if assets, colors, or fonts change.* 