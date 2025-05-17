# Design Token System Documentation

This document outlines the structure and usage of the design tokens for this project. The **single source of truth (SSOT)** for all design tokens is the TypeScript files: `frontend/src/tokens/colors.ts`, `frontend/src/tokens/sizing.ts`, `frontend/src/tokens/typography.ts`, and `frontend/src/tokens/index.ts`.

## Philosophy

Our design token system is built using TypeScript constants. This approach ensures that design values are defined once and can be easily consumed by both Chakra UI and Tailwind CSS, as well as any custom logic in the codebase.

The core principles are:
*   **Simplicity:** Tokens are defined directly in TypeScript, eliminating build steps or complex transformations for their basic use.
*   **Maintainability:** All design values are centralized in TypeScript files under `frontend/src/tokens/`. Changes here propagate throughout the application via imports.
*   **Consistency:** Using a defined set of TypeScript tokens ensures visual consistency across all UI elements.

Tokens are organized into two conceptual layers in TypeScript:

1.  **Core/Primitive Tokens:**
    *   These are foundational values (e.g., specific hex codes for color palettes, or pixel values for spacing).
    *   They often serve as the basis for semantic tokens.
    *   Example:
        ```typescript
        // frontend/src/tokens/colors.ts
        export const colorPrimitives = {
          blue50: '#e6f7ff',
          blue100: '#bae7ff',
          blue500: '#1890ff',
          // ... more blue scale ...
        };
        export const spacing = {
          0: '0px',
          1: '4px',
          2: '8px',
        };
        ```

2.  **Semantic Tokens:**
    *   These tokens give contextual meaning to primitive values or define specific values directly (e.g., `brandPrimary`, `spacingMd`).
    *   **These are the primary tokens that should be consumed by components and styling logic.**
    *   Example:
        ```typescript
        // frontend/src/tokens/colors.ts
        export const semanticColors = {
          brandPrimary: colorPrimitives.blue500,
          textPrimary: colorPrimitives.neutralGray900,
        };
        export const spacingMd = spacing[4]; // 16px
        ```

## File Structure

*   **`frontend/src/tokens/`**: The single source of truth. These files contain all design token definitions as TypeScript constants.
*   **`frontend/src/theme/chakra-theme.ts`**: Imports tokens from TypeScript and configures Chakra UI's theme.

## Token Naming Convention

TypeScript tokens follow a consistent naming convention and are imported directly.

## Accessing Tokens

### 1. Using Tokens in Components

TypeScript tokens are available via import. Use them directly in your components and theme files.

**Example:**

```typescript
import { semanticColors, spacing } from '@/tokens/colors';

function MyComponent() {
  return <div style={{ backgroundColor: semanticColors.brandPrimary, padding: spacing[4] }}>Hello Tokens!</div>;
}
```

### 2. Using Tokens with Chakra UI

Chakra UI has been configured in `frontend/src/theme/chakra-theme.ts` to use the TypeScript tokens from `@tokens`.

*   **Theme Scale:** Chakra's theme scale (e.g., `colors.brandPrimary`, `space[4]`, `fontSizes.lg`) is mapped to use the imported TypeScript tokens.
    ```typescript
    // frontend/src/theme/chakra-theme.ts (Conceptual Example)
    const chakraCustomTheme = extendTheme({
      colors: {
        brandPrimary: semanticColors.brandPrimary,
        // ... other color mappings
      },
      space: spacing,
      // ... other theme scales (fontSizes, fontWeights, radii, etc.)
    });
    ```
*   **Component Styles:** Default component styles within the Chakra theme reference the imported TypeScript tokens.

When using Chakra UI components, they will automatically pick up these tokenized values. You can also use Chakra's style props with token aliases if needed, and Chakra will resolve them to the underlying TypeScript token.

```tsx
// Example using Chakra UI
import { Box, Button, Heading, Text } from '@chakra-ui/react';

function ChakraStyledComponent() {
  return (
    <Box bg="brandPrimary" p={4}> {/* Chakra resolves 'brandPrimary' and '4' to token values */}
      <Heading color="textInverse">Chakra & Tokens</Heading>
      <Text color="textInverse" fontSize="lg">
        This component uses tokens via Chakra UI.
      </Text>
      <Button variant="solid" mt={4}>Action</Button> {/* 'solid' variant uses themed tokens */}
    </Box>
  );
}
```

## Token Categories

Refer directly to the TypeScript files in `frontend/src/tokens/` for the complete and definitive list of available tokens and their values.

## Adding or Modifying Tokens

1.  **Open `frontend/src/tokens/`**.
2.  **Define New or Update Existing Tokens:**
    *   Add new TypeScript constants following the established naming convention (e.g., `brandPrimary`, `spacingMd`).
    *   For semantic tokens, consider referencing core/primitive tokens for better maintainability (e.g., `brandPrimary: colorPrimitives.blue500`).
    *   For core tokens (like new color shades), add them directly.
    *   Example: Adding a new semantic text color.
        ```typescript
        // frontend/src/tokens/colors.ts
        export const semanticColors = {
          ...
          textSubtle: colorPrimitives.neutralGray600, // New token
        };
        ```
