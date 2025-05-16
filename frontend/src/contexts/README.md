# Frontend Contexts (`frontend/src/contexts/`)

This directory contains React Context providers and hooks for managing global or widely shared state across the frontend application.

## Files

### `ProjectContext.tsx`
-   **Purpose**: Intended to provide a React Context for project-related data or functionality.
-   **Current Status**: This context is currently a **placeholder**. It initializes an empty context object.
-   **Exports**:
    -   `ProjectContext`: The React Context object (`React.createContext({})`).
    -   `ProjectProvider`: A component that wraps its children with `ProjectContext.Provider`. It currently provides an empty object (`{}`) as the context value.
        -   Props: `children: React.ReactNode`
        -   Syntax: `export const ProjectProvider = ({ children }) => { ... };`
    -   `useProjectContext`: A custom hook to access the `ProjectContext` value (`React.useContext(ProjectContext)`).
        -   Syntax: `export const useProjectContext = () => React.useContext(ProjectContext);`
-   **Note**: A `TODO` comment in the file suggests that this context either needs to be fully implemented with actual project-related state and logic or removed if it's not required.

### `ThemeContext.tsx`
-   **Purpose**: Provides a React Context to manage and toggle the application's visual theme (light or dark mode).
-   **Key Features**:
    -   **Theme State**: Manages the current theme (`'light'` or `'dark'`).
    -   **Initial Theme Detection**: On initialization, it determines the theme by:
        1.  Checking `localStorage` for a user-saved theme preference.
        2.  If not found, it respects the user's operating system preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
        3.  Defaults to `'light'` for server-side rendering or if detection fails.
    -   **Theme Application**: Uses `useLayoutEffect` to immediately apply the theme. It adds/removes `'light'` or `'dark'` CSS classes to the `<html>` element.
    -   **Persistence**: Saves the selected theme to `localStorage` whenever it changes.
    -   **Toggle Functionality**: Provides a `toggleTheme` function to switch between light and dark modes.
-   **Exports**:
    -   `ThemeProvider`: The context provider component. This component should wrap the parts of the application that need access to theme management.
        -   Props: `children: React.ReactNode`
        -   Syntax: `export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => { ... };`
    -   `useTheme`: A custom hook that allows components to access the current theme and the `toggleTheme` function.
        -   Returns: ` { theme: Theme; toggleTheme: () => void; } ` (where `Theme` is `'light' | 'dark'`)
        -   Throws an error if used outside of a `ThemeProvider`.
        -   Syntax: `export const useTheme = (): ThemeContextProps => { ... };`
-   **Usage Example**:
    ```tsx
    // In your main application file or layout component
    import { ThemeProvider } from './contexts/ThemeContext';

    function App() {
      return (
        <ThemeProvider>
          {/* Rest of your application */}
        </ThemeProvider>
      );
    }

    // In a component that needs to use the theme
    import { useTheme } from './contexts/ThemeContext';

    function MyComponent() {
      const { theme, toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      );
    }
    ```

## Subdirectories

-   `__mocks__/`: This directory is typically used to store manual mocks for Jest testing. Any files within it would be specific to mocking the contexts for test environments. 