# Design Token System Documentation

This document outlines the structure and usage of the design tokens for this project. The **single source of truth (SSOT)** for all design tokens is the manually curated CSS file: `frontend/src/styles/tokens.css`.

## Philosophy

Our design token system is built directly using CSS Custom Properties. This approach ensures that design values are defined once and can be easily consumed by both CSS Modules and our UI component library (Chakra UI).

The core principles are:
*   **Simplicity:** Tokens are defined directly in CSS, eliminating build steps or complex transformations for their basic use.
*   **Maintainability:** All design values are centralized in `frontend/src/styles/tokens.css`. Changes here propagate throughout the application.
*   **Consistency:** Using a defined set of CSS Custom Properties ensures visual consistency across all UI elements.

Tokens are organized into two conceptual layers directly within `tokens.css`:

1.  **Core/Primitive Tokens:**
    *   These are foundational values (e.g., specific hex codes for color palettes like `--core-colors-blue-500`, or pixel values for spacing like `--spacing-4`).
    *   They often serve as the basis for semantic tokens.
    *   Example:
        ```css
        /* in frontend/src/styles/tokens.css */
        :root {
          --core-colors-blue-50: #e6f7ff;
          --core-colors-blue-100: #bae7ff;
          /* ... more blue scale ... */
          --core-colors-blue-500: #1890ff;

          --spacing-0: 0px;
          --spacing-1: 4px;
          --spacing-2: 8px;
        }
        ```

2.  **Semantic Tokens:**
    *   These tokens give contextual meaning to primitive values or define specific values directly (e.g., `--colors-brandPrimary`, `--spacing-md`).
    *   **These are the primary tokens that should be consumed by components and styling logic.**
    *   They often reference core tokens using `var()`.
    *   Example:
        ```css
        /* in frontend/src/styles/tokens.css */
        :root {
          /* ... core tokens ... */

          --colors-brandPrimary: var(--core-colors-blue-500);
          --colors-textPrimary: var(--core-colors-neutralGray-900);
          --spacing-md: var(--spacing-4); /* 16px, assuming --spacing-4 is 16px */
        }
        ```

## File Structure

*   **`frontend/src/styles/tokens.css`**: The single source of truth. This file contains all CSS Custom Property definitions for the design tokens, globally scoped under `:root`.
*   **`frontend/src/app/layout.tsx`**: Imports `tokens.css` to make the custom properties globally available.
*   **`frontend/src/theme/chakra-theme.ts`**: Configures Chakra UI. The Chakra theme is set up to reference the CSS Custom Properties from `tokens.css` using the `var()` syntax for its theme scale values (colors, spacing, typography, etc.) and component styles.

## Token Naming Convention

CSS Custom Properties in `tokens.css` follow a consistent naming convention:

*   Prefix: `--`
*   Structure: `group-property-variant-state` (e.g., `--colors-brandPrimary`, `--typography-fontSizes-lg`, `--shadows-sm`).
    *   `group`: Broad category (e.g., `colors`, `typography`, `spacing`).
    *   `property`: Specific attribute (e.g., `brandPrimary`, `fontSizes`, `lineHeights`).
    *   `variant` or `scale`: (Optional) e.g., `500` for a color shade, `lg` for a size.
    *   `state`: (Optional) e.g., `hover`, `active`.

## Accessing Tokens

### 1. Using Tokens in CSS Modules (`*.module.css`)

CSS Custom Properties defined in `tokens.css` are globally available. You can use them in your CSS Modules using the `var()` function.

**Example:**

Consider a component `MyComponent.tsx` and its style file `MyComponent.module.css`.

**`MyComponent.module.css`:**
```css
.myStyledElement {
  background-color: var(--colors-brandPrimary);
  color: var(--colors-textInverse);
  padding: var(--spacing-4); /* e.g., 16px */
  border: var(--borders-width-xs) var(--borders-style-solid) var(--colors-borderDecorative);
  border-radius: var(--radii-lg);
  font-family: var(--typography-fontFamilies-body);
}

.myStyledElement:hover {
  background-color: var(--colors-brandPrimaryHover);
}
```

**Key Points:**
- Ensure your component imports its corresponding CSS Module:
  ```tsx
  // MyComponent.tsx
  import styles from './MyComponent.module.css';

  function MyComponent() {
    return <div className={styles.myStyledElement}>Hello Tokens!</div>;
  }
  ```
- No direct import of token files is needed in CSS Modules; the tokens are globally available CSS variables.

### 2. Using Tokens with Chakra UI

Chakra UI has been configured in `frontend/src/theme/chakra-theme.ts` to use the CSS Custom Properties from `tokens.css`.

