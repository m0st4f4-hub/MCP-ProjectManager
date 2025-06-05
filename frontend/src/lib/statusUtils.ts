/**
 * @module statusUtils
 * Centralized utilities for defining, managing, and displaying task statuses
 * in the MCP Task Manager application.
 */

import type { ElementType } from "react";

/* ────────────────────────────────────────────────────────────── */
/* Status Identifiers                                            */
/* ────────────────────────────────────────────────────────────── */

export type StatusID =
  /* natural-language literals (backend enum title-case) */
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt"
  /* BACKEND_ENUM_STYLE aliases */
  | "TO_DO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED"
  | "CONTEXT_ACQUIRED"
  | "PLANNING_COMPLETE"
  | "EXECUTION_IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFICATION_COMPLETE"
  | "VERIFICATION_FAILED"
  | "COMPLETED_AWAITING_PROJECT_MANAGER"
  | "COMPLETED_HANDOFF_TO_..."
  | "FAILED"
  | "IN_PROGRESS_AWAITING_SUBTASK"
  | "PENDING_RECOVERY_ATTEMPT";

/* ────────────────────────────────────────────────────────────── */
/* Status Attribute Object                                       */
/* ────────────────────────────────────────────────────────────── */

export interface StatusAttributeObject {
  id: StatusID;
  displayName: string;
  category: "todo" | "inProgress" | "pendingInput" | "completed" | "failed" | "blocked";
  description: string;
  colorScheme: string;
  icon?: ElementType | string;          // Chakra/react-icon component or string key
  isTerminal: boolean;                  // true ⇒ no further state transitions
  isDynamic: boolean;                   // true ⇒ displayName is pattern-driven
  dynamicPartsExtractor?: string | RegExp;     // regex to capture value(s)
  dynamicDisplayNamePattern?: string;          // pattern with {value} placeholder
}

/* ────────────────────────────────────────────────────────────── */
/* Canonical Status Map                                          */
/* ────────────────────────────────────────────────────────────── */

