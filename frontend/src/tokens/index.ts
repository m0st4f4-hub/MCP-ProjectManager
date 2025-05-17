export * from "./colors";
export * from "./typography";
export * from "./sizing";
export * from "./shadows";
export * from "./zIndex";
export * from "./breakpoints";
export * from "./transitions";
export * from "./opacity";
export * from "./blur";

import { colorPrimitives, semanticColors } from "./colors";
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
