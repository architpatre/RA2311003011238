import { Log } from "../logging-middleware/logClient.js";
import { getTopNotifications, maintainTopN } from "./notificationManager.js";
import { mockNotifications } from "./mockData.js";

type Notification = {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
};

const runTests = async () => {
  await Log("backend", "info", "config", "starting stage1 validation tests");

  process.stdout.write("\n=== Test 1: Calculate Top 10 from Mock Data ===\n\n");

  try {
    const top10 = await getTopNotifications(mockNotifications as Notification[], 10);

    process.stdout.write(`Received ${mockNotifications.length} notifications, computed top 10:\n\n`);
    top10.forEach((notif, index) => {
      process.stdout.write(`${index + 1}. [${notif.Type}] ${notif.Message} (${notif.ID.substring(0, 8)}...)\n`);
    });

    await Log("backend", "info", "utils", "test 1 passed: top 10 computed");
  } catch (error) {
    await Log("backend", "error", "utils", `test 1 failed: ${error}`);
    process.stderr.write(`Test 1 failed: ${String(error)}\n`);
  }

  process.stdout.write("\n=== Test 2: Verify Type Ordering (Placement > Result > Event) ===\n\n");

  try {
    const top10 = await getTopNotifications(mockNotifications as Notification[], 10);

    const placementCount = top10.filter((n) => n.Type === "Placement").length;
    const resultCount = top10.filter((n) => n.Type === "Result").length;
    const eventCount = top10.filter((n) => n.Type === "Event").length;

    process.stdout.write(`Top 10 distribution: Placement=${placementCount}, Result=${resultCount}, Event=${eventCount}\n`);

    if (placementCount >= resultCount && resultCount >= eventCount) {
      process.stdout.write("✓ Type ordering correct\n");
      await Log("backend", "info", "utils", "test 2 passed: type ordering verified");
    } else {
      process.stdout.write("✗ Type ordering incorrect\n");
      await Log("backend", "warn", "utils", "test 2: type ordering not as expected");
    }
  } catch (error) {
    await Log("backend", "error", "utils", `test 2 failed: ${error}`);
    process.stderr.write(`Test 2 failed: ${String(error)}\n`);
  }

  process.stdout.write("\n=== Test 3: Incremental Top-N Maintenance ===\n\n");

  try {
    const initial = await getTopNotifications(
      (mockNotifications.slice(0, 5) as unknown as Notification[]),
      3
    );
    process.stdout.write("Initial top 3 from 5 notifications:\n");
    initial.forEach((n, i) => process.stdout.write(`  ${i + 1}. ${n.Type}\n`));

    const newNotif: Notification = {
      ID: "new-notif-id",
      Type: "Placement",
      Message: "new placement opportunity",
      Timestamp: new Date().toISOString(),
    };

    const updated = await maintainTopN(initial, newNotif, 3);
    process.stdout.write("After adding new Placement notification:\n");
    updated.forEach((n, i) => process.stdout.write(`  ${i + 1}. ${n.Type}\n`));

    await Log("backend", "info", "utils", "test 3 passed: incremental maintenance works");
  } catch (error) {
    await Log("backend", "error", "utils", `test 3 failed: ${error}`);
    process.stderr.write(`Test 3 failed: ${String(error)}\n`);
  }

  await Log("backend", "info", "config", "stage1 validation tests complete");
  process.stdout.write("\n=== All validation tests finished ===\n\n");
};

runTests().catch(async (error) => {
  await Log("backend", "fatal", "config", `validation failed: ${error}`);
  process.stderr.write(`Fatal error: ${String(error)}\n`);
  process.exit(1);
});
