// Centralized icon component for consistent icon usage across the app.
// Usage:
// <AppIcon name="add" ...chakraProps /> // for standard icons
// <AppIcon component={FaTasks} ...chakraProps /> // for custom/react-icons

import React from "react";
import { Icon, IconProps } from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  CopyIcon,
  HamburgerIcon,
  SearchIcon,
  TimeIcon,
  WarningTwoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ViewIcon,
  ViewOffIcon,
  CheckCircleIcon,
  RepeatClockIcon,
  DownloadIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  SettingsIcon,
  CloseIcon,
  InfoOutlineIcon,
  ChatIcon,
  AttachmentIcon,
} from "@chakra-ui/icons";

// Map standard icon names to Chakra UI icons
const standardIcons: Record<string, React.ElementType> = {
  add: AddIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  copy: CopyIcon,
  hamburger: HamburgerIcon,
  search: SearchIcon,
  time: TimeIcon,
  warning: WarningTwoIcon,
  chevrondown: ChevronDownIcon,
  chevronright: ChevronRightIcon,
  chevronleft: ChevronLeftIcon,
  view: ViewIcon,
  viewoff: ViewOffIcon,
  checkcircle: CheckCircleIcon,
  repeatclock: RepeatClockIcon,
  download: DownloadIcon,
  arrowup: ArrowUpIcon,
  settings: SettingsIcon,
  close: CloseIcon,
  logout: ViewOffIcon,
  filter: SettingsIcon,
  title: ChatIcon,
  description: InfoOutlineIcon,
  status: TimeIcon,
  project: AttachmentIcon,
  save: CheckCircleIcon,
  agent: SettingsIcon,
  task: EditIcon,
};

type AppIconProps = {
  name?: keyof typeof standardIcons | string; // standard icon name
  component?: React.ElementType; // custom icon component (e.g., from react-icons)
} & Omit<IconProps, "as">;

const AppIcon: React.FC<AppIconProps> = ({ name, component, ...props }) => {
  const IconComponent =
    (name && standardIcons[name.toLowerCase()]) || component;
  if (!IconComponent) {
    if (name) {
      console.warn(
        `AppIcon: Standard icon "${name}" not found. Ensure it's mapped in AppIcon.tsx or pass a component prop.`,
      );
    }
    return null;
  }
  return <Icon as={IconComponent} {...props} />;
};

export default AppIcon;
