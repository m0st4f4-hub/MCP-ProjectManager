// frontend/src/styles/theme.ts

// --- Core/Primitive Tokens ---
// Using 'as const' for stricter typing and to allow TypeScript to infer literal types.
export const coreTokens = {
  colors: {
    transparent: 'transparent',
    black: '#000000',
    white: '#FFFFFF',
    blue: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF', // Primary brand blue
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    neutralGray: {
      50: '#FAFAFA',  // Lightest gray for canvas
      100: '#F5F5F5', // Light gray for surfaces
      150: '#EFEFEF', // Elevated surface
      200: '#E0E0E0', // Subtle borders, disabled states
      300: '#D6D6D6', // Decorative borders
      400: '#BDBDBD', // Input borders, disabled text
      500: '#9E9E9E', // Placeholder text
      600: '#757575', // Icon default
      700: '#616161', // Secondary text
      800: '#424242', // Primary text
      900: '#212121', // Heading text
    },
    green: {
      50: '#F6FFED',
      100: '#D9F7BE',
      200: '#B7EB8F',
      300: '#95DE64',
      400: '#73D13D',
      500: '#52C41A', // Success
      600: '#389E0D',
      700: '#237804',
      800: '#135200',
      900: '#092B00',
    },
    red: {
      50: '#FFF1F0',
      100: '#FFCCC7',
      200: '#FFA39E',
      300: '#FF7875',
      400: '#FF4D4F',
      500: '#F5222D', // Error
      600: '#CF1322',
      700: '#A8071A',
      800: '#820014',
      900: '#5C0011',
    },
    yellow: {
      50: '#FFFBE6',
      100: '#FFF1B8',
      200: '#FFE58F',
      300: '#FFD666',
      400: '#FFC53D',
      500: '#FAAD14', // Warning
      600: '#D48806',
      700: '#AD6800',
      800: '#874D00',
      900: '#613400',
    },
    orange: {
      50: '#FFF7E6',
      100: '#FFE7BA',
      200: '#FFD591',
      300: '#FFC069',
      400: '#FFA940',
      500: '#FA8C16', // Attention/Info (can vary)
      600: '#D46B08',
      700: '#AD4E00',
      800: '#873800',
      900: '#612500',
    },
  } as const,
  typography: {
    fontFamilies: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      heading: 'Georgia, Cambria, "Times New Roman", Times, serif',
      monospace: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    } as const,
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      h6: '1.25rem', // 20px
      h5: '1.5rem', // 24px
      h4: '1.875rem', // 30px
      h3: '2.25rem', // 36px
      h2: '3rem', // 48px
      h1: '3.75rem', // 60px
      display1: '4.5rem', // 72px
      display2: '6rem', // 96px
    } as const,
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    } as const,
    lineHeights: {
      condensed: 1.25,
      regular: 1.5,
      relaxed: 1.75,
    } as const,
  } as const,
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    7: '1.75rem', // 28px
    8: '2rem',    // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem',// 44px
    12: '3rem',   // 48px
    14: '3.5rem', // 56px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    28: '7rem',   // 112px
    32: '8rem',   // 128px
  } as const,
  sizing: {
    // Based on spacing for consistency, but can have unique values
    xs: '20rem', // 320px
    sm: '24rem', // 384px
    md: '28rem', // 448px
    lg: '32rem', // 512px
    xl: '36rem', // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    containerSm: '640px',
    containerMd: '768px',
    containerLg: '1024px',
    containerXl: '1280px',
    full: '100%',
    vw: '100vw',
    vh: '100vh',
    inputHeightSmall: '2rem',    // 32px
    inputHeightMedium: '2.5rem', // 40px
    inputHeightLarge: '3rem',    // 48px
  } as const,
  borders: {
    borderWidths: {
      none: '0px',
      xs: '1px',
      sm: '2px',
      md: '4px',
    } as const,
    borderStyles: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      none: 'none',
    } as const,
  } as const,
  radii: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    '2xl': '1rem',    // 16px
    round: '9999px',
  } as const,
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)', // Example for focus rings
  } as const,
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  } as const,
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const,
};

