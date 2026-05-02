import { useState } from "react";
import { logEvent } from "../utils/logClient";

export const useNotifications = () => {
  const [notificationText, setNotificationText] = useState("");
  const [notifications, setNotifications] = useState(
    [] as Array<{ id: string; message: string; timestamp: string }>
  );

  const sendNotification = async (message: string) => {
    if (!message.trim()) {
      logEvent("frontend", "warn", "component", "Attempted to send empty notification message.");
      throw new Error("Notification text cannot be empty.");
    }

    const record = {
      id: `${Date.now()}`,
      message,
      timestamp: new Date().toLocaleString(),
    };

    setNotifications((current) => [...current, record]);

    logEvent("frontend", "debug", "hook", "Preparing notification payload for backend submission.");

    // Placeholder for actual API integration
    await new Promise((resolve) => setTimeout(resolve, 400));

    setNotificationText("");
    return record;
  };

  return {
    notificationText,
    setNotificationText,
    notifications,
    sendNotification,
  };
};
