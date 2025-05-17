import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import {
  colorPrimitives,
  semanticColors as appSemanticColors, // Rename to avoid conflict with Chakra's theme structure
  typography,
  sizing,
} from "../tokens"; // Assuming this path is correct relative to chakra-theme.ts

// 1. Define color mode config
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false, // Can be true if you want to sync with system preference
};

// 2. Helper function to transform our semanticColors to Chakra's format
const transformSemanticColors = () => {
  const chakraSemanticColors: Record<
    string,
    { default: string; _dark: string }
  > = {};
  for (const [key, value] of Object.entries(appSemanticColors)) {
    if (
      value &&
      typeof value === "object" &&
      "DEFAULT" in value &&
      "dark" in value
    ) {
      chakraSemanticColors[key] = {
        default: value.DEFAULT,
        _dark: value.dark,
      };
    }
  }
  return chakraSemanticColors;
};

// 3. Create the theme extension
const customTheme = extendTheme({
  config,
  colors: {
    ...colorPrimitives, // Spread our color primitives directly
    // You can add more specific Chakra color overrides here if needed
  },
  semanticTokens: {
    colors: {
      ...transformSemanticColors(), // Transform and spread our semantic colors
      // Example of a Chakra-specific semantic token if needed:
      // 'chakra-body-text': {
      //   default: appSemanticColors.onBackground.DEFAULT,
      //   _dark: appSemanticColors.onBackground.dark,
      // },
      // 'chakra-body-bg': {
      //   default: appSemanticColors.background.DEFAULT,
      //   _dark: appSemanticColors.background.dark,
      // },
      // 'chakra-border-color': {
      //   default: appSemanticColors.borderDecorative.DEFAULT,
      //   _dark: appSemanticColors.borderDecorative.dark,
      // },
    },
  },
  fonts: {
    heading: typography.fontFamily.heading.join(", "),
    body: typography.fontFamily.sans.join(", "),
    mono: typography.fontFamily.mono.join(", "),
  },
  fontSizes: typography.fontSize,
  fontWeights: typography.fontWeight,
  lineHeights: typography.lineHeight,
  space: sizing.spacing,
  sizes: {
    ...sizing.spacing, // Chakra UI often uses its `space` scale for `sizes` too
    ...sizing.width,
    ...sizing.height,
    // Add container sizes from Tailwind if you had them, e.g.
    // containerSm: '640px',
    // containerMd: '768px',
    // containerLg: '1024px',
    // containerXl: '1280px',
  },
  radii: sizing.borderRadius,
  borderWidths: sizing.borderWidth,
  // You can also customize components globally here
  // components: {
  //   Button: {
  //     baseStyle: {
  //       fontWeight: 'bold',
  //     },
  //     variants: {
  //       solid: (props: any) => ({
  //         bg: props.colorMode === 'dark' ? 'primary.dark' : 'primary.DEFAULT',
  //         color: props.colorMode === 'dark' ? 'onPrimary.dark' : 'onPrimary.DEFAULT',
  //       }),
  //     },
  //   },
  // },
  // Global styles can be defined here as well
  // styles: {
  //   global: (props: any) => ({
  //     body: {
  //       fontFamily: 'body',
  //       color: props.colorMode === 'dark' ? 'onBackground.dark' : 'onBackground.DEFAULT',
  //       bg: props.colorMode === 'dark' ? 'background.dark' : 'background.DEFAULT',
  //       lineHeight: 'base',
  //     },
  //   }),
  // },
});

export default customTheme;
