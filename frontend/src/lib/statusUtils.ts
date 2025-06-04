/**
 * @module statusUtils
 * @description
 * This utility module provides a centralized system for defining, managing, and retrieving
 * display properties for task statuses within the MCP Task Manager application. It ensures
 * consistency in how statuses are represented across the UI (e.g., names, colors, icons)
 * and provides a single source of truth for all status-related attributes.
 *
 * Key features include:
 * - Definition of canonical status identifiers (`StatusID`).
 * - A comprehensive mapping (`STATUS_MAP`) of status IDs to their attributes
 *   (`StatusAttributeObject`), including display names, categories, color schemes,
 *   icons, and behavioral flags (e.g., `isTerminal`, `isDynamic`).
 * - Functions to retrieve status attributes (`getStatusAttributes`) and display-ready
 *   properties (`getDisplayableStatus`), with support for dynamic status strings
 *   (e.g., statuses that include task IDs).
 * - A function to get all defined status IDs (`getAllStatusIds`).
 *
 * @remarks
 * Accessibility Considerations:
 * When consuming data from this utility (especially `icon` and `displayName`) in UI components:
 * - Icons should generally be decorative if a `displayName` is present. Use `aria-hidden="true"`
 *   on the icon component in such cases.
 * - If an icon is used as a standalone button or indicator without visible text, ensure it has
 *   an appropriate `aria-label` derived from or related to the `displayName`.
 * - Consider using tooltips (e.g., Chakra UI `Tooltip`) to provide the full `description`
 *   or `displayName` on hover or focus for icon-only representations or truncated text,
 *   enhancing user understanding.
 * - For status updates that are announced dynamically (e.g., via ARIA live regions),
 *   the `displayName` provides a human-readable string suitable for such announcements.
 */

import type { ElementType } from "react";

/**
 * Defines the raw string identifiers for all canonical task statuses.
 * These match the backend TaskStatusEnum values exactly.
 */
export type StatusID =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "TO_DO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED"
  | "PENDING_VERIFICATION"
  | "FAILED"
  | "VERIFICATION_FAILED";

/**
 * Represents the full set of attributes for a canonical task status.
 * This interface defines the shape of objects stored in `STATUS_MAP`.
 */
export interface StatusAttributeObject {
  id: StatusID;
  displayName: string;
  category: "todo" | "inProgress" | "pendingInput" | "completed" | "failed" | "blocked";
  description: string;
  colorScheme: string;
  icon?: ElementType | string;
  isTerminal: boolean;
  isDynamic: boolean;
  dynamicPartsExtractor?: string | RegExp;
  dynamicDisplayNamePattern?: string;
}

/**
 * @constant STATUS_MAP
 * @description
 * The single source of truth for all task status definitions.
 * This Readonly Record maps each canonical `StatusID` to its corresponding
 * `StatusAttributeObject`, which contains all properties and metadata for that status.
 *
 * Icons are placeholder strings (e.g., 'EditIcon'). In a real application, these would
 * typically map to actual icon components imported from a library like `@chakra-ui/icons`
 * or `react-icons`, and the `icon` property in `StatusAttributeObject` might hold the
 * component itself (e.g., `icon: EditIcon`).
 */
