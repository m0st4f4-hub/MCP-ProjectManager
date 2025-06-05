export * from "./colors";
export { fontFamily } from "./fontFamily";
export type { FontFamily } from "./fontFamily";
export { fontSize } from "./fontSize";
export type { FontSize } from "./fontSize";
export {
  typography,
  fontWeight,
  lineHeight,
  letterSpacing,
} from "./typography";
export type {
  Typography,
  FontWeight,
  LineHeight,
  LetterSpacing,
} from "./typography";
export * from "./sizing";
export * from "./shadows";
export * from "./zIndex";
export * from "./breakpoints";
export * from "./transitions";
export * from "./opacity";
export * from "./blur";

import { colorPrimitives, semanticColors } from "./colors";
import { fontFamily } from "./fontFamily";
import { fontSize } from "./fontSize";
import { typography } from "./typography";
import { sizing } from "./sizing";
import { shadows } from "./shadows";
import { zIndex } from "./zIndex";
import { breakpoints } from "./breakpoints";
import { transitions } from "./transitions";
import { opacity } from "./opacity";
import { blur } from "./blur";

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