*   **Theme Scale:** Chakra's theme scale (e.g., `colors.brandPrimary`, `space[4]`, `fontSizes.lg`) is mapped to use `var(--css-custom-property-name)`.
    ```typescript
    // frontend/src/theme/chakra-theme.ts (Conceptual Example)
    const chakraCustomTheme = extendTheme({
      colors: {
        brandPrimary: 'var(--colors-brandPrimary)',
        // ... other color mappings
      },
      space: {
        1: 'var(--spacing-1)', // 4px
        2: 'var(--spacing-2)', // 8px
        // ... other space mappings
      },
      // ... other theme scales (fontSizes, fontWeights, radii, etc.)
    });
    ```
*   **Component Styles:** Default component styles within the Chakra theme also reference these CSS variables.

When using Chakra UI components, they will automatically pick up these tokenized values. You can also use Chakra's style props with token aliases if needed, and Chakra will resolve them to the underlying CSS variable.

```tsx
// Example using Chakra UI
import { Box, Button, Heading, Text } from '@chakra-ui/react';

function ChakraStyledComponent() {
  return (
    <Box bg="brandPrimary" p="4"> {/* Chakra resolves 'brandPrimary' and '4' to CSS vars */}
      <Heading color="textInverse">Chakra & Tokens</Heading>
      <Text color="textInverse" fontSize="lg">
        This component uses tokens via Chakra UI.
      </Text>
      <Button variant="solid" mt="4">Action</Button> {/* 'solid' variant uses themed tokens */}
    </Box>
  );
}
```

## Token Categories

The tokens in `frontend/src/styles/tokens.css` are organized (or can be thought of) in categories similar to this:

*   `colors`: Core palettes and semantic color definitions.
*   `typography`: Font families, sizes, weights, line heights.
*   `spacing`: Scale for margins, paddings.
*   `sizing`: Widths, heights.
*   `borders`: Widths, styles.
*   `radii`: Border radius values.
*   `shadows`: Box shadows.
*   `zIndices`: Stacking order.
*   `breakpoints`: Screen widths for responsive design.

Refer directly to `frontend/src/styles/tokens.css` for the complete and definitive list of available tokens and their values.

## Adding or Modifying Tokens

1.  **Open `frontend/src/styles/tokens.css`**.
2.  **Define New or Update Existing Tokens:**
    *   Add new CSS Custom Properties under the `:root` selector.
    *   Follow the established naming convention (e.g., `--group-property-variant`).
    *   For semantic tokens, consider referencing core/primitive tokens using `var()` for better maintainability (e.g., `--colors-brandPrimary: var(--core-colors-blue-500);`).
    *   For core tokens (like new color shades), add them directly.
    *   Example: Adding a new semantic text color.
        ```css
        /* in frontend/src/styles/tokens.css */
        :root {
          /* ... existing tokens ... */
          --colors-textSubtle: var(--core-colors-neutralGray-600); /* New token */
        }
        ```
3.  **Update Chakra Theme (If Necessary):**
    *   If the new token is intended to be part of Chakra's theme scale (e.g., a new named color, a new spacing unit that Chakra components should recognize by an alias), you must update `frontend/src/theme/chakra-theme.ts` to map the Chakra theme key to the new CSS variable.
    *   Example: If you added `--colors-brandNewSpecial`, you might add `brandNewSpecial: 'var(--colors-brandNewSpecial)'` to the `colors` object in `chakra-theme.ts`.
4.  **Use the New Token:**
    *   In CSS Modules: `color: var(--colors-textSubtle);`
    *   In Chakra (if mapped): `<Text color="textSubtle">...` or `<Box sx={{ color: "var(--colors-textSubtle)"}}>...`

Always ensure this documentation (`DESIGN_TOKENS.md`) is kept up-to-date if significant structural changes or new categories of tokens are introduced. For individual token additions/updates, `frontend/src/styles/tokens.css` serves as the primary reference.

## Styling TSX Components

All custom styling for TSX components **must** be done using CSS Modules (`.module.css` files) that consume the design tokens as CSS Custom Properties from `frontend/src/styles/tokens.css`.

**Mandatory Practices:**

1.  **Use CSS Modules:** For any new component requiring custom styles, create an associated `[ComponentName].module.css` file.
2.  **Consume Design Tokens in CSS Modules:** All values (colors, spacing, typography, etc.) in your CSS Modules must come from `tokens.css` via `var(--token-name)`.
3.  **No Inline Styles with Hardcoded Values:** Avoid the `style` prop with hardcoded design values (e.g., `style={{ color: '#FFFFFF' }}`).
4.  **No Hardcoded Token Values in TSX/JS:** Do not replicate token values in TSX/JS.

