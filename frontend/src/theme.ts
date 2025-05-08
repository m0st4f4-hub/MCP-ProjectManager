import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Define base color palettes (can be expanded)
const colors = {
  brand: {
    primary: '#3182CE', // Blue
    secondary: '#2D3748', // Dark Gray
    accent: '#DD6B20',   // Orange
  },
  // Add more specific colors if needed
  blue: {
    50: '#EBF8FF',
    100: '#BEE3F8',
    200: '#90CDF4',
    300: '#63B3ED',
    400: '#4299E1',
    500: '#3182CE',
    600: '#2B6CB0',
    700: '#2C5282',
    800: '#2A4365',
    900: '#1A365D',
  },
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
  // Add other palettes like green, red, etc. as needed
};

// Define Semantic Tokens for light/dark mode mapping
const semanticTokens = {
  colors: {
    // Backgrounds
    'bg.default': {
      default: 'gray.100', // Light mode default
      _dark: 'gray.800',   // Dark mode default
    },
    'bg.surface': {
      default: 'white',
      _dark: 'gray.700',
    },
    'bg.subtle': {
        default: 'gray.200',
        _dark: 'gray.600',
    },
    // Text
    'text.default': {
      default: 'gray.900',
      _dark: 'gray.50',
    },
    'text.secondary': {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    'text.subtle': {
      default: 'gray.500',
      _dark: 'gray.500',
    },
    'text.accent': {
        default: 'brand.primary', 
        _dark: 'blue.300'
    },
    // Borders
    'border.default': {
      default: 'gray.300',
      _dark: 'gray.600',
    },
    // Brand Colors
    'brand.primary': {
        default: 'blue.500', 
        _dark: 'blue.300'
    },
    'brand.secondary': {
        default: 'gray.700', 
        _dark: 'gray.200'
    },
    // Add more semantic tokens as needed (e.g., for states like hover, active)
  },
};

// Configure initial color mode and storage key
const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

// Extend the default theme
const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  // You can also customize other theme aspects like fonts, components, etc.
  // Example:
  // fonts: {
  //   heading: `'Inter', sans-serif`,
  //   body: `'Inter', sans-serif`,
  // },
  // styles: {
  //   global: (props) => ({
  //     body: {
  //       bg: mode('gray.50', 'gray.900')(props),
  //     },
  //   }),
  // },
});

export default theme; 