export type LogStack = "frontend" | "backend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

const authToken = import.meta.env.VITE_LOG_API_TOKEN || "";

const validateLogPayload = (
  stack: string,
  level: string,
  pkg: string,
  message: string
) => {
  const stackSet = new Set(["frontend", "backend"]);
  const levelSet = new Set(["debug", "info", "warn", "error", "fatal"]);

  if (!stackSet.has(stack) || !levelSet.has(level)) {
    throw new Error("Invalid log payload values.");
  }

  if (!message || typeof message !== "string") {
    throw new Error("Log message must be a non-empty string.");
  }

  return true;
};

export const logEvent = async (
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => {
  try {
    validateLogPayload(stack, level, pkg, message);

    const body = { stack, level, package: pkg, message };

    await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    console.debug("Log sent:", body);
  } catch (error) {
    console.warn("Logging middleware failed:", error);
  }
};
