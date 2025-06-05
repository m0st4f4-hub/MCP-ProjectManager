import { fontFamily } from "./fontFamily";
import { fontSize } from "./fontSize";

export { fontFamily, fontSize };

export const fontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

export const lineHeight = {
  condensed: "1.25",
  regular: "1.5",
  relaxed: "1.75",
  heading: "1.2",
  body: "1.6",
};

export const letterSpacing = {
  normal: "0",
  wide: "0.02em",
  wider: "0.05em",
  tight: "-0.01em",
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
