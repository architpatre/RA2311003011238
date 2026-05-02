export type LogStack = "frontend" | "backend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

const validate = (stack: string, level: string, pkg: string, message: string) => {
  const acceptedStacks = ["frontend", "backend"];
  const acceptedLevels = ["debug", "info", "warn", "error", "fatal"];

  if (!acceptedStacks.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  if (!acceptedLevels.includes(level)) {
    throw new Error(`Invalid level: ${level}`);
  }

  if (!pkg || typeof pkg !== "string") {
    throw new Error("Package is required and must be a string.");
  }

  if (!message || typeof message !== "string") {
    throw new Error("Message is required and must be a string.");
  }
};

export const Log = async (
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => {
  try {
    validate(stack, level, pkg, message);

    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    return response.json();
  } catch (error) {
    console.warn("Logging middleware could not post log:", error);
    return null;
  }
};
