import { Task, TaskStatus } from "@/types/task";

export const generatePromptForTasks = (
  promptTasks: Task[],
  actionVerb: string,
  taskNounPlural: string,
  taskNounSingular: string,
): string => {
  if (!promptTasks || promptTasks.length === 0) {
    // Added a check for undefined promptTasks
    return `No ${taskNounPlural} to generate a prompt for.`;
  }
  const taskLimit = 5;
  const taskDetails = promptTasks
    .slice(0, taskLimit)
    .map((t) => `Title: ${t.title} (ID: ${t.id})`)
    .join("\n- ");

  let prompt = `Please ${actionVerb} the following ${promptTasks.length === 1 ? taskNounSingular : taskNounPlural}:\n- ${taskDetails}`;

  if (promptTasks.length > taskLimit) {
    prompt += `\n...and ${promptTasks.length - taskLimit} more.`;
  }
  return prompt;
};

export const getCompletedTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "review and verify",
    "completed tasks",
    "completed task",
  );

export const getPendingTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "prioritize and work on",
    "pending tasks",
    "pending task",
  );

export const getInProgressTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "check status and assist with",
    "tasks in progress",
    "task in progress",
  );

export const getBlockedTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "investigate and resolve blockers for",
    "blocked tasks",
    "blocked task",
  );

export const getFailedTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "investigate and attempt to recover",
    "failed tasks",
    "failed task",
  );

export const getUnassignedTaskPrompt = (tasks: Task[]): string =>
  generatePromptForTasks(
    tasks,
    "assign to available agents",
    "unassigned tasks",
    "unassigned task",
  );

export const STATUS_PROMPT_MAP: Record<TaskStatus, (tasks: Task[]) => string> = {
  [TaskStatus.TO_DO]: getPendingTaskPrompt,
  [TaskStatus.IN_PROGRESS]: getInProgressTaskPrompt,
  [TaskStatus.IN_REVIEW]: getInProgressTaskPrompt,
  [TaskStatus.EXECUTION_IN_PROGRESS]: getInProgressTaskPrompt,
  [TaskStatus.CONTEXT_ACQUIRED]: getInProgressTaskPrompt,
  [TaskStatus.PLANNING_COMPLETE]: getInProgressTaskPrompt,
  [TaskStatus.IN_PROGRESS_AWAITING_SUBTASK]: getInProgressTaskPrompt,
  [TaskStatus.PENDING_RECOVERY_ATTEMPT]: getInProgressTaskPrompt,
  [TaskStatus.PENDING_VERIFICATION]: getInProgressTaskPrompt,
  [TaskStatus.BLOCKED]: getBlockedTaskPrompt,
  [TaskStatus.CANCELLED]: getFailedTaskPrompt,
  [TaskStatus.VERIFICATION_FAILED]: getFailedTaskPrompt,
  [TaskStatus.FAILED]: getFailedTaskPrompt,
  [TaskStatus.COMPLETED]: getCompletedTaskPrompt,
  [TaskStatus.VERIFICATION_COMPLETE]: getCompletedTaskPrompt,
  [TaskStatus.COMPLETED_AWAITING_PROJECT_MANAGER]: getCompletedTaskPrompt,
  [TaskStatus.COMPLETED_HANDOFF]: getCompletedTaskPrompt,
};
