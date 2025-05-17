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
 * These include both static statuses and base strings for statuses that might
 * incorporate dynamic information (e.g., 'COMPLETED_HANDOFF_TO_...').
 */
export type StatusID =
  | "TO_DO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "CONTEXT_ACQUIRED"
  | "PLANNING_COMPLETE"
  | "EXECUTION_IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFICATION_COMPLETE"
  | "VERIFICATION_FAILED"
  | "COMPLETED_AWAITING_PROJECT_MANAGER"
  | "COMPLETED_HANDOFF_TO_..." // Base for dynamic status, full string includes IDs
  | "FAILED"
  | "IN_PROGRESS_AWAITING_SUBTASK"
  | "PENDING_RECOVERY_ATTEMPT";

/**
 * Represents the full set of attributes for a canonical task status.
 * This interface defines the shape of objects stored in `STATUS_MAP`.
 */
export interface StatusAttributeObject {
  /**
   * The raw string identifier for the status.
   * Matches one of the `StatusID` types.
   */
  id: StatusID;
  /**
   * User-friendly name for display in the UI (e.g., table cells, badges, tooltips).
   * For dynamic statuses, this might be a template string.
   */
  displayName: string;
  /**
   * Broad category for filtering, grouping, or applying consistent styling/logic.
   * (e.g., 'todo', 'inProgress', 'completed', 'failed', 'blocked', 'pendingInput').
   */
  category:
    | "todo"
    | "inProgress"
    | "pendingInput"
    | "completed"
    | "failed"
    | "blocked";
  /**
   * A brief explanation of what the status means.
   * Useful for tooltips or more detailed views.
   */
  description: string;
  /**
   * Suggested Chakra UI color scheme (e.g., 'blue', 'green', 'red').
   * This is used to consistently color UI elements associated with the status.
   * See Chakra UI documentation for available color schemes.
   */
  colorScheme: string;
  /**
   * Suggested icon to visually represent the status.
   * Can be a string (e.g., a key for an icon map, or a placeholder like 'EditIcon')
   * or a Chakra UI `As` type if icons are directly imported and passed.
   * @see As (Chakra UI)
   * @example 'CheckCircleIcon' // Placeholder name
   * @example CheckCircleIcon // Actual imported component (if As type is used)
   */
  icon?: ElementType | string;
  /**
   * Indicates if the task is considered finished from an agent's perspective
   * and no further automated work or standard progression is expected for this specific task.
   * `true` if the status represents a final state for the task's lifecycle (e.g., Completed, Failed).
   * `false` if the task is still active or pending.
   */
  isTerminal: boolean;
  /**
   * Indicates if the status string itself (when used in a task object)
   * is expected to contain dynamic parts (e.g., task IDs, agent names).
   * For example, 'COMPLETED_HANDOFF_TO_task123,task456'.
   * If `true`, `dynamicPartsExtractor` and `dynamicDisplayNamePattern` are typically used.
   */
  isDynamic: boolean;
  /**
   * A string representation of a RegExp or a RegExp object used to extract dynamic
   * information from a full status string if `isDynamic` is true.
   * The first capture group of the regex should typically capture the relevant dynamic value.
   * @example /^COMPLETED_HANDOFF_TO_(([a-zA-Z0-9-]+(?:\\s*,\\s*[a-zA-Z0-9-]+)*))$/
   */
  dynamicPartsExtractor?: string | RegExp;
  /**
   * A template string for generating a `displayName` when `isDynamic` is true.
   * It should include a placeholder like `{value}` or `{extractedValue}` which will be
   * replaced by the value extracted by `dynamicPartsExtractor`.
   * @example 'Handoff to: {value}'
   */
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
  TO_DO: {
    id: "TO_DO",
    displayName: "To Do",
    category: "todo",
    description: "Task is pending and has not yet been started.",
    colorScheme: "gray",
    icon: "EditIcon", // Placeholder for an icon like Chakra UI's EditIcon or similar
    isTerminal: false,
    isDynamic: false,
  },
  IN_PROGRESS: {
    id: "IN_PROGRESS",
    displayName: "In Progress",
    category: "inProgress",
    description: "Task is actively being worked on.",
    colorScheme: "blue",
    icon: "TimeIcon", // Placeholder for an icon indicating activity or time
    isTerminal: false,
    isDynamic: false,
  },
  BLOCKED: {
    id: "BLOCKED",
    displayName: "Blocked",
    category: "blocked",
    description: "Task cannot proceed due to a dependency or issue.",
    colorScheme: "orange",
    icon: "WarningTwoIcon", // Placeholder for an icon indicating a warning or blockage
    isTerminal: false,
    isDynamic: false,
  },
  COMPLETED: {
    id: "COMPLETED",
    displayName: "Completed",
    category: "completed",
    description: "Task has been finished successfully.",
    colorScheme: "green",
    icon: "CheckCircleIcon", // Placeholder for an icon indicating success
    isTerminal: true,
    isDynamic: false,
  },
  CONTEXT_ACQUIRED: {
    id: "CONTEXT_ACQUIRED",
    displayName: "Context Acquired",
    category: "inProgress",
    description: "Agent has fetched and understood the task details.",
    colorScheme: "cyan",
    icon: "InfoOutlineIcon", // Placeholder for an informational icon
    isTerminal: false,
    isDynamic: false,
  },
  PLANNING_COMPLETE: {
    id: "PLANNING_COMPLETE",
    displayName: "Planning Complete",
    category: "inProgress",
    description: "Agent has finalized its plan of action for the task.",
    colorScheme: "teal",
    icon: "ListOrderedIcon", // Placeholder, e.g. RiListOrdered or similar
    isTerminal: false,
    isDynamic: false,
  },
  EXECUTION_IN_PROGRESS: {
    id: "EXECUTION_IN_PROGRESS",
    displayName: "Execution In Progress",
    category: "inProgress",
    description: "Agent is currently executing the core work of the task.",
    colorScheme: "blue",
    icon: "RepeatClockIcon", // Placeholder, e.g. MdOutlineSettingsBackupRestore or similar for ongoing work
    isTerminal: false,
    isDynamic: false,
  },
  PENDING_VERIFICATION: {
    id: "PENDING_VERIFICATION",
    displayName: "Pending Verification",
    category: "inProgress", // Still active, but a specific sub-state
    description:
      "Agent has completed the execution and is awaiting verification of the results.",
    colorScheme: "yellow",
    icon: "QuestionOutlineIcon", // Placeholder for a query or pending state
    isTerminal: false,
    isDynamic: false,
  },
  VERIFICATION_COMPLETE: {
    id: "VERIFICATION_COMPLETE",
    displayName: "Verification Complete",
    category: "inProgress", // Part of the active flow, leading to a terminal state
    description:
      "Agent has successfully verified the results of its execution.",
    colorScheme: "green",
    icon: "CheckIcon", // Placeholder for a simple checkmark
    isTerminal: false, // Typically followed by a handoff or PM review status
    isDynamic: false,
  },
  VERIFICATION_FAILED: {
    id: "VERIFICATION_FAILED",
    displayName: "Verification Failed",
    category: "failed",
    description:
      "Agent's verification of the task's execution failed. Requires attention.",
    colorScheme: "red",
    icon: "NotAllowedIcon", // Placeholder for failure or error
    isTerminal: false, // Not truly terminal as it usually requires rework or PM intervention
    isDynamic: false,
  },
  COMPLETED_AWAITING_PROJECT_MANAGER: {
    id: "COMPLETED_AWAITING_PROJECT_MANAGER",
    displayName: "Completed (Awaiting PM Review)",
    category: "completed",
    description:
      "Task is completed by the agent and awaits review or next steps from the Project Manager.",
    colorScheme: "purple",
    icon: "EmailIcon", // Placeholder, suggesting communication or review needed
    isTerminal: true,
    isDynamic: false,
  },
  "COMPLETED_HANDOFF_TO_...": {
    id: "COMPLETED_HANDOFF_TO_...",
    displayName: "Handoff to: {value}", // Default dynamic pattern
    category: "completed",
    description:
      "Task is completed, and follow-up tasks have been created and assigned. The dynamic part holds the new Task IDs or relevant handoff information.",
    colorScheme: "purple",
    icon: "ArrowForwardIcon", // Placeholder for handoff or continuation
    isTerminal: true,
    isDynamic: true,
    dynamicPartsExtractor:
      /^COMPLETED_HANDOFF_TO_((?:[a-zA-Z0-9-]+|\b\w+\b)(?:\\s*,\\s*(?:[a-zA-Z0-9-]+|\b\w+\b))*)$/i,
    dynamicDisplayNamePattern: "Handoff to: {value}",
  },
  FAILED: {
    id: "FAILED",
    displayName: "Failed",
    category: "failed",
    description:
      "Task could not be completed due to an unrecoverable error or failure.",
    colorScheme: "red",
    icon: "WarningIcon", // Placeholder for a general warning/failure icon
    isTerminal: true,
    isDynamic: false,
  },
  IN_PROGRESS_AWAITING_SUBTASK: {
    id: "IN_PROGRESS_AWAITING_SUBTASK",
    displayName: "Awaiting Subtask(s)",
    category: "blocked", // Considered blocked as it cannot proceed
    description:
      "Task is paused, waiting for one or more subtasks to be completed.",
    colorScheme: "orange",
    icon: "TimeIcon", // Placeholder, can indicate waiting
    isTerminal: false,
    isDynamic: false,
  },
  PENDING_RECOVERY_ATTEMPT: {
    id: "PENDING_RECOVERY_ATTEMPT",
    displayName: "Pending Recovery",
    category: "inProgress", // Actively trying to recover
    description:
      "Agent encountered an issue and is planning or attempting a recovery action.",
    colorScheme: "yellow",
    icon: "RepeatIcon", // Placeholder, indicating a retry or recovery process
    isTerminal: false,
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
  return STATUS_MAP[statusId];
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
