import React from "react";
import {
  EditIcon,
  TimeIcon,
  ViewIcon,
  WarningTwoIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  InfoOutlineIcon,
  CalendarIcon,
  RepeatIcon,
  RepeatClockIcon,
  ArrowForwardIcon,
  QuestionIcon,
  QuestionOutlineIcon,
  CheckIcon,
  NotAllowedIcon,
  SettingsIcon,
} from "@chakra-ui/icons";

/**
 * Map of icon identifier strings (as returned by `getDisplayableStatus`)
 * to Chakra UI icon components. Components rendering task status tags
 * can use this mapping to translate icon names into actual components.
 */
export type IconMap = Record<string, React.ElementType>;

/** Default mapping of known status icon names to Chakra icons. */
export const defaultIconMap: IconMap = {
  EditIcon,
  TimeIcon,
  ViewIcon,
  WarningTwoIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  InfoOutlineIcon,
  CalendarIcon,
  RepeatIcon,
  RepeatClockIcon,
  ArrowForwardIcon,
  QuestionIcon,
  QuestionOutlineIcon,
  CheckIcon,
  NotAllowedIcon,
  SettingsIcon,
};