3.  **Update Chakra Theme (If Necessary):**
    *   If the new token is intended to be part of Chakra's theme scale (e.g., a new named color, a new spacing unit that Chakra components should recognize by an alias), you must update `frontend/src/theme/chakra-theme.ts` to map the Chakra theme key to the new TypeScript constant.
    *   Example: If you added `brandNewSpecial`, you might add `brandNewSpecial: semanticColors.brandNewSpecial` to the `colors` object in `chakra-theme.ts`.
4.  **Use the New Token:**
    *   In components: `color: semanticColors.textSubtle;`
    *   In Chakra (if mapped): `<Text color="textSubtle">...` or `<Box sx={{ color: semanticColors.textSubtle}} >...`

Always ensure this documentation (`DESIGN_TOKENS.md`) is kept up-to-date if significant structural changes or new categories of tokens are introduced. For individual token additions/updates, `frontend/src/tokens/` serves as the primary reference.

## Styling TSX Components

All custom styling for TSX components **must** be done using Chakra UI props or by consuming the design tokens as TypeScript constants.

**Mandatory Practices:**

1.  **Use Chakra UI or TypeScript Tokens:** For any new component requiring custom styles, use Chakra UI props or import tokens from `@tokens`.
2.  **Consume Design Tokens:** All values (colors, spacing, typography, etc.) in your components must come from TypeScript tokens.
3.  **No Inline Styles with Hardcoded Values:** Avoid the `style` prop with hardcoded design values (e.g., `style={{ color: '#FFFFFF' }}`).
4.  **No Hardcoded Token Values in TSX/JS:** Do not replicate token values in TSX/JS.

**Chakra UI Components:**
*   Style Chakra UI components primarily through the `chakra-theme.ts` customization, which itself uses the TypeScript tokens.
*   Use Chakra's style props, which will leverage the themed values.
*   Avoid overriding Chakra components with custom CSS if styling can be achieved via theme customization or style props. Custom CSS can be used sparingly for structural styles not covered by Chakra's theming system.

**Rationale:**
Adhering to these practices ensures:
*   **Single Source of Truth:** TypeScript tokens remain the definitive source.
*   **Maintainability:** Styles are easy to find and update.
*   **Consistency:** Visual design is uniform across the application.

### Example: Refactoring from Inline Styles to Chakra UI/TypeScript Tokens

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

**After (Good Practice - Chakra UI/TypeScript Tokens):**
```tsx
// GoodCard.tsx - Illustrative Example
import { Box, Text, Heading } from '@chakra-ui/react';
import { semanticColors, spacing, radii, shadows, typography } from '@/tokens';

function GoodCard({ title, text }) {
  return (
    <Box
      p={spacing[4]}
      bg={semanticColors.bgSurface}
      borderRadius={radii.lg}
      boxShadow={shadows.sm}
    >
      <Heading fontSize={typography.fontSizes.h5} color={semanticColors.textPrimary} fontWeight={typography.fontWeights.semibold} mb={spacing[2]}>{title}</Heading>
      <Text color={semanticColors.textPrimary}>{text}</Text>
    </Box>
  );
}
```

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

## 🚀 Migration & Refactor Best Practices

As part of the ongoing UI/UX overhaul, the project is migrating from legacy CSS variables and hardcoded values to a modern, dual-layered design token system powered by **Chakra UI** and **Tailwind CSS**.

### 🧩 Migration Guidelines
- **Old pattern:** Direct use of legacy CSS variables (e.g., `var(--core-colors-blue-500)`) or hardcoded values in styles.
- **New pattern:**
  - Use semantic tokens (e.g., `var(--colors-brandPrimary)`) in CSS Modules.
  - Use Chakra UI props referencing theme tokens in TSX components (e.g., `bg="brandPrimary"`, `color="text.primary"`).
  - Avoid inline styles with hardcoded values.
- **Refactor status:**
  - See `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` for a detailed audit and migration log.
  - High-priority files and components are being refactored to use the new system.

### 🛠️ Best Practices
- **Always use tokens** for all design values (colors, spacing, typography, etc.).
- **Prefer Chakra UI props** for component styling; use CSS Modules only for structural/layout styles not covered by Chakra.
- **No hardcoded values** in TSX/JS or inline styles.
- **Document all new tokens** and update this file as the system evolves.
- **Contribute to ongoing refactor:**
  - Reference the audit plan before editing components.
  - Follow naming conventions and update documentation as needed.

### 🧑‍💻 How to Contribute
- Review this file and `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` before making changes.
- Add or update tokens in `frontend/src/tokens/` and ensure they are mapped in `chakra-theme.ts`.
- Refactor components to use tokens and Chakra UI props.
- Update documentation and add inline comments for any non-obvious theming logic.
- If you find undocumented or inconsistent patterns, log them in the audit plan and propose improvements.

### ⚠️ Known Gaps & Ongoing Refactor
- Some components/pages may still use legacy tokens or hardcoded values.
- See the audit plan for current priorities and progress.
- If you encounter legacy patterns, refactor to the new system and document your changes.

---

For more details, see:
- `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` (migration log)
- `frontend/src/theme/chakra-theme.ts` (theme config)

---
This documentation provides a starting point. As the system evolves, so should this guide.

## ⚠️ Update: CSS Modules Removed

All component and page styling is now handled via Chakra UI props and global CSS using the design token system. No CSS Modules (`.module.css` files) are used in the project. All previous references to CSS Modules are deprecated. 