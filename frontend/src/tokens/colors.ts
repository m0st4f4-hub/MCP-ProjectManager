// frontend/src/tokens/colors.ts

// Using Tailwind CSS default color palette names and shades for primitives
// Source: https://tailwindcss.com/docs/customizing-colors#default-color-palette
// We are defining them here to make them explicitly available as JS constants
// and to be the single source of truth for the tailwind.config.ts extension.

export const colorPrimitives = {
  transparent: "transparent",
  current: "currentColor",
  white: "#ffffff",
  black: "#000000",

  // Using Tailwind\'s \'neutral\' as our \'gray\' for a balanced gray palette
  gray: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  // Using Tailwind\'s \'blue\'
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  // Using Tailwind\'s \'green\'
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  // Using Tailwind\'s \'red\'
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  // Using Tailwind\'s \'yellow\'
  yellow: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
  },
  // Using Tailwind\'s \'orange\'
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  // Using Tailwind\'s \'purple\'
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  // Using Tailwind\'s \'teal\' (which is itself \'cyan\' in Tailwind v3)
  // For clarity, let\'s use \'cyan\' as per Tailwind\'s naming
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },
};

export const semanticColors = {
  // Core Brand Colors
  primary: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  onPrimary: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.blue[50] },
  primaryHover: { DEFAULT: colorPrimitives.blue[600], dark: colorPrimitives.blue[300] },
  primaryActive: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[500] },
  secondary: { DEFAULT: colorPrimitives.gray[500], dark: colorPrimitives.gray[400] },
  onSecondary: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[50] },
  accent: { DEFAULT: colorPrimitives.purple[500], dark: colorPrimitives.purple[400] },
  onAccent: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.purple[50] },

  // UI Surfaces & Backgrounds
  background: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[900] },
  onBackground: { DEFAULT: colorPrimitives.gray[800], dark: colorPrimitives.gray[100] },
  surface: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[800] },
  onSurface: { DEFAULT: colorPrimitives.gray[700], dark: colorPrimitives.gray[200] },
  surfaceElevated: { DEFAULT: colorPrimitives.gray[50], dark: colorPrimitives.gray[700] },
  bgModal: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[800] }, // Alias for surface for modals
  bgInput: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[700] }, // Specific for inputs
  bgDisabled: { DEFAULT: colorPrimitives.gray[100], dark: colorPrimitives.gray[700] },
  overlayDefault: { DEFAULT: "rgba(0, 0, 0, 0.4)", dark: "rgba(0, 0, 0, 0.6)" },


  // Active Menu Item
  menuItemActive: { DEFAULT: colorPrimitives.blue[50], dark: colorPrimitives.gray[700] },
  onMenuItemActive: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[300] },

  // Text Colors
  textPrimary: { DEFAULT: colorPrimitives.gray[900], dark: colorPrimitives.gray[50] },
  textSecondary: { DEFAULT: colorPrimitives.gray[600], dark: colorPrimitives.gray[400] },
  textTertiary: { DEFAULT: colorPrimitives.gray[500], dark: colorPrimitives.gray[500] },
  textPlaceholder: { DEFAULT: colorPrimitives.gray[400], dark: colorPrimitives.gray[500] },
  textDisabled: { DEFAULT: colorPrimitives.gray[400], dark: colorPrimitives.gray[600] },
  textLink: { DEFAULT: colorPrimitives.blue[600], dark: colorPrimitives.blue[400] },
  textLinkHover: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[300] },
  textLinkActive: { DEFAULT: colorPrimitives.blue[800], dark: colorPrimitives.blue[200] },
  textInput: { DEFAULT: colorPrimitives.gray[800], dark: colorPrimitives.gray[100] }, // For text inside inputs
  textInverse: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[900] }, // Text on dark/light contrasting backgrounds

  // Borders & Dividers
  borderDecorative: { DEFAULT: colorPrimitives.gray[200], dark: colorPrimitives.gray[700] },
  borderInteractive: { DEFAULT: colorPrimitives.gray[400], dark: colorPrimitives.gray[600] },
  borderFocused: {
    // Border for focused elements (often primary color)
    DEFAULT: colorPrimitives.blue[500],
    dark: colorPrimitives.blue[400],
  },
  borderHover: { 
    DEFAULT: colorPrimitives.gray[500],
    dark: colorPrimitives.gray[500],
  },
  borderDisabled: {
    DEFAULT: colorPrimitives.gray[200],
    dark: colorPrimitives.gray[700],
  },


  // Status & Feedback
  // Success
  success: { DEFAULT: colorPrimitives.green[500], dark: colorPrimitives.green[400] },
  onSuccess: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.green[50] },
  successBgSubtle: { DEFAULT: colorPrimitives.green[50], dark: colorPrimitives.green[900] },
  textStatusSuccess: { DEFAULT: colorPrimitives.green[700], dark: colorPrimitives.green[300] },
  borderSuccess: { DEFAULT: colorPrimitives.green[500], dark: colorPrimitives.green[400] },
  // Warning
  warning: { DEFAULT: colorPrimitives.yellow[500], dark: colorPrimitives.yellow[400] },
  onWarning: { DEFAULT: colorPrimitives.gray[900], dark: colorPrimitives.yellow[50] },
  warningBgSubtle: { DEFAULT: colorPrimitives.yellow[50], dark: colorPrimitives.yellow[900] },
  textStatusWarning: { DEFAULT: colorPrimitives.yellow[700], dark: colorPrimitives.yellow[300] },
  borderWarning: { DEFAULT: colorPrimitives.yellow[500], dark: colorPrimitives.yellow[400] },
  // Error / Danger
  error: { DEFAULT: colorPrimitives.red[500], dark: colorPrimitives.red[400] },
  onError: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.red[50] },
  errorBgSubtle: { DEFAULT: colorPrimitives.red[50], dark: colorPrimitives.red[900] },
  textStatusError: { DEFAULT: colorPrimitives.red[700], dark: colorPrimitives.red[300] },
  borderDanger: { DEFAULT: colorPrimitives.red[500], dark: colorPrimitives.red[400] },
  // Info
  info: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  onInfo: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.blue[50] },
  infoBgSubtle: { DEFAULT: colorPrimitives.blue[50], dark: colorPrimitives.blue[800] },
  textStatusInfo: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[300] },
  borderInfo: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  // Neutral (for Archived badges, etc.)
  neutral: { DEFAULT: colorPrimitives.gray[500], dark: colorPrimitives.gray[400] },
  onNeutral: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[50] },
  neutralBgSubtle: { DEFAULT: colorPrimitives.gray[100], dark: colorPrimitives.gray[700] },
  textNeutral: { DEFAULT: colorPrimitives.gray[600], dark: colorPrimitives.gray[300] },
  textNeutralEmphasis: { DEFAULT: colorPrimitives.gray[800], dark: colorPrimitives.gray[100] },
  borderNeutral: { DEFAULT: colorPrimitives.gray[300], dark: colorPrimitives.gray[600] },

  // Icon Colors
  iconPrimary: { DEFAULT: colorPrimitives.gray[700], dark: colorPrimitives.gray[300] },
  iconSecondary: { DEFAULT: colorPrimitives.gray[500], dark: colorPrimitives.gray[500] },
  iconAccent: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  iconDisabled: { DEFAULT: colorPrimitives.gray[400], dark: colorPrimitives.gray[600] },
  iconInverse: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[900] },


  // Interactive States (for buttons, list items, etc.)
  // Primary (usually brand color based)
  interactivePrimary: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  onInteractivePrimary: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.blue[50] },
  interactivePrimaryHover: { DEFAULT: colorPrimitives.blue[600], dark: colorPrimitives.blue[300] },
  interactivePrimaryActive: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[500] },
  interactivePrimarySubtle: { DEFAULT: colorPrimitives.blue[50], dark: colorPrimitives.blue[800] }, // for subtle backgrounds
  onInteractivePrimarySubtle: { DEFAULT: colorPrimitives.blue[700], dark: colorPrimitives.blue[200] },


  // Secondary / Neutral (usually gray based)
  interactiveNeutral: { DEFAULT: colorPrimitives.gray[500], dark: colorPrimitives.gray[400] }, // e.g. secondary button bg
  onInteractiveNeutral: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.gray[50] },
  interactiveNeutralHover: { DEFAULT: colorPrimitives.gray[100], dark: colorPrimitives.gray[700] }, // for subtle bg hover like ghost buttons
  interactiveNeutralActive: { DEFAULT: colorPrimitives.gray[200], dark: colorPrimitives.gray[600] }, // for subtle bg active
  interactiveNeutralSubtle: { DEFAULT: colorPrimitives.gray[50], dark: colorPrimitives.gray[700] },
  onInteractiveNeutralSubtle: { DEFAULT: colorPrimitives.gray[700], dark: colorPrimitives.gray[200] },

  // Danger (usually red based)
  interactiveDanger: { DEFAULT: colorPrimitives.red[500], dark: colorPrimitives.red[400] },
  onInteractiveDanger: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.red[50] },
  interactiveDangerHover: { DEFAULT: colorPrimitives.red[600], dark: colorPrimitives.red[300] },
  interactiveDangerActive: { DEFAULT: colorPrimitives.red[700], dark: colorPrimitives.red[500] },
  interactiveDangerSubtle: { DEFAULT: colorPrimitives.red[50], dark: colorPrimitives.red[800] },
  onInteractiveDangerSubtle: { DEFAULT: colorPrimitives.red[700], dark: colorPrimitives.red[200] },

  // Success (usually green based)
  interactiveSuccess: { DEFAULT: colorPrimitives.green[500], dark: colorPrimitives.green[400] },
  onInteractiveSuccess: { DEFAULT: colorPrimitives.white, dark: colorPrimitives.green[50] },
  interactiveSuccessHover: { DEFAULT: colorPrimitives.green[600], dark: colorPrimitives.green[300] },
  interactiveSuccessActive: { DEFAULT: colorPrimitives.green[700], dark: colorPrimitives.green[500] },
  interactiveSuccessSubtle: { DEFAULT: colorPrimitives.green[50], dark: colorPrimitives.green[800] },
  onInteractiveSuccessSubtle: { DEFAULT: colorPrimitives.green[700], dark: colorPrimitives.green[200] },
  
  // Brand specific (if primary is not the main brand color for certain elements)
  // These would require defining brand primitives if not blue
  // For now, aliasing to primary, but could be distinct
  bgBrand: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
  textBrand: { DEFAULT: colorPrimitives.blue[600], dark: colorPrimitives.blue[300] }, // For text links or icons
  borderBrand: { DEFAULT: colorPrimitives.blue[500], dark: colorPrimitives.blue[400] },
};

// For type safety and auto-completion in Chakra's theme
export type ColorPrimitives = typeof colorPrimitives;
export type SemanticColors = typeof semanticColors;
