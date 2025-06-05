# Component Audit and Refactor Plan

This document outlines the audit of existing components and pages for outdated styling practices (inline styles, direct hex codes, old CSS variables) and plans their refactoring to use the new Tailwind CSS-based design token system and Chakra UI theme.

## High-Priority Refactoring Targets (from `var(--...)` grep search)

Based on a `grep_search` for `var(--...)`, the following files have been identified as containing direct usage of old CSS variables and are high-priority candidates for comprehensive refactoring. Each file will be reviewed to replace all old token usages (colors, spacing, typography, etc.) with the new Chakra UI theme and Tailwind-based tokens.

- `frontend/src/components/ProjectList.tsx` (explicit `var(--core-colors-...)` usage)
  - **Status**: Partially Refactored.
  - **Changes Made**:
    - Line 388 (`cardActiveStyles._hover.transform`): `calc(var(--spacing-1) / -2)` -> `-0.125rem`.
    - Line 487 (Delete Project `MenuItem._hover`): `var(--core-colors-red-50)` -> `red.50`, `var(--core-colors-red-700)` -> `red.700`.
  - **Remaining `var(...)` usages (requires file read access to refactor contextually)**:
    - Line 579: `_hover={{ bg: "var(--core-colors-red-50)" }}`
    - Line 671: `bg="var(--core-colors-neutralGray-50)"`
    - Line 672: `color="var(--core-colors-neutralGray-900)"`
    - Line 675: `bg: "var(--core-colors-neutralGray-900)",` (likely dark mode style)
    - Line 676: `color: "var(--core-colors-neutralGray-100)",` (likely dark mode style)
    - Line 677: `borderColor: "var(--core-colors-neutralGray-700)"` (likely dark mode style)
    - Line 729: `_hover={{bg: "var(--core-colors-red-600)"}}`
    - Line 730: `_active={{bg: "var(--core-colors-red-700)"}}`
- `frontend/src/components/modals/TaskDetailsModal.tsx` (extensive usage, including `var(--core-colors-...)`)
  - **Status**: Refactored. All identified `var(--...)` usages (spacing, typography, borders, core-colors, semantic-colors) have been replaced with Chakra UI theme tokens or primitive color values.
- `frontend/src/components/views/ListView.tsx`
  - **Status**: Reviewed & Refactored.
  - **Original State**: Previously marked as "Refactored (grep-based)".
  - **Findings & Actions (May 17, 2025):**
    - **Token Usage**: Component extensively uses Chakra UI with theme tokens. Imports `typography` and `sizing` from `../../tokens`.
    - **`borderBottomWidth="DEFAULT"`**: Verified this correctly maps to `1px` via `sizing.borderWidth.DEFAULT` and `chakra-theme.ts`. No change needed.
    - **Hover States (`_hover`)**: Uses `gray.100` (light) / `gray.600` (dark). Acceptable as no specific semantic token for neutral surface hovers exists. No change needed.
    - **`colorScheme` prop**: Usage for `Checkbox` ("blue") and `Button` ("red") aligns with `primary` and `error` semantic token definitions. No change needed.
    - **Numeric Spacing**: Most numeric spacing props (p, m, pl, etc.) correctly use the theme's spacing scale.
    - **`minHeight` Refactor**: Found two instances of `minHeight="20"` which incorrectly resolved to `5rem`. This was likely intended to be `1.25rem` (20px).
      - **Action**: Changed `minHeight="20"` to `minHeight={sizing.spacing['5']}` in the main loading spinner container and the agent assignment modal's loading spinner container. Added import for `sizing` token.
  - **Overall**: The component is now more aligned with explicit token usage for sizing. Further UI/UX review for overall consistency (beyond direct token usage) may be beneficial as part of broader page/view refactoring.
- `frontend/src/components/VirtualizedList.tsx`
  - **Status**: Reviewed & Compliant.
  - **Finding**: `height="calc(100vh - 12.5rem)"` (Line 26).
  - **Analysis**: The component uses `100vh` (a standard unit) and `12.5rem` (a valid CSS length unit) for its height calculation. The `12.5rem` value is likely specific to this component's layout requirements to fit within the available viewport space after accounting for other UI elements. While not a direct theme _spacing_ token, it's a legitimate use of `rem` units and does not involve legacy CSS variables. No direct token replacement is feasible or necessary for this specific calculation.
  - **Action**: No refactoring needed. Component is compliant.
