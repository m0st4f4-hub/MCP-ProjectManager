const LEVELS = { info: 0, warn: 1, error: 2 } as const;
export type LogLevel = keyof typeof LEVELS;
const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
const currentLevel: LogLevel = envLevel && envLevel in LEVELS ? envLevel : 'info';
export function info(...args: unknown[]) {
  if (LEVELS[currentLevel] <= LEVELS.info) {
    console.info(...args);
  }
}
export function warn(...args: unknown[]) {
  if (LEVELS[currentLevel] <= LEVELS.warn) {
    console.warn(...args);
  }
}
export function error(...args: unknown[]) {
  if (LEVELS[currentLevel] <= LEVELS.error) {
    console.error(...args);
  }
}
export default { info, warn, error };