const STATUS_MAP: Readonly<Record<StatusID, StatusAttributeObject>> = {
  "To Do": {
    id: "To Do",
    displayName: "To Do",
    category: "todo",
    description: "Task is pending and has not yet been started.",
    colorScheme: "gray",
    icon: "EditIcon",
    isTerminal: false,
    isDynamic: false,
  },
  TO_DO: {
    id: "To Do",
    displayName: "To Do",
    category: "todo",
    description: "Task is pending and has not yet been started.",
    colorScheme: "gray",
    icon: "EditIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "In Progress": {
    id: "In Progress",
    displayName: "In Progress",
    category: "inProgress",
    description: "Task is actively being worked on.",
    colorScheme: "blue",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  IN_PROGRESS: {
    id: "In Progress",
    displayName: "In Progress",
    category: "inProgress",
    description: "Task is actively being worked on.",
    colorScheme: "blue",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "In Review": {
    id: "In Review",
    displayName: "In Review",
    category: "inProgress",
    description: "Task is under review.",
    colorScheme: "purple",
    icon: "ViewIcon",
    isTerminal: false,
    isDynamic: false,
  },
  IN_REVIEW: {
    id: "In Review",
    displayName: "In Review",
    category: "inProgress",
    description: "Task is under review.",
    colorScheme: "purple",
    icon: "ViewIcon",
    isTerminal: false,
    isDynamic: false,
  },
  Blocked: {
    id: "Blocked",
    displayName: "Blocked",
    category: "blocked",
    description: "Task cannot proceed due to a dependency or issue.",
    colorScheme: "orange",
    icon: "WarningTwoIcon",
    isTerminal: false,
    isDynamic: false,
  },
  BLOCKED: {
    id: "Blocked",
    displayName: "Blocked",
    category: "blocked",
    description: "Task cannot proceed due to a dependency or issue.",
    colorScheme: "orange",
    icon: "WarningTwoIcon",
    isTerminal: false,
    isDynamic: false,
  },
  Completed: {
    id: "Completed",
    displayName: "Completed",
    category: "completed",
    description: "Task has been finished successfully.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: true,
    isDynamic: false,
  },
  COMPLETED: {
    id: "Completed",
    displayName: "Completed",
    category: "completed",
    description: "Task has been finished successfully.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: true,
    isDynamic: false,
  },
  Cancelled: {
    id: "Cancelled",
    displayName: "Cancelled",
    category: "failed",
    description: "Task was cancelled and will not be completed.",
    colorScheme: "red",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },
  CANCELLED: {
    id: "Cancelled",
    displayName: "Cancelled",
    category: "failed",
    description: "Task was cancelled and will not be completed.",
    colorScheme: "red",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },
  PENDING_VERIFICATION: {
    id: "PENDING_VERIFICATION",
    displayName: "Pending Verification",
    category: "inProgress",
    description: "Task awaiting verification.",
    colorScheme: "orange",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  FAILED: {
    id: "FAILED",
    displayName: "Failed",
    category: "failed",
    description: "Task execution failed.",
    colorScheme: "red",
    icon: "WarningTwoIcon",
    isTerminal: true,
    isDynamic: false,
  },
  VERIFICATION_FAILED: {
    id: "VERIFICATION_FAILED",
    displayName: "Verification Failed",
    category: "failed",
    description: "Task verification failed.",
    colorScheme: "red",
    icon: "WarningTwoIcon",
    isTerminal: true,
    isDynamic: false,
  },
};

/**
 * Retrieves the full `StatusAttributeObject` for a given canonical status ID.
 * This object contains all defined properties for the status, including `displayName`,
 * `category`, `colorScheme`, `icon`, `description`, and behavioral flags.
 *
 * @param statusId The canonical raw string ID of the status (must be one of `StatusID`).
 * @returns The `StatusAttributeObject` for the given ID if found in `STATUS_MAP`,
 *          otherwise `undefined`.
 * @example
 * const todoAttrs = getStatusAttributes('TO_DO');
 * if (todoAttrs) {
 *   console.log(todoAttrs.displayName); // "To Do"
 *   console.log(todoAttrs.colorScheme); // "gray"
 * }
 */
export function getStatusAttributes(
  statusId: StatusID,
): StatusAttributeObject | undefined {
  let key = statusId as string;
  if (key === key.toUpperCase()) {
    key =
      key
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
  return STATUS_MAP[key as StatusID];
}

/**
 * @typedef DisplayableStatus
 * @type {object}
 * @property {string} displayName - The user-friendly name for the status, dynamically generated if applicable.
 * @property {string} colorScheme - The Chakra UI color scheme associated with the status.
 * @property {As | string | undefined} icon - The icon associated with the status.
 * @property {string | undefined} dynamicValue - The extracted dynamic part from the statusId, if any.
 */

/**
 * Returns properties needed for UI display, intelligently handling dynamic statuses.
 * If the `statusId` corresponds to a dynamic status (e.g., 'COMPLETED_HANDOFF_TO_task123'),
 * this function attempts to parse the dynamic part and uses it to format the `displayName`
 * according to the `dynamicDisplayNamePattern` defined in `STATUS_MAP`.
 *
 * @param {string} statusId - The raw or full dynamic string ID of the status.
 *                           For dynamic statuses, this should be the complete string
 *                           (e.g., "COMPLETED_HANDOFF_TO_task123,task456").
 * @param {string} [fallbackTitleOrDynamicValue] - Optional. A fallback string that can be used if `statusId`
 *                                       is a generic dynamic status template (like 'COMPLETED_HANDOFF_TO_...')
 *                                       but the actual dynamic value isn't part of `statusId` itself.
 *                                       Also used as a general fallback for the dynamic part if extraction fails.
 * @returns {DisplayableStatus | undefined} An object containing `displayName`, `colorScheme`, `icon`,
 *          and `dynamicValue` (the extracted part, if any). Returns `undefined` if the base `statusId`
 *          cannot be resolved even as a known static or dynamic type.
 *
 * @example
 * // Static status
 * getDisplayableStatus('IN_PROGRESS');
 * // Returns: { displayName: 'In Progress', colorScheme: 'blue', icon: 'TimeIcon' }
 *
 * // Dynamic status
 * getDisplayableStatus('COMPLETED_HANDOFF_TO_TASK_ABC,TASK_XYZ');
 * // Returns: { displayName: 'Handoff to: TASK_ABC,TASK_XYZ', colorScheme: 'purple', icon: 'ArrowForwardIcon', dynamicValue: 'TASK_ABC,TASK_XYZ' }
 *
 * // Dynamic status with fallback title (if statusId was just 'COMPLETED_HANDOFF_TO_...')
 * getDisplayableStatus('COMPLETED_HANDOFF_TO_...', 'UrgentReview');
 * // Returns: { displayName: 'Handoff to: UrgentReview', colorScheme: 'purple', icon: 'ArrowForwardIcon', dynamicValue: 'UrgentReview' }
 *
 * @remarks
 * Consumers should use the `displayName` for user-facing text and `colorScheme` and `icon`
 * for styling. Remember accessibility: use icons decoratively or provide ARIA labels.
 * The `dynamicValue` can be useful for linking or further processing.
 */
export function getDisplayableStatus(
  statusId: string, // Accepts string to handle full dynamic IDs
  fallbackTitleOrDynamicValue?: string,
):
  | {
      displayName: string;
      colorScheme: string;
      icon?: ElementType | string;
      dynamicValue?: string;
    }
  | undefined {
  let baseStatusDefinition: StatusAttributeObject | undefined = undefined;
  let extractedValue: string | undefined = fallbackTitleOrDynamicValue; // Initialize with fallback

  // 1. Attempt to match known static StatusIDs first
  if (STATUS_MAP[statusId as StatusID]) {
    baseStatusDefinition = STATUS_MAP[statusId as StatusID];
    // If it's a static match but also the base for a dynamic type that expects a fallback, use the fallback.
    if (
      baseStatusDefinition.isDynamic &&
      baseStatusDefinition.dynamicDisplayNamePattern &&
      fallbackTitleOrDynamicValue
    ) {
      extractedValue = fallbackTitleOrDynamicValue;
    } else if (!baseStatusDefinition.isDynamic) {
      extractedValue = undefined; // Not dynamic, no extracted value from statusId itself
    }
  } else {
    // 2. If not a direct static match, iterate through STATUS_MAP to find a dynamic match
    // This is more robust for various dynamic status patterns.
    for (const key in STATUS_MAP) {
      const definition = STATUS_MAP[key as StatusID];
      if (definition.isDynamic && definition.dynamicPartsExtractor) {
        const extractor = new RegExp(definition.dynamicPartsExtractor);
        const match = statusId.match(extractor);
        if (match) {
          baseStatusDefinition = definition;
          // Prioritize value extracted from statusId string if match is found and group exists
          if (match[1]) {
            extractedValue = match[1];
          }
          // If no value was extracted from statusId (match[1] is empty/undefined)
          // and a fallback was provided, retain the fallback.
          // If match[1] has a value, it overrides the initial fallbackTitleOrDynamicValue for extractedValue.
          break;
        }
      }
    }
  }

  // 3. If no base definition found after checking static and dynamic, it's unknown.
  if (!baseStatusDefinition) {
    // console.warn('[getDisplayableStatus] Unknown statusId, using fallback: ' + statusId);
    return getFallbackDisplayableStatus(statusId, fallbackTitleOrDynamicValue);
  }

  // 4. Construct display properties
  let finalDisplayName = baseStatusDefinition.displayName;
  if (
    baseStatusDefinition.isDynamic &&
    baseStatusDefinition.dynamicDisplayNamePattern
  ) {
    if (extractedValue) {
      finalDisplayName = baseStatusDefinition.dynamicDisplayNamePattern.replace(
        /\{value\}|\{extractedValue\}/g,
        extractedValue,
      );
    } else if (fallbackTitleOrDynamicValue) {
      // Fallback if extractor failed but a general title was given
      finalDisplayName = baseStatusDefinition.dynamicDisplayNamePattern.replace(
        /\{value\}|\{extractedValue\}/g,
        fallbackTitleOrDynamicValue,
      );
    } else {
      // If dynamic but no value extracted and no fallback, use the raw pattern or a generic placeholder
      // This case implies the dynamicDisplayNamePattern itself should be a reasonable fallback.
      // Or, adjust finalDisplayName to indicate missing data, e.g., by removing "{value}"
      finalDisplayName = baseStatusDefinition.dynamicDisplayNamePattern
        .replace(/\{value\}|\{extractedValue\}/g, "")
        .trim();
      if (finalDisplayName.endsWith(":")) finalDisplayName += " (undefined)";
    }
  }

  return {
    displayName: finalDisplayName,
    colorScheme: baseStatusDefinition.colorScheme,
    icon: baseStatusDefinition.icon,
    dynamicValue: extractedValue, // Return the extracted/fallback value
  };
}

/**
 * Provides a default/fallback representation for status IDs that are not
 * explicitly defined in `STATUS_MAP` or for which dynamic parsing fails.
 * This ensures the UI can still display something minimally informative.
 *
 * @param {string} originalStatusId - The original status ID string that was not found or parsed.
 * @param {string} [fallbackTitle] - An optional title that might have been passed for context.
 * @returns {DisplayableStatus} A fallback displayable status object.
 */
export function getFallbackDisplayableStatus(
  originalStatusId: string,
  fallbackTitle?: string,
): {
  displayName: string;
  colorScheme: string;
  icon?: ElementType | string;
  dynamicValue?: string;
} {
  // Try to make a somewhat readable display name from the originalStatusId
  let displayName = fallbackTitle || originalStatusId;
  if (!fallbackTitle) {
    displayName = originalStatusId
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
  }

  return {
    displayName: displayName,
    colorScheme: "gray", // Default color for unknown statuses
    icon: "QuestionIcon", // Placeholder for an unknown or help icon
    dynamicValue:
      fallbackTitle === originalStatusId ? undefined : originalStatusId, // If fallbackTitle was originalStatusId, no distinct dynamicValue
  };
}

/**
 * Retrieves an array of all canonical `StatusID` keys defined in `STATUS_MAP`.
 * Useful for populating dropdowns or iterating over all known status types.
 *
 * @returns {StatusID[]} An array of all status ID strings.
 * @example
 * const allIds = getAllStatusIds();
 * allIds.forEach(id => console.log(id));
 */
export function getAllStatusIds(): StatusID[] {
  return Object.keys(STATUS_MAP) as StatusID[];
}
