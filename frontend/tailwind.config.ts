import type { Config } from "tailwindcss";
// Import Tailwind's full default colorPalette
import twColors from "tailwindcss/colors"; // Re-import twColors
import {
  colorPrimitives,
  semanticColors,
  typography,
  sizing,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  opacity,
} from './src/tokens'; // Updated import path

// Define semantic colors by mapping to Tailwind's default palette // This local definition will be removed
// const semanticColors = { ... }; // REMOVE THIS ENTIRE BLOCK

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/tokens/**/*.{js,ts}", // Ensure Tailwind scans token files if they contain classes
    // If your tokens.ts file or other theme files are being scanned, ensure they are here
    // e.g. "./src/tokens/**/*.{js,ts}" 
  ],
  darkMode: "class", // or 'media' based on your setup
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ...twColors,        // Start with the full Tailwind palette
        ...colorPrimitives, // Add/override with our color primitives
        ...semanticColors,  // Add/override with our semantic colors
        // Any other custom colors previously defined here can remain if needed
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: sizing.spacing,
      width: sizing.width,
      height: sizing.height,
      borderRadius: sizing.borderRadius,
      borderWidth: sizing.borderWidth,
      // --- New Design Tokens ---
      boxShadow: shadows,
      zIndex: zIndex,
      screens: breakpoints,
      transitionDuration: transitions.duration,
      transitionTimingFunction: transitions.easing,
      opacity: opacity,
      // ------------------------
    },
  },
  plugins: [
    // any plugins
  ],
};

export default config; 