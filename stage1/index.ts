import { Log } from "../logging-middleware/logClient.js";
import { getTopNotifications } from "./notificationManager.js";

type Notification = {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
};

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

const fetchNotifications = async (): Promise<Notification[]> => {
  await Log("backend", "info", "api", "fetching notifications from API");

  try {
    const token = process.env.EVALUATION_SERVICE_TOKEN;
    const response = await fetch(API_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (token) {
      await Log("backend", "debug", "config", "using EVALUATION_SERVICE_TOKEN for notifications fetch");
    }

    if (!response.ok) {
      await Log("backend", "error", "api", `API returned status ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as { notifications: Notification[] };
    await Log("backend", "debug", "api", `received ${data.notifications?.length || 0} notifications`);

    return data.notifications || [];
  } catch (error) {
    await Log("backend", "error", "api", `fetch failed: ${error}`);
    throw error;
  }
};

const main = async () => {
  await Log("backend", "info", "config", "stage1 notification priority inbox starting");

  try {
    const notifications = await fetchNotifications();

    if (notifications.length === 0) {
      await Log("backend", "warn", "api", "no notifications received");
      process.stdout.write("No notifications available.\n");
      return;
    }

    await Log("backend", "debug", "utils", `processing ${notifications.length} notifications`);

    const topNotifications = await getTopNotifications(notifications, 10);

    process.stdout.write("\n=== Top 10 Priority Notifications ===\n\n");
    topNotifications.forEach((notif, index) => {
      process.stdout.write(`${index + 1}. [${notif.Type}] ${notif.Message}\n`);
      process.stdout.write(`   ID: ${notif.ID}\n`);
      process.stdout.write(`   Timestamp: ${notif.Timestamp}\n\n`);
    });

    await Log("backend", "info", "config", "top 10 notifications displayed successfully");
  } catch (error) {
    await Log("backend", "fatal", "config", `stage1 failed: ${error}`);
    process.stderr.write(`Error: ${String(error)}\n`);
    process.exit(1);
  }
};

main();
