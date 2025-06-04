# UI/UX Design System Specification

**Version:** 1.0
**Last Updated:** May 17, 2025
**Primary Contact:** UserExperienceEnhancer, PresentationLayerSpecialist

## 1. Introduction & Purpose

This document outlines the comprehensive UI/UX design system for the MCP Task Manager frontend. It serves as the central guide for designers and developers to ensure consistency, usability, and accessibility across the application. This specification is based on the new theming strategy, leveraging Chakra UI and Tailwind CSS, and incorporates findings from the `DESIGN_TOKENS.md` and `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md`.

Our design system aims to:
- Establish a consistent and intuitive user experience.
- Accelerate design and development workflows.
- Ensure high standards of accessibility (WCAG 2.1 AA) and usability.
- Provide a clear an d maintainable set of UI patterns and guidelines.

## 2. Core Principles

- **User-Centricity:** Design decisions prioritize user needs, workflows, and ease of use.
- **Consistency:** UI elements and interaction patterns are applied uniformly.
- **Accessibility:** The application must be usable by people with diverse abilities. All new components and refactors must target WCAG 2.1 Level AA compliance.
- **Clarity:** Interfaces should be clear, understandable, and predictable.
- **Efficiency:** Users should be able to complete tasks quickly and with minimal effort.
- **Modularity:** Components are designed to be reusable and adaptable.

## 3. Theming Strategy & Design Tokens

The foundation of our visual design is the new theming strategy detailed in `DESIGN_TOKENS.md`.

### 3.1. Token Source of Truth
- **TypeScript Tokens:** The single source of truth (SSOT) for all design tokens (colors, spacing, typography, etc.) is the set of TypeScript files located in `frontend/src/tokens/`.
- **Consumption:**
    - **Chakra UI:** The theme in `frontend/src/theme/chakra-theme.ts` consumes these TypeScript tokens.
    - **Tailwind CSS:** The configuration in `frontend/tailwind.config.ts` also consumes these TypeScript tokens.
    - **Direct TSX Usage:** Components can directly import and use tokens from `frontend/src/tokens/`.