- `frontend/src/components/views/KanbanView.tsx`
  - **Status**: Reviewed & Refactored.
  - **Original State**: Previously marked as "Refactored (grep-based)" with a specific fix for scrollbar `borderRadius`.
  - **Findings & Actions (May 17, 2025):**
    - **Token Usage**: Component uses `useToken` hook for semantic color tokens (e.g., `surface`, `borderDecorative`), which is good.
    - **Imports Added**: Added imports for `sizing` and `colorPrimitives` from `../../tokens` to resolve direct usage.
    - **Direct Token Usage (Fixed)**:
      - `borderLeftWidth={sizing.borderWidth["2"]}` (for DraggableTaskItem) is now valid with import.
      - Scrollbar `width: sizing.spacing["2"]` is now valid with import.
      - Delete button `_hover={{ bg: colorPrimitives.red[600] }}` is now valid with import. Confirmed no specific `errorHover` semantic token exists, making `red[600]` an acceptable darker shade for hover on an `error` (i.e. `red[500]`) background.
    - **Width Tokenization**:
      - Identified `w={{ base: "kanbanColMobile", ... }}` where `kanbanColMobile` was a hardcoded string.
      - **Action**: Added `kanbanColMobile: "280px"` to `width` tokens in `frontend/src/tokens/sizing.ts`. The component now uses this token.
    - **Spacing Refactor**:
      - Changed `top="8px"` to `top="2"` and `right="8px"` to `right="2"` for the polling status indicator to use theme spacing scale.
      - Other numeric spacing props reviewed and appear to correctly use theme scale keys or appropriate multipliers.
    - **`borderWidth="DEFAULT"`**: Verified this correctly maps to `1px`. No change needed.
  - **Overall**: Component significantly improved for token adherence and explicit theme scale usage.
- `frontend/src/components/TaskItem.tsx`
  - **Status**: Refactored (grep-based).
  - **Change Made**: Line 303 `transform: "translateY(calc(var(--borders-width-xs) * -1))"` changed to `transform: "translateY(-1px)"`.
- `frontend/src/components/TaskControls.tsx`
  - **Status**: Reviewed & Compliant.
  - **Finding**: `mt={!showBulkActionsBar ? `-${sizing.spacing[4]}` : undefined}` (Line 176).
  - **Analysis**: The component correctly uses a template literal with `sizing.spacing[4]` to apply a negative margin. This accesses the theme's spacing scale and creates a valid negative margin value (e.g., `"-1rem"` if `sizing.spacing[4]` is `1rem`). This is a correct and theme-compliant approach.
  - **Action**: No refactoring needed for this line. Component is compliant with token usage.

## Audit Log

### 1. `frontend/src/app/layout.tsx`

- **Status:** Audited.
- **Findings:**
  - Imports `globals.css` (requires separate audit).
  - Uses `next/font` for `Geist` and `Geist_Mono`, applied as CSS variables (`--font-geist-sans`, `--font-geist-mono`) to `html`. This is acceptable and integrates with Tailwind's generic font families.
  - No inline styles (`style={{}}`) found.
  - No direct hex color usage.
  - No obvious use of old tokens.css variables. All tokens are now managed in TypeScript files in frontend/src/tokens/.
- **Refactor Plan:**
  - No immediate refactoring needed for this file itself, pending `globals.css` audit.

### 2. `frontend/src/app/page.tsx`

- **Status:** Audited & Cleaned.
- **Findings:**
  - Extensive use of Chakra UI components and props, many correctly using theme tokens (e.g., `bg="bg-sidebar"`, `color="text.primary"`, spacing props like `p="6"`).
  - **Sidebar Width Tokens:** Corrected to use `sidebarCollapsed` and `sidebarExpanded` from `sizing.ts`.
  - **CSS Modules:** All commented-out `className={styles.xxx}` attributes have been removed. The `frontend/src/app/layout.module.css` was found to be empty. Assumed that any previous CSS module styles specific to this page are now superseded by Chakra UI props and the new token system.
  - **Images:** Logo/icon paths are `/assets/images/icon_dark.png`, etc. This is fine.
  - **Modals:** Generally well-styled using semantic tokens for `bg`, `color`, `borderColor` (e.g., `ModalContent bg="bg.modal"`).
  - `backdropFilter="blur(2px)"` on `ModalOverlay` is a direct CSS property. Could be tokenized if blur is used systematically (Low priority).
  - No direct inline styles (`style={{}}`) or hardcoded hex colors found in the JSX.
