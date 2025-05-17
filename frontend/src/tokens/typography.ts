export const fontFamily = {
  sans: [
    'Geist Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
  heading: [
    'Geist Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
  ],
  mono: [
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
};

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  h6: '1.25rem',
  h5: '1.5rem',
  h4: '1.875rem',
  h3: '2.25rem',
  h2: '3rem',
  h1: '3.75rem',
  display1: '4.5rem',
  display2: '6rem',
  caption: '0.75rem',
  button: '0.875rem',
};

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const lineHeight = {
  condensed: '1.25',
  regular: '1.5',
  relaxed: '1.75',
  heading: '1.2',
  body: '1.6',
};

export const letterSpacing = {
  normal: '0',
  wide: '0.02em',
  wider: '0.05em',
  tight: '-0.01em',
};

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
};

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type Typography = typeof typography;
