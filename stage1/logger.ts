export type LogStack = "backend" | "frontend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage = "api" | "utils" | "config" | "component" | "hook" | "page" | "state" | "style" | "auth" | "middleware";

export const Log = async (
  _stack: LogStack,
  _level: LogLevel,
  _pkg: LogPackage,
  message: string
): Promise<void> => {
  // local logging only, no remote API calls during validation
  console.debug(`[${_level}] ${message}`);
};
