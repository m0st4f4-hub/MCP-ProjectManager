import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Note: We no longer import from '../styles/theme' for direct values.
// The Chakra theme will now reference CSS Custom Properties defined in '../styles/tokens.css'.

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const chakraCustomTheme = extendTheme({
  config,
  colors: {
    // Full palettes from CSS vars (prefixed with --core-colors- for clarity)
    transparent: 'var(--core-colors-transparent)',
    black: 'var(--core-colors-black)',
    white: 'var(--core-colors-white)',
    blue: {
      50: 'var(--core-colors-blue-50)',
      100: 'var(--core-colors-blue-100)',
      200: 'var(--core-colors-blue-200)',
      300: 'var(--core-colors-blue-300)',
      400: 'var(--core-colors-blue-400)',
      500: 'var(--core-colors-blue-500)',
      600: 'var(--core-colors-blue-600)',
      700: 'var(--core-colors-blue-700)',
      800: 'var(--core-colors-blue-800)',
      900: 'var(--core-colors-blue-900)',
    },
    neutralGray: {
      50: 'var(--core-colors-neutralGray-50)',
      100: 'var(--core-colors-neutralGray-100)',
      150: 'var(--core-colors-neutralGray-150)',
      200: 'var(--core-colors-neutralGray-200)',
      300: 'var(--core-colors-neutralGray-300)',
      400: 'var(--core-colors-neutralGray-400)',
      500: 'var(--core-colors-neutralGray-500)',
      600: 'var(--core-colors-neutralGray-600)',
      700: 'var(--core-colors-neutralGray-700)',
      800: 'var(--core-colors-neutralGray-800)',
      900: 'var(--core-colors-neutralGray-900)',
    },
    green: { /* ... similar mapping for green scale ... */ },
    red: { /* ... similar mapping for red scale ... */ },
    yellow: { /* ... similar mapping for yellow scale ... */ },
    orange: { /* ... similar mapping for orange scale ... */ },

    // Semantic aliases referencing CSS vars
    brandPrimary: 'var(--colors-brandPrimary)',
    brandPrimaryHover: 'var(--colors-brandPrimaryHover)',
    brandPrimaryActive: 'var(--colors-brandPrimaryActive)',
    brandSecondary: 'var(--colors-brandSecondary)',
    brandAccent: 'var(--colors-brandAccent)',
    bgCanvas: 'var(--colors-bgCanvas)',
    bgSurface: 'var(--colors-bgSurface)',
    textPrimary: 'var(--colors-textPrimary)',
    textSecondary: 'var(--colors-textSecondary)',
    textLink: 'var(--colors-textLink)',
    textInverse: 'var(--colors-textInverse)',
    borderDecorative: 'var(--colors-borderDecorative)',
  },
  fonts: {
    heading: 'var(--typography-fontFamilies-heading)',
    body: 'var(--typography-fontFamilies-body)',
    monospace: 'var(--typography-fontFamilies-monospace)',
  },
  fontSizes: {
    xs: 'var(--typography-fontSizes-xs)',
    sm: 'var(--typography-fontSizes-sm)',
    base: 'var(--typography-fontSizes-base)',
    lg: 'var(--typography-fontSizes-lg)',
    xl: 'var(--typography-fontSizes-xl)',
    h6: 'var(--typography-fontSizes-h6)',
    h5: 'var(--typography-fontSizes-h5)',
    h4: 'var(--typography-fontSizes-h4)',
    h3: 'var(--typography-fontSizes-h3)',
    h2: 'var(--typography-fontSizes-h2)',
    h1: 'var(--typography-fontSizes-h1)',
    display1: 'var(--typography-fontSizes-display1)',
    display2: 'var(--typography-fontSizes-display2)',
  },
  fontWeights: {
    light: 'var(--typography-fontWeights-light)', // Note: CSS vars for numbers are fine
    regular: 'var(--typography-fontWeights-regular)',
    medium: 'var(--typography-fontWeights-medium)',
    semibold: 'var(--typography-fontWeights-semibold)',
    bold: 'var(--typography-fontWeights-bold)',
    extrabold: 'var(--typography-fontWeights-extrabold)',
  },
  lineHeights: {
    condensed: 'var(--typography-lineHeights-condensed)',
    regular: 'var(--typography-lineHeights-regular)',
    relaxed: 'var(--typography-lineHeights-relaxed)',
  },
  space: {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    // ... map all spacing tokens ...
    32: 'var(--spacing-32)',
  },
  sizes: {
    xs: 'var(--sizing-xs)',
    // ... map all sizing tokens ...
    inputHeightLarge: 'var(--sizing-inputHeightLarge)',
  },
  radii: {
    none: 'var(--radii-none)',
    // ... map all radii tokens ...
    round: 'var(--radii-round)',
  },
  shadows: {
    none: 'var(--shadows-none)',
    // ... map all shadow tokens ...
    outline: 'var(--shadows-outline)',
  },
  zIndices: {
    hide: 'var(--zIndices-hide)', // CSS var will be -1, Chakra handles numeric strings
    // ... map all zIndices tokens ...
    tooltip: 'var(--zIndices-tooltip)',
  },
  breakpoints: {
    sm: 'var(--breakpoints-sm)',
    md: 'var(--breakpoints-md)',
    lg: 'var(--breakpoints-lg)',
    xl: 'var(--breakpoints-xl)',
    '2xl': 'var(--breakpoints-2xl)',
  },
  styles: {
    global: {
      'html, body': {
        fontFamily: 'var(--typography-fontFamilies-body)',
        color: 'var(--colors-textPrimary)',
        backgroundColor: 'var(--colors-bgCanvas)',
        lineHeight: 'var(--typography-lineHeights-regular)',
      },
      a: {
        color: 'var(--colors-textLink)',
        _hover: {
          textDecoration: 'underline',
          color: 'var(--colors-textLinkHover)',
        },
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'var(--typography-fontWeights-semibold)',
        borderRadius: 'var(--radii-base)',
      },
      variants: {
        solid: {
          bg: 'var(--colors-brandPrimary)',
          color: 'var(--colors-textInverse)',
          _hover: {
            bg: 'var(--colors-brandPrimaryHover)',
            _disabled: { bg: 'var(--core-colors-neutralGray-200)' },
          },
          _active: {
            bg: 'var(--colors-brandPrimaryActive)',
          },
          _disabled: {
            bg: 'var(--core-colors-neutralGray-200)',
            color: 'var(--core-colors-neutralGray-400)',
            opacity: 0.7,
            cursor: 'not-allowed',
          },
        },
        outline: {
          borderColor: 'var(--colors-brandPrimary)',
          color: 'var(--colors-brandPrimary)',
          _hover: {
            bg: 'var(--core-colors-blue-50)',
            borderColor: 'var(--colors-brandPrimaryHover)',
            color: 'var(--colors-brandPrimaryHover)',
          },
          _disabled: {
            borderColor: 'var(--core-colors-neutralGray-200)',
            color: 'var(--core-colors-neutralGray-400)',
            opacity: 0.7,
            cursor: 'not-allowed',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'var(--typography-fontFamilies-heading)',
        color: 'var(--colors-textPrimary)',
        fontWeight: 'var(--typography-fontWeights-bold)',
      },
      sizes: {
        '4xl': { 
            fontFamily: 'var(--typography-heading1-fontFamily)', 
            fontSize: 'var(--typography-heading1-fontSize)', 
            fontWeight: 'var(--typography-heading1-fontWeight)', 
            lineHeight: 'var(--typography-heading1-lineHeight)' 
        },
        '3xl': { fontSize: 'var(--typography-fontSizes-h2)', lineHeight: 'var(--typography-lineHeights-condensed)' },
        '2xl': { fontSize: 'var(--typography-fontSizes-h3)', lineHeight: 'var(--typography-lineHeights-condensed)' },
        'xl': { fontSize: 'var(--typography-fontSizes-h4)', lineHeight: 'var(--typography-lineHeights-regular)' },
        'lg': { fontSize: 'var(--typography-fontSizes-h5)', lineHeight: 'var(--typography-lineHeights-regular)' },
        'md': { fontSize: 'var(--typography-fontSizes-h6)', lineHeight: 'var(--typography-lineHeights-regular)' },
        'sm': { fontSize: 'var(--typography-fontSizes-xl)', lineHeight: 'var(--typography-lineHeights-regular)' },
        'xs': { fontSize: 'var(--typography-fontSizes-lg)', lineHeight: 'var(--typography-lineHeights-regular)' },
      }
    },
    Text: {
      baseStyle: {
        fontFamily: 'var(--typography-fontFamilies-body)',
        color: 'var(--colors-textSecondary)',
      },
    },
    Link: {
      baseStyle: {
        color: 'var(--colors-textLink)',
        _hover: {
          textDecoration: 'underline',
          color: 'var(--colors-textLinkHover)',
        },
      },
    },
  },
});

export default chakraCustomTheme; 