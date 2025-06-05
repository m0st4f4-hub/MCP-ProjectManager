import * as logger from '@/utils/logger';
// import { Status } from '@/types';
import {
  getStatusAttributes,
  StatusID as CanonicalStatusID,
} from "@/lib/statusUtils";

export const formatDisplayName = (name?: string | null): string => {
  if (!name || name.trim() === "") {
    return "Unnamed";
  }

  // Replace underscores and hyphens with spaces, then capitalize each word
  const words = name.replace(/[_-]/g, " ").toLowerCase().split(" ");

  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );

  return capitalizedWords.join(" ").trim();
};

export const mapStatusToStatusID = (
  status: string | null | undefined,
): CanonicalStatusID => {
  if (!status || typeof status !== "string" || status.trim() === "") {
    return "TO_DO"; // Default for null, undefined, or empty/non-string
  }

  // Handle common display names case-insensitively
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "to do":
    case "todo":
      return "TO_DO";
    case "in progress":
      return "IN_PROGRESS";
    case "blocked":
      return "BLOCKED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "failed":
      return "FAILED";
    case "verification failed":
      return "VERIFICATION_FAILED";
    // Add more explicit mappings if other common display names exist
    // e.g., case 'context acquired': return 'CONTEXT_ACQUIRED';
  }

  // Fallback: try to match the uppercased/underscored version directly as a CanonicalStatusID
  // This handles cases where task.status might already be a StatusID string (e.g., "EXECUTION_IN_PROGRESS")
  // or a custom status string that follows the StatusID format.
  const upperStatus = status.toUpperCase().replace(/\s+/g, "_");
  if (getStatusAttributes(upperStatus as CanonicalStatusID)) {
    // It's a known CanonicalStatusID.
    // Optionally, add a logger.warn if 'status' wasn't identical to 'upperStatus'
    // to catch statuses that are almost StatusIDs but have different casing/spacing.
    if (status !== upperStatus && typeof console !== "undefined") {
      logger.warn(
        `[mapStatusToStatusID] Mapped status "${status}" to CanonicalStatusID "${upperStatus}".`,
      );
    }
    return upperStatus as CanonicalStatusID;
  }

  // If no match after explicit cases and direct StatusID check, then it's unknown.
  if (typeof console !== "undefined") {
    logger.warn(
      `[mapStatusToStatusID] Unknown status value: "${status}", defaulting to TO_DO.`,
    );
  }
  return "TO_DO";
};
