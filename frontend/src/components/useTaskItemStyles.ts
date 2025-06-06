import { useTheme, useToken } from "@chakra-ui/react";
import { StatusID } from "@/lib/statusUtils";
import { getStatusTagColors } from "@/components/task";

export function useTaskItemStyles(currentStatusId: StatusID, compact: boolean) {
  const theme = useTheme();
  const [
    accentToDo,
    accentInProgress,
    accentBlocked,
    accentPending,
    accentCompleted,
    accentDefault,
    statusTagToDoBg,
    statusTagToDoColor,
    statusTagInProgressBg,
    statusTagInProgressColor,
    statusTagBlockedBg,
    statusTagBlockedColor,
    statusTagPendingBg,
    statusTagPendingColor,
    statusTagCompletedBg,
    statusTagCompletedColor,
    statusTagDefaultBg,
    statusTagDefaultColor,
    projectTagBg,
    projectTagColor,
    agentTagBg,
    agentTagColor,
    textPrimaryColor,
    textSecondaryColor,
    textDisabledColor,
    borderDecorativeColor,
    borderInteractiveFocusedColor,
    bgSurfaceColor,
    bgSurfaceElevatedColor,
    bgInteractiveSubtleHoverColor,
    coreRed50,
    coreRed500,
    coreRed600,
    coreRed700,
    coreGreen500,
    coreBlue100,
    coreBlue700,
  ] = useToken("colors", [
    "blue.500", // accentToDo
    "yellow.500", // accentInProgress
    "red.500", // accentBlocked
    "orange.500", // accentPending
    "green.500", // accentCompleted
    "neutralGray.500", // accentDefault
    "blue.100",
    "blue.800",
    "yellow.100",
    "yellow.800",
    "red.100",
    "red.800",
    "orange.100",
    "orange.800",
    "green.100",
    "green.800",
    "neutralGray.100",
    "neutralGray.800",
    "purple.100",
    "purple.800",
    "teal.100",
    "teal.800",
    "textPrimary",
    "textSecondary",
    "textDisabled",
    "borderDecorative",
    "borderInteractiveFocused",
    "bgSurface",
    "bgSurfaceElevated",
    "bgInteractiveSubtleHover",
    "red.50",
    "red.500",
    "red.600",
    "red.700",
    "green.500",
    "blue.100",
    "blue.700",
  ]);

  // Font sizes and weights
  const titleFontSize = compact ? theme.fontSizes.sm : theme.fontSizes.base;
  const titleFontWeight = theme.fontWeights.medium;
  const descriptionFontSize = compact
    ? theme.fontSizes.sm
    : theme.fontSizes.base;
  const descriptionFontWeight = theme.fontWeights.medium;
  const tagFontSize = compact ? theme.fontSizes.xs : theme.fontSizes.sm;
  const detailTextFontSize = compact ? theme.fontSizes.xs : theme.fontSizes.sm;

  // Tag styles
  const agentTagStyle = {
    bg: agentTagBg,
    color: agentTagColor,
    fontWeight: theme.fontWeights.medium,
  };
  const projectTagStyle = {
    bg: projectTagBg,
    color: projectTagColor,
    fontWeight: theme.fontWeights.medium,
  };
  const statusTagColors = getStatusTagColors(
    currentStatusId,
    statusTagToDoBg,
    statusTagToDoColor,
    statusTagInProgressBg,
    statusTagInProgressColor,
    statusTagBlockedBg,
    statusTagBlockedColor,
    statusTagPendingBg,
    statusTagPendingColor,
    statusTagCompletedBg,
    statusTagCompletedColor,
    statusTagDefaultBg,
    statusTagDefaultColor,
  );
  const statusTagStyle = {
    bg: statusTagColors.bg,
    color: statusTagColors.color,
    fontWeight: theme.fontWeights.medium,
  };

  return {
    theme,
    // Accent colors for status
    accentToDo,
    accentInProgress,
    accentBlocked,
    accentPending,
    accentCompleted,
    accentDefault,
    // Status tag colors (for getStatusTagColors)
    statusTagToDoBg,
    statusTagToDoColor,
    statusTagInProgressBg,
    statusTagInProgressColor,
    statusTagBlockedBg,
    statusTagBlockedColor,
    statusTagPendingBg,
    statusTagPendingColor,
    statusTagCompletedBg,
    statusTagCompletedColor,
    statusTagDefaultBg,
    statusTagDefaultColor,
    // Tag styles
    agentTagStyle,
    projectTagStyle,
    statusTagStyle,
    statusTagColors,
    // Colors
    textPrimaryColor,
    textSecondaryColor,
    textDisabledColor,
    borderDecorativeColor,
    borderInteractiveFocusedColor,
    bgSurfaceColor,
    bgSurfaceElevatedColor,
    bgInteractiveSubtleHoverColor,
    coreRed50,
    coreRed500,
    coreRed600,
    coreRed700,
    coreGreen500,
    coreBlue100,
    coreBlue700,
    // Font sizes/weights
    titleFontSize,
    titleFontWeight,
    descriptionFontSize,
    descriptionFontWeight,
    tagFontSize,
    detailTextFontSize,
  };
}
