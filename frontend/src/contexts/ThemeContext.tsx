'use client';

import React, { createContext, useContext, useState, ReactNode, useLayoutEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Helper function to get initial theme (avoids repeating logic)
const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        // Default for server-side rendering (or if window access fails)
        return 'light'; 
    }
    try {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
        console.error("Error reading theme preference:", error);
        return 'light'; // Fallback
    }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state WITH the initial theme determined client-side or default
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Use useLayoutEffect to apply the class ASAP before browser paint
  useLayoutEffect(() => {
    console.log('[ThemeContext] Effect running. Theme:', theme); // DEBUG LOG
    // No need for isMounted check here as it runs client-side anyway
    // And we want the class applied immediately based on initial state.
    try {
        const root = window.document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
        // Only update localStorage if the theme isn't the initial guess
        // This avoids writing default 'light' if preference was actually 'dark'
        // A second effect could handle just localStorage if needed for cleaner separation.
        localStorage.setItem('theme', theme); 
    } catch (error) {
        console.error("Error applying theme:", error);
    }
    // Update localStorage whenever theme changes
  }, [theme]); 

  const toggleTheme = () => {
    console.log('[ThemeContext] toggleTheme called.'); // DEBUG LOG
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log(`[ThemeContext] Changing theme from ${prevTheme} to ${newTheme}`); // DEBUG LOG
      return newTheme;
    });
  };

  // Render children immediately now
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 