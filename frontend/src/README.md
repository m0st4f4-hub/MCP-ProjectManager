# Frontend Source (`frontend/src/`)

This directory contains the primary source code for the frontend application.

## Key Files

-   `react-18-shims.d.ts`: This TypeScript definition file ensures compatibility with React 18. It extends the base React type definitions, particularly for HTML element types, by declaring a `ReactHTML` interface within the `'react'` module. It also includes some legacy validation map types (`ValidationMap`, `WeakValidationMap`) and a simplified `Validator` type.

-   `theme.ts`: Defines the visual theme for the application using Chakra UI. It exports a `theme` object configured with:
    *   **Colors**: A base color palette (`colors`) including `brand` colors (primary, secondary, accent) and various shades for `blue` and `gray`.
    *   **Semantic Tokens**: `semanticTokens` are used to map abstract theme concepts (e.g., `bg.default`, `text.primary`) to specific color values for both light and dark modes. This allows for consistent theming across different color modes.
    *   **Configuration**: Basic theme configuration (`config`) such as `initialColorMode` (set to 'system') and `useSystemColorMode` (set to `true`).
    *   The theme is created using `extendTheme` from `@chakra-ui/react`.

## Subdirectories

The `src/` directory is further organized into the following subdirectories:

-   `app/`: Likely contains application-specific pages or core routing logic (Next.js app router).
-   `components/`: Houses reusable UI components used throughout the application.
-   `contexts/`: Contains React context providers for managing global state or shared functionality.
-   `lib/`: Utility functions, helper scripts, or third-party library configurations.
-   `providers/`: Wrappers or providers for libraries or services (e.g., theme provider, query client provider).
-   `services/`: Modules for interacting with APIs or backend services.
-   `store/`: State management setup (e.g., Zustand, Redux, or other global state stores).
-   `theme/`: May contain more granular theme customizations, overrides, or theme-related assets (although `theme.ts` is at the `src/` root).
-   `types/`: TypeScript type definitions and interfaces used across the application.
-   `__tests__/`: Contains test files, likely for unit or integration testing of the components and logic within the `src/` directory. 