**Chakra UI Components:**
*   Style Chakra UI components primarily through the `chakra-theme.ts` customization, which itself uses the CSS variables from `tokens.css`.
*   Use Chakra's style props, which will leverage the themed values.
*   Avoid overriding Chakra components with custom CSS Modules if styling can be achieved via theme customization or style props. CSS Modules can be used sparingly for structural styles not covered by Chakra's theming system.

**Rationale:**
Adhering to these practices ensures:
*   **Single Source of Truth:** `tokens.css` remains the definitive source.
*   **Maintainability:** Styles are easy to find and update.
*   **Consistency:** Visual design is uniform across the application.

### Example: Refactoring from Inline Styles to CSS Modules

**Before (Bad Practice - Inline Styles):**
```tsx
// BadCard.tsx - Illustrative Example
function BadCard({ title, text }) {
  return (
    <div style={{
      padding: '16px', // Hardcoded
      backgroundColor: '#FFFFFF', // Hardcoded
      border: '1px solid #DDDDDD', // Hardcoded
      borderRadius: '8px', // Hardcoded
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Hardcoded
    }}>
      <h3 style={{ fontSize: '20px', color: '#333333', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#555555' }}>{text}</p>
    </div>
  );
}
```

**After (Good Practice - CSS Modules with Tokens):**
```tsx
// GoodCard.tsx - Illustrative Example
import styles from './GoodCard.module.css';

function GoodCard({ title, text }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardText}>{text}</p>
    </div>
  );
}
```
```css
/* GoodCard.module.css - Illustrative Example */
.card {
  padding: var(--spacing-4); /* Token */
  background-color: var(--colors-bgSurface); /* Token */
  border: var(--borders-width-xs) var(--borders-style-solid) var(--colors-borderDecorative); /* Tokens */
  border-radius: var(--radii-lg); /* Token */
  box-shadow: var(--shadows-sm); /* Token */
}

.cardTitle {
  font-size: var(--typography-fontSizes-h5); /* Token */
  color: var(--colors-textPrimary); /* Token */
  font-weight: var(--typography-fontWeights-semibold); /* Token */
  margin-bottom: var(--spacing-2); /* Token */
}

.cardText {
  font-size: var(--typography-fontSizes-sm); /* Token */
  color: var(--colors-textSecondary); /* Token */
  line-height: var(--typography-lineHeights-regular); /* Token */
}
```
This "BadCard" / "GoodCard" example illustrates the principle. Ensure your actual components follow this pattern.

## Dark Mode / Theming

Currently, `frontend/src/styles/tokens.css` defines a single (typically light) theme. To implement dark mode or other themes:

1.  **Define Themed Variables:** In `tokens.css`, you would redefine CSS Custom Properties within a scoped selector, such as `[data-theme="dark"]` or by using `prefers-color-scheme: dark` media query.
    ```css
    /* frontend/src/styles/tokens.css */
    :root {
      /* Default (Light Theme) Tokens */
      --colors-bgCanvas: var(--core-colors-white);
      --colors-textPrimary: var(--core-colors-neutralGray-900);
      /* ... other light theme tokens ... */
    }

    [data-theme="dark"] {
      --colors-bgCanvas: var(--core-colors-neutralGray-900);
      --colors-textPrimary: var(--core-colors-neutralGray-100);
      /* ... redefine other tokens for dark mode ... */

      /* Example: Adjusting brand primary for dark mode if needed */
      /* --colors-brandPrimary: var(--core-colors-blue-400); */
    }

    /* Alternatively, using prefers-color-scheme for automatic OS-level theming */
    @media (prefers-color-scheme: dark) {
      /* :root { /* You might scope to :root if not using data-theme switcher */
      /* For compatibility, if using data-theme, you might have a separate set of overrides */
      /* or a JS mechanism to set data-theme based on prefers-color-scheme */
      /* --colors-bgCanvas: var(--core-colors-neutralGray-900); */
      /* --colors-textPrimary: var(--core-colors-neutralGray-100); */
      /* } */
    }
    ```
2.  **Theme Switching Logic:** Implement a mechanism in your application (e.g., a button that toggles a `data-theme="dark"` attribute on the `<html>` or `<body>` tag) to switch between themes if you are using the `data-theme` attribute approach. Chakra UI's `useColorMode` hook can be used to manage and toggle `config.initialColorMode` and `config.useSystemColorMode` in `chakra-theme.ts`, which can then apply the `[data-theme="dark"]` (or similar) selector.

By redefining the same CSS Custom Property names under different scopes, components using `var(--token-name)` will automatically adapt to the current theme without any changes to the component's styles or Chakra UI configuration.

---
This documentation provides a starting point. As the system evolves, so should this guide. 