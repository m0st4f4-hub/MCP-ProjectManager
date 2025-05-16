# Extended Chakra UI Theme (`frontend/src/theme/`)

This directory contains an extended and highly customized theme configuration for the Chakra UI library, used throughout the frontend application. It centralizes all styling definitions, from base color palettes and typographic scales to component-specific styles and semantic color tokens for light and dark modes.

It appears to be a more comprehensive theme definition than the `theme.ts` file located at `frontend/src/theme.ts`.

## `index.ts`

This is the main file in this directory and exports the complete, extended Chakra UI theme object.

### Key Sections of the Theme Definition:

1.  **Core Configuration (`config`)**: Defines global theme settings.
    *   `initialColorMode`: Set to `'dark'` by default.
    *   `useSystemColorMode`: Set to `false`, meaning the `initialColorMode` takes precedence over system settings unless overridden elsewhere.
    *   `cssVarPrefix`: Custom CSS variable prefix (e.g., `'eg'`).

2.  **Scales & Primitives**: Defines the foundational values for the design system.
    *   `breakpoints`: Responsive breakpoints (e.g., `sm`, `md`, `lg`).
    *   `colors`: Extensive color palettes, including:
        *   `brand` (Teal/Cyan based)
        *   `neutral` (Warmer Gray/Stone based)
        *   `accent` (Indigo based)
        *   Status colors: `success`, `warning`, `danger`, `info`.
        *   `purple`, `whiteAlpha`, `blackAlpha`.
    *   `fonts`: Font families for `heading` ('Inter'), `body` ('Open Sans'), and `mono` ('Fira Code').
    *   `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacings`: Comprehensive typographic scales.
    *   `space`: Spacing scale for margins, paddings, etc.
    *   `sizes`: Sizing scale for containers, icons, avatars.
    *   `radii`: Border radius values.
    *   `shadows`: Predefined box shadow styles.
    *   `zIndices`: Z-index scale for managing stacking order.
    *   `opacity`, `blur`, `filters`: Scales for visual effects.
    *   `motion`: Default durations and timing functions for animations.

3.  **Semantic Tokens (`semanticTokens`)**: Defines abstract theme tokens that map to specific color values for light (`default`) and dark (`_dark`) modes. This is crucial for adaptable and consistent theming across color modes.
    *   Covers a wide range of UI elements: backgrounds (`bg.app`, `bg.surface`), text (`text.primary`, `text.link`), borders (`border.base`, `border.input`), inputs, buttons, interaction states (`interaction.hover`), statuses, badges, progress bars, tooltips, icons, and specific contexts like forms and tables.
    *   Examples: `'bg.app'`, `'text.primary'`, `'border.input'`, `'bg.button.primary'`, `'status.success'`.

4.  **Global Styles (`styles.global`)**: Defines styles applied globally to the application.
    *   Sets base styles for `body`, including background color and text color using semantic tokens.
    *   May include other global resets or default styling (e.g., for scrollbars, focus rings).

5.  **Component Styles (`components`)**: Provides style overrides and variants for specific Chakra UI components.
    *   The file likely contains custom styling for components such as `Button`, `Input`, `Modal`, `Menu`, `Tag`, `Tooltip`, `Card`, `Alert`, `Checkbox`, `Drawer`, `FormLabel`, `Heading`, `Link`, `Progress`, `Select`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, and more.
    *   These styles often use the defined color palettes and semantic tokens to ensure consistency with the overall theme.
    *   Multi-part components (like `Modal` or `Menu`) are styled using helpers like `createMultiStyleConfigHelpers`.

### Export
-   The entire theme configuration is consolidated and exported as a single `theme` object using `extendTheme()`.
    ```typescript
    const theme = extendTheme({
      config,
      colors,
      fonts, 
      // ...other scales
      semanticTokens,
      styles,
      components,
      // ...other overrides
    });

    export default theme;
    export type Theme = typeof theme; // Exports the type of the theme object
    ```

This comprehensive theme is then typically provided to the application via Chakra UI's `ChakraProvider`. 