### 3.2. Color System
- **Dual-Layered Strategy:** Utilizes primitive and semantic color tokens.
    - **Primitive Colors:** Base color palette (e.g., `colorPrimitives.blue500`).
    - **Semantic Colors:** Contextual color names (e.g., `semanticColors.brandPrimary`, `semanticColors.textPrimary`). These support light and dark modes by defining `DEFAULT` and `dark` variants (or `_dark` in Chakra's semantic token configuration).
- **Usage:** Always prefer semantic tokens in components. Primitives are primarily for defining semantic tokens.
- **Dark Mode:** Supported via `darkMode: "class"` in Tailwind and `initialColorMode: "light"`, `useSystemColorMode: false` with semantic token transformations in Chakra. Theme switching logic should manage the `data-theme` attribute or leverage Chakra's color mode.

### 3.3. Typography
- **Font Family:** Geist Sans (variable: `--font-geist-sans`) and Geist Mono (variable: `--font-geist-mono`) are configured in `layout.tsx` and integrated into Tailwind/Chakra.
- **Scale:** Defined in `frontend/src/tokens/typography.ts` (fontSizes, fontWeights, lineHeights).
- **Usage:** Utilize Chakra UI's `Heading`, `Text` components or Tailwind typography utilities, which are configured to use the typography tokens.

### 3.4. Spacing & Sizing
- **Scale:** Consistent spacing and sizing units are defined in `frontend/src/tokens/sizing.ts`.
- **Usage:** Use Chakra UI layout props (e.g., `p={4}`, `m="2"`) which map to the spacing scale, or Tailwind spacing utilities. Direct import for custom calculations is also possible.
- **Units:** Primarily `rem` and `px` where appropriate, managed via the token definitions.

### 3.5. Other Tokens
- **Shadows, Radii, Borders, Opacity, Z-Index, Breakpoints, Transitions:** Defined in respective files within `frontend/src/tokens/` and integrated into Tailwind and Chakra UI configurations.

### 3.6. Patterns for Using Chakra/Tailwind Tokens

1.  **Chakra UI First (for complex components and layout):**
    *   Leverage Chakra UI components for pre-styled, accessible UI elements (Buttons, Modals, Menus, Forms, etc.).
    *   Customize Chakra components via `frontend/src/theme/chakra-theme.ts` using the TypeScript tokens.
    *   Use Chakra style props (`bg`, `color`, `p`, `m`, `fontSize`, etc.) which reference the theme tokens.
    *   Example: `<Button colorScheme="brand">Action</Button>`, `<Box p={4} bg="bgSurface">Content</Box>`.

2.  **Tailwind CSS (for utility styling and rapid prototyping):**
    *   Use Tailwind utility classes for more granular styling needs or when not using a specific Chakra component.
    *   Tailwind is configured to use the same underlying TypeScript tokens.
    *   Example: `<div className="bg-brandPrimary p-4 rounded-lg shadow-md">...</div>`.
    *   **Note:** Avoid mixing heavy Tailwind styling directly on Chakra components if the same can be achieved via Chakra's props or theme, to maintain clarity. Tailwind can be useful for styling plain HTML elements within Chakra components if needed.

3.  **Direct Token Import (for JavaScript/TypeScript logic):**
    *   Import tokens directly from `frontend/src/tokens/` when styles are determined programmatically or for use outside of JSX (e.g., in charting libraries if they accept JS style objects).
    *   Example: `const style = { backgroundColor: semanticColors.brandPrimary };`

4.  **No Hardcoded Values:**
    *   **Strictly avoid** inline styles with hardcoded values (e.g., `style={{ color: '#FF0000' }}`).
    *   **Strictly avoid** undefined CSS classes or custom CSS that doesn't leverage the token system.

## 4. Component Inventory & Priorities

This section should be dynamically updated based on `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` and ongoing development.

### 4.1. Core Components (High Priority - Ensure full token/theme alignment and accessibility)

*   **Buttons:** Standard, IconButton, SplitButton (if exists).
    *   *Guidelines:* Clear affordance, consistent states (hover, focus, active, disabled), accessible naming.
*   **Forms:** Input, Textarea, Select, Checkbox, Radio, Switch, Slider.
    *   *Guidelines:* Accessible labels, error states, validation feedback, keyboard navigation.
*   **Modals:** Dialogs, Confirmation Modals, Popovers, Drawers.
    *   *Guidelines:* Focus trapping, keyboard dismissal, clear actions, accessible titling (`aria-labelledby`, `aria-describedby`).
*   **Navigation:** Menus, Tabs, Breadcrumbs, Pagination, Side Navigation, Top Navigation.
    *   *Guidelines:* Keyboard operability, clear current state indication, logical flow.
*   **Data Display:** Tables, Lists (simple, virtualized), Cards, Badges/Tags, Avatars, Tooltips.
    *   *Guidelines:* Semantic HTML, sortable/filterable if applicable, clear information hierarchy.
*   **Feedback & Status:** Alerts, Toasts/Notifications, Spinners/Loaders, Progress Bars, Skeletons.
    *   *Guidelines:* ARIA live regions for dynamic content, clear visual cues for status.

### 4.2. Application-Specific Components (Medium Priority - Refactor as encountered or planned)

*   `ProjectList.tsx` (Partially Refactored)
*   `TaskItem.tsx` (Refactored - grep based)
*   `TaskControls.tsx` (Compliant)
*   `FilterSidebar.tsx` (Audited & token compliant)
*   `FilterPanel.tsx` (Audited & token compliant)
*   Modal components used in `page.tsx` (`AddTaskModal`, `AddProjectModal`, `AddAgentModal`, `ImportPlanModal`, `CreateProjectModal`, `DevToolsDrawer`) are token compliant
*   `Dashboard.tsx` and its sub-components (`DashboardStatsGrid`, `TaskStatusChart`, etc.)
    *   `DashboardStatsGrid.tsx`: Accessibility improvements made (keyboard, ARIA).
    *   `Dashboard.tsx`: Requires further work for landmarks, ARIA live regions.
*   Views (`ListView.tsx`, `KanbanView.tsx`, `CalendarView.tsx` - if exists)
    *   `ListView.tsx`: Reviewed & Refactored.
    *   `KanbanView.tsx`: Reviewed & Refactored.

### 4.3. Prioritization Strategy
1.  **High-Impact Core Components:** Focus on foundational elements used application-wide.
2.  **High-Traffic Pages/Views:** Address components within the most used parts of the application.
3.  **Accessibility Hotspots:** Prioritize components with known or likely accessibility issues.
4.  **New Development:** All new components MUST adhere to this design system from inception.
5.  Refer to `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` for granular status.

## 5. Accessibility (A11y) & UX Guidelines

### 5.1. General Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation:** All interactive elements must be focusable and operable via keyboard. Logical focus order is essential.
- **Semantic HTML:** Use appropriate HTML5 elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<button>`, etc.) to convey structure and meaning.
- **ARIA Roles & Attributes:** Use ARIA (Accessible Rich Internet Applications) attributes where semantic HTML is insufficient to provide necessary roles, states, and properties for assistive technologies.
    - Example: `role="alert"`, `aria-live`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-busy`, `aria-expanded`, `aria-haspopup`.
- **Text Alternatives:** Provide text alternatives for all non-text content (e.g., `alt` text for images, `aria-label` for icon-only buttons). Decorative icons should be hidden (`aria-hidden="true"`).
- **Color Contrast:** Ensure sufficient color contrast for text and meaningful UI elements as per WCAG AA (4.5:1 for normal text, 3:1 for large text/graphics). Use tools to check.
- **Responsive Design:** Interfaces must be usable and readable across various screen sizes and orientations.
- **Understandable Content:** Use clear language. Ensure error messages are informative and suggest solutions.

### 5.2. UX Guidelines

- **Clarity & Simplicity:** Strive for clean, uncluttered interfaces. Avoid jargon.
- **Feedback:** Provide immediate and clear feedback for user actions (e.g., loading states, success/error messages).
- **Error Prevention & Handling:** Design to prevent errors. When errors occur, explain them clearly and help users recover.
- **Efficiency:** Streamline common workflows. Minimize clicks and cognitive load.
- **Learnability:** Make the interface easy to learn for new users.
- **Affordance:** Interactive elements should clearly look interactive.
- **State Management:** Clearly indicate the state of UI elements (e.g., selected items, disabled controls, loading sections).

### 5.3. Guidelines for New & Legacy Components

- **New Components:** MUST be built from the ground up following all guidelines in this specification, using the established token system and accessible practices.
- **Legacy Components (during refactor):**
    1.  Replace all hardcoded styles and old CSS variables with TypeScript tokens (via Chakra props or Tailwind utilities).
    2.  Audit for accessibility issues (keyboard, ARIA, contrast, etc.) and remediate.
    3.  Ensure semantic HTML structure.
    4.  Test thoroughly.
    5.  Update `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` upon completion.

## 6. Known Gaps & Ongoing Refactor Areas

This section reflects areas requiring further attention. Refer to `COMPONENT_AUDIT_AND_REFACTOR_PLAN.md` for specifics.

- **Incomplete Component Refactors:** Several components listed in the audit plan still have remaining `var(...)` usages or require full alignment with new token/styling patterns.
    - Example: `ProjectList.tsx` has remaining `var(...)` usages.
- **Global CSS (`globals.css`):** Needs a full audit to ensure any global styles do not conflict with the token system and are necessary.
- **Systematic Accessibility Testing:** While guidelines are provided, a more systematic accessibility testing process (manual, automated tools, assistive technology testing) should be implemented across the application.
- **Complex Data Visualizations:** Charts and complex graphs require specific attention to ensure they are accessible (e.g., providing data tables, keyboard interactivity for tooltips, sufficient ARIA descriptions).
- **Comprehensive Icon System Review:** Ensure all icons have appropriate `aria-hidden` or `aria-label` based on context.
- **Motion & Animation:** Define guidelines for motion and animation to ensure they are purposeful and do not cause accessibility issues (e.g., respect `prefers-reduced-motion`).

## 7. Visual Examples from Refactored Components

As this is a text-based specification, direct visual examples cannot be embedded. However, developers and designers should refer to:

1.  **Storybook (If/When Implemented):** A Storybook instance showcasing components with their various states and props would be the ideal place for visual examples.
    *   *Recommendation:* Prioritize setting up Storybook for key reusable components.
2.  **Running Application - Refactored Sections:**
    *   Examine already refactored components in the running application (development environment) to see the new theming and styling in action.
    *   Examples (based on audit plan):
        *   `frontend/src/components/modals/TaskDetailsModal.tsx` (fully refactored)
        *   `frontend/src/components/views/ListView.tsx` (reviewed & refactored)
        *   `frontend/src/components/views/KanbanView.tsx` (reviewed & refactored)
3.  **Screenshots/Figma Links (External):**
    *   If Figma designs exist that align with the new token system, links should be provided here.
    *   For internal documentation, screenshots of before/after refactoring can be very illustrative.
    *   *(Placeholder: Link to Figma Design System board if available)*
    *   *(Placeholder: Link to a shared drive with relevant screenshots if available)*

**Example Snippet (Conceptual - how to refer to a live component):**

> **Button Component:**
> *Visual Reference:* See the primary and secondary button variants implemented on the "Create Task" modal (`frontend/src/components/modals/CreateTaskModal.tsx` - assuming refactored).
> *Key Characteristics:* Uses `brandPrimary` for main actions, `ghost` or `outline` variants for secondary actions. Focus indicators are prominent.

## 8. Collaboration & Governance

- **PresentationLayerSpecialist & UserExperienceEnhancer:** Jointly responsible for maintaining and evolving this design system.
- **Review Process:** Significant changes or additions to the design system (e.g., new core components, major token changes) should be reviewed by both roles and relevant engineering leads.
- **Updates:** This document should be updated regularly to reflect the current state of the UI/UX and component library.

## 9. Future Considerations

- **Storybook Integration:** For interactive component documentation and visual regression testing.
- **Automated Accessibility Testing:** Integrate tools like Axe into CI/CD pipelines.
- **Design Linting:** Explore tools to enforce token usage and styling consistency in code.
- **Animation & Motion System:** Define a clear set of animation principles and tokens.

---
This specification aims to be a living document. Feedback and contributions are encouraged. 