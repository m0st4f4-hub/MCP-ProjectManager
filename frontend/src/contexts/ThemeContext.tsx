"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useLayoutEffect,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// ThemeContext provides light/dark mode state and toggling for the entire app.
// This context is the bridge between user/system preference, Chakra UI, and the TypeScript token system.

// Helper function to get initial theme (avoids repeating logic)
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    // Default for server-side rendering (or if window access fails)
    return "light";
  }
  try {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }
    // If no stored preference, use OS-level preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (error) {
    console.error("Error reading theme preference:", error);
    return "light"; // Fallback
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // State holds the current theme ('light' or 'dark')
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // useLayoutEffect ensures the theme class and data-theme attribute are set on <html> before paint
  // This enables Chakra UI's color mode system and the TypeScript token system to pick up the correct theme instantly
  useLayoutEffect(() => {
    // No need for isMounted check here as it runs client-side anyway
    // And we want the class applied immediately based on initial state.
    try {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
      // Set data-theme attribute for theme scoping (used by Tailwind and for potential future extensions)
      root.setAttribute("data-theme", theme);
      // Persist theme preference in localStorage
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Error applying theme:", error);
    }
    // Update localStorage whenever theme changes
  }, [theme]);

  // toggleTheme switches between light and dark mode
  // This triggers a re-render and updates the DOM, enabling token-based theming
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      return newTheme;
    });
  };

  // Provide theme state and toggler to all children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