const STATUS_MAP = {
  /* ---------- TODO ---------- */
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

  /* ---------- IN PROGRESS ---------- */
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
  "Context Acquired": {
    id: "Context Acquired",
    displayName: "Context Acquired",
    category: "inProgress",
    description: "Agent has gathered necessary context.",
    colorScheme: "blue",
    icon: "InfoIcon",
    isTerminal: false,
    isDynamic: false,
  },
  CONTEXT_ACQUIRED: {
    id: "Context Acquired",
    displayName: "Context Acquired",
    category: "inProgress",
    description: "Agent has gathered necessary context.",
    colorScheme: "blue",
    icon: "InfoIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "Planning Complete": {
    id: "Planning Complete",
    displayName: "Planning Complete",
    category: "inProgress",
    description: "Planning phase finished.",
    colorScheme: "purple",
    icon: "CalendarIcon",
    isTerminal: false,
    isDynamic: false,
  },
  PLANNING_COMPLETE: {
    id: "Planning Complete",
    displayName: "Planning Complete",
    category: "inProgress",
    description: "Planning phase finished.",
    colorScheme: "purple",
    icon: "CalendarIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "Execution In Progress": {
    id: "Execution In Progress",
    displayName: "Execution In Progress",
    category: "inProgress",
    description: "Agent is executing the task.",
    colorScheme: "blue",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  EXECUTION_IN_PROGRESS: {
    id: "Execution In Progress",
    displayName: "Execution In Progress",
    category: "inProgress",
    description: "Agent is executing the task.",
    colorScheme: "blue",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "In Progress Awaiting Subtask": {
    id: "In Progress Awaiting Subtask",
    displayName: "In Progress Awaiting Subtask",
    category: "inProgress",
    description: "Waiting for subtask completion.",
    colorScheme: "orange",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },
  IN_PROGRESS_AWAITING_SUBTASK: {
    id: "In Progress Awaiting Subtask",
    displayName: "In Progress Awaiting Subtask",
    category: "inProgress",
    description: "Waiting for subtask completion.",
    colorScheme: "orange",
    icon: "TimeIcon",
    isTerminal: false,
    isDynamic: false,
  },

  /* ---------- PENDING-INPUT ---------- */
  "Pending Verification": {
    id: "Pending Verification",
    displayName: "Pending Verification",
    category: "pendingInput",
    description: "Awaiting verification of results.",
    colorScheme: "orange",
    icon: "ViewIcon",
    isTerminal: false,
    isDynamic: false,
  },
  PENDING_VERIFICATION: {
    id: "Pending Verification",
    displayName: "Pending Verification",
    category: "pendingInput",
    description: "Awaiting verification of results.",
    colorScheme: "orange",
    icon: "ViewIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "Pending Recovery Attempt": {
    id: "Pending Recovery Attempt",
    displayName: "Pending Recovery Attempt",
    category: "pendingInput",
    description: "Awaiting recovery attempt.",
    colorScheme: "orange",
    icon: "RepeatIcon",
    isTerminal: false,
    isDynamic: false,
  },
  PENDING_RECOVERY_ATTEMPT: {
    id: "Pending Recovery Attempt",
    displayName: "Pending Recovery Attempt",
    category: "pendingInput",
    description: "Awaiting recovery attempt.",
    colorScheme: "orange",
    icon: "RepeatIcon",
    isTerminal: false,
    isDynamic: false,
  },

  /* ---------- COMPLETED ---------- */
  "Completed": {
    id: "Completed",
    displayName: "Completed",
    category: "completed",
    description: "Task finished successfully.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: true,
    isDynamic: false,
  },
  COMPLETED: {
    id: "Completed",
    displayName: "Completed",
    category: "completed",
    description: "Task finished successfully.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: true,
    isDynamic: false,
  },
  "Verification Complete": {
    id: "Verification Complete",
    displayName: "Verification Complete",
    category: "completed",
    description: "Verification succeeded.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: false,
    isDynamic: false,
  },
  VERIFICATION_COMPLETE: {
    id: "Verification Complete",
    displayName: "Verification Complete",
    category: "completed",
    description: "Verification succeeded.",
    colorScheme: "green",
    icon: "CheckCircleIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "Completed Awaiting Project Manager": {
    id: "Completed Awaiting Project Manager",
    displayName: "Completed Awaiting Project Manager",
    category: "completed",
    description: "Waiting for project manager review.",
    colorScheme: "purple",
    icon: "TimeIcon",
    isTerminal: true,
    isDynamic: false,
  },
  COMPLETED_AWAITING_PROJECT_MANAGER: {
    id: "Completed Awaiting Project Manager",
    displayName: "Completed Awaiting Project Manager",
    category: "completed",
    description: "Waiting for project manager review.",
    colorScheme: "purple",
    icon: "TimeIcon",
    isTerminal: true,
    isDynamic: false,
  },
  "Completed Handoff": {
    id: "Completed Handoff",
    displayName: "Completed Handoff",
    category: "completed",
    description: "Completed with handoff to another task.",
    colorScheme: "green",
    icon: "ArrowForwardIcon",
    isTerminal: true,
    isDynamic: true,
    dynamicPartsExtractor: /^COMPLETED_HANDOFF_TO_(([a-zA-Z0-9-]+(?:\s*,\s*[a-zA-Z0-9-]+)*))$/,
    dynamicDisplayNamePattern: "Handoff to: {value}",
  },
  "COMPLETED_HANDOFF_TO_...": {
    id: "Completed Handoff",
    displayName: "Completed Handoff",
    category: "completed",
    description: "Completed with handoff to another task.",
    colorScheme: "green",
    icon: "ArrowForwardIcon",
    isTerminal: true,
    isDynamic: true,
    dynamicPartsExtractor: /^COMPLETED_HANDOFF_TO_(([a-zA-Z0-9-]+(?:\s*,\s*[a-zA-Z0-9-]+)*))$/,
    dynamicDisplayNamePattern: "Handoff to: {value}",
  },

  /* ---------- BLOCKED / CANCELLED ---------- */
  "Blocked": {
    id: "Blocked",
    displayName: "Blocked",
    category: "blocked",
    description: "Task is blocked and cannot proceed.",
    colorScheme: "red",
    icon: "NotAllowedIcon",
    isTerminal: false,
    isDynamic: false,
  },
  BLOCKED: {
    id: "Blocked",
    displayName: "Blocked",
    category: "blocked",
    description: "Task is blocked and cannot proceed.",
    colorScheme: "red",
    icon: "NotAllowedIcon",
    isTerminal: false,
    isDynamic: false,
  },
  "Cancelled": {
    id: "Cancelled",
    displayName: "Cancelled",
    category: "blocked",
    description: "Task was cancelled before completion.",
    colorScheme: "gray",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },
  CANCELLED: {
    id: "Cancelled",
    displayName: "Cancelled",
    category: "blocked",
    description: "Task was cancelled before completion.",
    colorScheme: "gray",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },

  /* ---------- FAILED / BLOCKED / TERMINAL ---------- */
  Failed: {
    id: "Failed",
    displayName: "Failed",
    category: "failed",
    description: "Task failed to complete.",
    colorScheme: "red",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },
  FAILED: {
    id: "Failed",
    displayName: "Failed",
    category: "failed",
    description: "Task failed to complete.",
    colorScheme: "red",
    icon: "CloseIcon",
    isTerminal: true,
    isDynamic: false,
  },
  "Verification Failed": {
    id: "Verification Failed",
    displayName: "Verification Failed",
    category: "failed",
    description: "Verification failed.",
    colorScheme: "red",
    icon: "WarningTwoIcon",
    isTerminal: false,
    isDynamic: false,
  },
  VERIFICATION_FAILED: {
    id: "Verification Failed",
    displayName: "Verification Failed",
    category: "failed",
    description: "Verification failed.",
    colorScheme: "red",
    icon: "WarningTwoIcon",
    isTerminal: false,
    isDynamic: false,
  },
} as const satisfies Readonly<Record<StatusID, StatusAttributeObject>>;

/* ────────────────────────────────────────────────────────────── */
/* Helper Functions                                              */
/* ────────────────────────────────────────────────────────────── */

export function getStatusAttributes(statusId: StatusID): StatusAttributeObject | undefined {
  let key = statusId as string;
  if (key === key.toUpperCase()) {
    key = key
      .toLowerCase()
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return STATUS_MAP[key as StatusID];
}

export function getDisplayableStatus(
  statusId: string,
  fallback?: string,
):
  | { displayName: string; colorScheme: string; icon?: ElementType | string; dynamicValue?: string }
  | undefined {
  let base: StatusAttributeObject | undefined;
  let extracted = fallback;

  // Static lookup first
  if (STATUS_MAP[statusId as StatusID]) {
    base = STATUS_MAP[statusId as StatusID];
  } else {
    // Dynamic lookup
    for (const def of Object.values(STATUS_MAP)) {
      if (def.isDynamic && def.dynamicPartsExtractor) {
        const match = statusId.match(def.dynamicPartsExtractor);
        if (match) {
          base = def;
          if (match[1]) extracted = match[1];
          break;
        }
      }
    }
  }

  if (!base) return getFallbackDisplayableStatus(statusId, fallback);

  let display = base.displayName;
  if (base.isDynamic && base.dynamicDisplayNamePattern) {
    display = base.dynamicDisplayNamePattern.replace(/\{value\}|\{extractedValue\}/g, extracted || "");
    display = display.trim().replace(/:\s*$/, (s) => (extracted ? s : ": (undefined)"));
  }

  return { displayName: display, colorScheme: base.colorScheme, icon: base.icon, dynamicValue: extracted };
}

export function getFallbackDisplayableStatus(
  original: string,
  fallback?: string,
): { displayName: string; colorScheme: string; icon?: ElementType | string; dynamicValue?: string } {
  const title =
    fallback ||
    original
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    displayName: title,
    colorScheme: "gray",
    icon: "QuestionIcon",
    dynamicValue: fallback === original ? undefined : original,
  };
}

export function getAllStatusIds(): StatusID[] {
  return Object.keys(STATUS_MAP) as StatusID[];
}
