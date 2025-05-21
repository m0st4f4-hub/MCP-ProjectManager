import { StatusID } from "@/lib/statusUtils";

export function getStatusAccentColor(
  status: StatusID,
  accentToDo: string,
  accentInProgress: string,
  accentBlocked: string,
  accentPending: string,
  accentCompleted: string,
  accentDefault: string,
) {
  switch (status) {
    case "TO_DO":
      return accentToDo;
    case "IN_PROGRESS":
      return accentInProgress;
    case "BLOCKED":
      return accentBlocked;
    case "PENDING_VERIFICATION":
      return accentPending;
    case "COMPLETED":
      return accentCompleted;
    default:
      return accentDefault;
  }
}

export function getStatusTagColors(
  status: StatusID,
  statusTagToDoBg: string,
  statusTagToDoColor: string,
  statusTagInProgressBg: string,
  statusTagInProgressColor: string,
  statusTagBlockedBg: string,
  statusTagBlockedColor: string,
  statusTagPendingBg: string,
  statusTagPendingColor: string,
  statusTagCompletedBg: string,
  statusTagCompletedColor: string,
  statusTagDefaultBg: string,
  statusTagDefaultColor: string,
): { bg: string; color: string } {
  switch (status) {
    case "TO_DO":
      return { bg: statusTagToDoBg, color: statusTagToDoColor };
    case "IN_PROGRESS":
      return { bg: statusTagInProgressBg, color: statusTagInProgressColor };
    case "BLOCKED":
      return { bg: statusTagBlockedBg, color: statusTagBlockedColor };
    case "PENDING_VERIFICATION":
      return { bg: statusTagPendingBg, color: statusTagPendingColor };
    case "COMPLETED":
      return { bg: statusTagCompletedBg, color: statusTagCompletedColor };
    default:
      return { bg: statusTagDefaultBg, color: statusTagDefaultColor };
  }
}