// --- Semantic Tokens ---
// These tokens reference the core tokens and provide semantic meaning.
export const theme = {
  colors: {
    // Brand
    brandPrimary: coreTokens.colors.blue[500],
    brandPrimaryHover: coreTokens.colors.blue[600],
    brandPrimaryActive: coreTokens.colors.blue[700],
    brandSecondary: coreTokens.colors.neutralGray[700],
    brandSecondaryHover: coreTokens.colors.neutralGray[800],
    brandSecondaryActive: coreTokens.colors.neutralGray[900],
    brandAccent: coreTokens.colors.orange[500],

    // Backgrounds
    bgCanvas: coreTokens.colors.neutralGray[50],
    bgSurface: coreTokens.colors.white,
    bgSurfaceElevated: coreTokens.colors.neutralGray[100],
    bgInteractive: coreTokens.colors.blue[500],
    bgInteractiveHover: coreTokens.colors.blue[600],
    bgInteractiveActive: coreTokens.colors.blue[700],
    bgInteractiveSubtle: coreTokens.colors.blue[50],
    bgInteractiveSubtleHover: coreTokens.colors.blue[100],
    bgInteractiveSubtleActive: coreTokens.colors.blue[200],
    bgDisabled: coreTokens.colors.neutralGray[200],

    // Text
    textPrimary: coreTokens.colors.neutralGray[800],
    textSecondary: coreTokens.colors.neutralGray[700],
    textPlaceholder: coreTokens.colors.neutralGray[500],
    textDisabled: coreTokens.colors.neutralGray[400],
    textInteractive: coreTokens.colors.blue[500],
    textInteractiveHover: coreTokens.colors.blue[600],
    textInteractiveActive: coreTokens.colors.blue[700],
    textLink: coreTokens.colors.blue[500],
    textLinkHover: coreTokens.colors.blue[600],
    textInverse: coreTokens.colors.white,
    textError: coreTokens.colors.red[500],
    textSuccess: coreTokens.colors.green[500],
    textWarning: coreTokens.colors.yellow[700], // Darker yellow for readability

    // Borders / Dividers
    borderDecorative: coreTokens.colors.neutralGray[300],
    borderInteractive: coreTokens.colors.neutralGray[400],
    borderInteractiveFocused: coreTokens.colors.blue[500],
    borderDisabled: coreTokens.colors.neutralGray[200],
    borderError: coreTokens.colors.red[500],
    borderSuccess: coreTokens.colors.green[500],
    borderWarning: coreTokens.colors.yellow[500],

    // Status specific backgrounds/borders (often combined with text colors)
    statusSuccessBg: coreTokens.colors.green[50],
    statusSuccessBorder: coreTokens.colors.green[300],
    statusErrorBg: coreTokens.colors.red[50],
    statusErrorBorder: coreTokens.colors.red[300],
    statusWarningBg: coreTokens.colors.yellow[50],
    statusWarningBorder: coreTokens.colors.yellow[300],
    statusInfoBg: coreTokens.colors.blue[50], // Or orange, depending on 'info' meaning
    statusInfoBorder: coreTokens.colors.blue[300],

    // Icons
    iconDefault: coreTokens.colors.neutralGray[600],
    iconInteractive: coreTokens.colors.blue[500],
    iconInverse: coreTokens.colors.white,
    iconDisabled: coreTokens.colors.neutralGray[400],
  },
  typography: {
    fontFamilies: coreTokens.typography.fontFamilies,
    fontSizes: coreTokens.typography.fontSizes,
    fontWeights: coreTokens.typography.fontWeights,
    lineHeights: coreTokens.typography.lineHeights,
    // Semantic combinations (optional, can also be done in components/CSS)
    heading1: {
      fontFamily: coreTokens.typography.fontFamilies.heading,
      fontSize: coreTokens.typography.fontSizes.h1,
      fontWeight: coreTokens.typography.fontWeights.bold,
      lineHeight: coreTokens.typography.lineHeights.condensed,
    },
    body: {
      fontFamily: coreTokens.typography.fontFamilies.body,
      fontSize: coreTokens.typography.fontSizes.base,
      fontWeight: coreTokens.typography.fontWeights.regular,
      lineHeight: coreTokens.typography.lineHeights.regular,
    },
  },
  spacing: coreTokens.spacing,
  sizing: coreTokens.sizing,
  borders: {
    ...coreTokens.borders.borderWidths,
    ...coreTokens.borders.borderStyles,
    // convenience combinations
    interactiveDefault: `${coreTokens.borders.borderWidths.xs} ${coreTokens.borders.borderStyles.solid} ${coreTokens.colors.neutralGray[400]}`,
  },
  radii: coreTokens.radii,
  shadows: coreTokens.shadows,
  zIndices: coreTokens.zIndices,
  breakpoints: coreTokens.breakpoints,
} as const;

// Infer the Theme type from the theme object itself for type safety
export type Theme = typeof theme;
export type CoreTokens = typeof coreTokens; 