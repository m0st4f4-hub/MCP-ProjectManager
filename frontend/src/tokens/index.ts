export {
  colorPrimitives,
  type ColorPrimitives,
  semanticColors,
  type SemanticColors,
} from './colors';
export { fontFamily, type FontFamily } from './fontFamily';
export { fontSize, type FontSize } from './fontSize';
export {
  typography,
  type Typography,
  fontWeight,
  type FontWeight,
  lineHeight,
  type LineHeight,
  letterSpacing,
  type LetterSpacing,
} from './typography';
export {
  sizing,
  type Sizing,
  spacing,
  type Spacing,
  width,
  type Width,
  height,
  type Height,
  borderRadius,
  type BorderRadius,
  borderWidth,
  type BorderWidth,
} from './sizing';
export { shadows, type Shadows } from './shadows';
export { zIndex, type ZIndex } from './zIndex';
export { breakpoints, type Breakpoints } from './breakpoints';
export {
  transitions,
  type Transitions,
  transitionDuration,
  type TransitionDuration,
  transitionEasing,
  type TransitionEasing,
} from './transitions';
export { opacity, type Opacity } from './opacity';
export { blur, type Blur } from './blur';

import { colorPrimitives, semanticColors } from './colors';
import { fontFamily } from './fontFamily';
import { fontSize } from './fontSize';
import { typography } from './typography';
import { sizing } from './sizing';
import { shadows } from './shadows';
import { zIndex } from './zIndex';
import { breakpoints } from './breakpoints';
import { transitions } from './transitions';
import { opacity } from './opacity';
import { blur } from './blur';

export const tokens = {
  colors: { ...colorPrimitives, ...semanticColors },
  fontFamily,
  fontSize,
  typography,
  sizing,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  opacity,
  blur,
};

export type Tokens = typeof tokens;
