import { Log } from "../logging-middleware/logClient.js";
import { getTopNotifications } from "./notificationManager.js";

type Notification = {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
};

const API_URL = "http://20.207.122.201/evaluation-service/notifications";
const REGISTER_URL = "http://20.207.122.201/evaluation-service/register";

type RegistrationResponse = { clientId: string; clientSecret: string };

type RegistrationPayload = {
  accessCode: string;
  email: string;
  name: string;
  rollNo: string;
  mobileNo: string;
  githubUsername: string;
};

const registerClient = async (payload: RegistrationPayload): Promise<RegistrationResponse> => {
  await Log("backend", "info", "api", "registering client via evaluation-service/register");

  const response = await fetch(REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    if (bodyText) {
      await Log("backend", "debug", "api", `registration error body: ${bodyText.slice(0, 500)}`);
    }
    await Log("backend", "error", "api", `registration failed with status ${response.status}`);
    throw new Error(`Registration API error: ${response.status}${bodyText ? ` - ${bodyText}` : ""}`);
  }

  const data = (await response.json()) as RegistrationResponse;
  if (!data?.clientId || !data?.clientSecret) {
    await Log("backend", "error", "api", "registration response missing clientId/clientSecret");
    throw new Error("Registration response missing clientId/clientSecret");
  }

  await Log("backend", "info", "api", "registration succeeded (clientId/clientSecret received)");
  return data;
};

const fetchNotifications = async (): Promise<Notification[]> => {
  await Log("backend", "info", "api", "fetching notifications from API");

  try {
    const token = process.env.EVALUATION_SERVICE_TOKEN;
    const clientId = process.env.EVALUATION_SERVICE_CLIENT_ID;
    const clientSecret = process.env.EVALUATION_SERVICE_CLIENT_SECRET;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      await Log("backend", "debug", "config", "using EVALUATION_SERVICE_TOKEN for notifications fetch");
    } else if (clientId && clientSecret) {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers.Authorization = `Basic ${basic}`;
      await Log("backend", "debug", "config", "using Basic auth (client id/secret) for notifications fetch");
    }

    const response = await fetch(API_URL, { headers: Object.keys(headers).length ? headers : undefined });

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
    const accessCode = process.env.EVALUATION_SERVICE_ACCESS_CODE;
    if (accessCode) {
      const email = process.env.EVALUATION_SERVICE_EMAIL;
      const name = process.env.EVALUATION_SERVICE_NAME;
      const rollNo = process.env.EVALUATION_SERVICE_ROLLNO;
      const mobileNo = process.env.EVALUATION_SERVICE_MOBILENO;
      const githubUsername = process.env.EVALUATION_SERVICE_GITHUB_USERNAME;

      if (!email || !name || !rollNo || !mobileNo || !githubUsername) {
        await Log("backend", "error", "config", "missing registration env vars for /register");
        throw new Error(
          "Missing registration env vars. Required: EVALUATION_SERVICE_EMAIL, EVALUATION_SERVICE_NAME, EVALUATION_SERVICE_ROLLNO, EVALUATION_SERVICE_MOBILENO, EVALUATION_SERVICE_GITHUB_USERNAME."
        );
      }

      const { clientId, clientSecret } = await registerClient({
        accessCode,
        email,
        name,
        rollNo,
        mobileNo,
        githubUsername,
      });
      process.stdout.write("\n=== Registration Successful ===\n\n");
      process.stdout.write("Save these now (cannot be retrieved again):\n");
      process.stdout.write(`EVALUATION_SERVICE_CLIENT_ID=${clientId}\n`);
      process.stdout.write(`EVALUATION_SERVICE_CLIENT_SECRET=${clientSecret}\n\n`);
      process.stdout.write("Next: set EVALUATION_SERVICE_TOKEN if your prompt provides a token endpoint,\n");
      process.stdout.write("or retry `npm start` with Basic auth env vars above if supported.\n\n");
    }

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