- **Refactor Plan / Action Items:**
  - **DONE - Define Sidebar Width Tokens:** Added `sidebarCollapsed` and `sidebarExpanded` to `frontend/src/tokens/sizing.ts` and updated usage in `page.tsx`.
  - **DONE - Remove CSS Modules References:** Commented-out `className` attributes removed from `page.tsx`.
  - **DONE - Audit `FilterSidebar` component**: Reviewed for legacy styles and replaced remaining `rem` values with `sizing` tokens.
  - **DONE - Audit `frontend/src/app/globals.css`**: Migrated font and modal styles to Tailwind tokens.
  - **TODO - Review remaining UI components** listed in `page.tsx` imports: `TaskList`, `

### 7. Tailwind CSS Configuration Audit (`frontend/tailwind.config.ts`) (2025-05-17)

**File Audited:**

- `frontend/tailwind.config.ts`

**Associated Token & Theme Files Reviewed:**

- `frontend/src/tokens/colors.ts`
- `frontend/src/tokens/sizing.ts`
- `frontend/src/tokens/typography.ts`
- `frontend/src/tokens/index.ts` (and other specific token files like `shadows.ts`, `opacity.ts`, etc.)
- `frontend/src/theme/chakra-theme.ts`

**Findings:**

- **Token Integration**: The `tailwind.config.ts` file demonstrates excellent integration with the project's design token system located in `frontend/src/tokens/`. It correctly imports and spreads `colorPrimitives`, `semanticColors`, `typography`, `sizing`, `shadows`, `zIndex`, `breakpoints`, `transitions`, and `opacity` tokens into the `theme.extend` section.
- **Dark Mode**: Configuration is set to `darkMode: "class"`, which aligns with common practices for JavaScript-controlled theme toggles and is compatible with how `semanticColors` provide `DEFAULT` and `dark` variants.
- **Content Paths**: The `content` array includes standard paths for a Next.js/React application (`./src/pages`, `./src/components`, `./src/app`) and also `./src/tokens/**/*.{js,ts}`. This seems appropriate for scanning class usage.
- **Chakra Synergy**: The Tailwind configuration is harmonious with the `chakra-theme.ts` setup, as both consume the same core token definitions. This promotes consistency between Tailwind utilities and Chakra components.
- **No Hardcoded Values**: No obvious hardcoded values were found that should be replaced by tokens; the configuration relies on the imported token objects.

**Actions Taken:**

- No refactoring of `tailwind.config.ts` was necessary as it appears to be well-structured and correctly configured according to the project's theming strategy.
- Attempted to run `npm run lint`, `npm run type-check`, and `npx tsc --noEmit` for verification, but these scripts were either missing or the environment was not configured for them to execute successfully. Manual review and conceptual testing of utility/dark mode generation were performed.

**Verification Plan (Conceptual):**

- **Utility Class Generation**: Confirmed that tokens are mapped in a way that Tailwind can generate utility classes (e.g., `bg-primary`, `p-4`).
- **Dark Mode**: Confirmed that the `darkMode: "class"` setup, combined with `semanticColors` having `DEFAULT` and `dark` variants, should allow Tailwind utilities to adapt correctly to dark mode.

**Overall Assessment**:

- The Tailwind CSS configuration is robust, modern, and fully aligned with the centralized token-based theming system. It effectively supports both light and dark modes and provides a consistent design language alongside Chakra UI.

---

### 8. Chakra UI Theme Configuration Audit (`frontend/src/theme/chakra-theme.ts`) (2025-05-17)

**File Audited:**

- `frontend/src/theme/chakra-theme.ts`

**Associated Token & Theme Files Reviewed:**

- `frontend/src/tokens/*` (via `frontend/src/tokens/index.ts`)

**Findings:**

- **Token Integration**: The `chakra-theme.ts` file shows excellent integration with the project's design token system. It correctly imports tokens from `../tokens` and maps them to Chakra UI's theme structure, including `colorPrimitives`, `semanticColors` (transformed appropriately), `typography` scales (fonts, fontSizes, fontWeights, lineHeights), and `sizing` scales (space, sizes, radii, borderWidths).
- **Dark Mode**: The `initialColorMode: "light"` and `useSystemColorMode: false` configuration is clear. Semantic colors are correctly transformed to provide `default` and `_dark` variants for Chakra's `semanticTokens`.
- **Structure**: The theme extension is well-structured, following Chakra UI's `extendTheme` patterns.
- **Completeness**: Most core token categories are well-represented. Tokens for `shadows`, `zIndex`, `breakpoints`, `transitions`, and `opacity` are not explicitly mapped, which is acceptable as Tailwind and component-specific props often handle these, or Chakra's defaults are used.
- **Global Styles**: The file contained commented-out global styles for `body`.

**Actions Taken:**

- **Refined Global Styles**: Uncommented the `styles.global.body` section and updated it to use `appSemanticColors.onBackground` and `appSemanticColors.background` for text and background colors, correctly respecting light/dark mode. This ensures a baseline body style consistent with the defined semantic tokens.
- No other structural refactoring of `chakra-theme.ts` was deemed necessary as it already aligns well with the project's token strategy.

**Verification Plan (Conceptual):**

- **Type Safety**: Code appears type-safe (though direct TSC check was not performed in this step).
- **Token Mapping**: Confirmed logical mapping of project tokens to Chakra theme scales.
- **Global Style Application**: The new global body styles should now apply application-wide.

**Overall Assessment**:

- The Chakra UI theme configuration is robust and well-integrated with the project's token system. The refinement to global body styles enhances baseline consistency.
