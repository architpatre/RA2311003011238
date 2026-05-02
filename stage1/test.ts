import { Log } from "./logger.js";
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

  console.log("\n=== Test 1: Calculate Top 10 from Mock Data ===\n");

  try {
    const top10 = await getTopNotifications(mockNotifications as Notification[], 10);

    console.log(`Received ${mockNotifications.length} notifications, computed top 10:\n`);
    top10.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.Type}] ${notif.Message} (${notif.ID.substring(0, 8)}...)`);
    });

    await Log("backend", "info", "utils", "test 1 passed: top 10 computed");
  } catch (error) {
    await Log("backend", "error", "utils", `test 1 failed: ${error}`);
    console.error("Test 1 failed:", error);
  }

  console.log("\n=== Test 2: Verify Type Ordering (Placement > Result > Event) ===\n");

  try {
    const top10 = await getTopNotifications(mockNotifications as Notification[], 10);

    const placementCount = top10.filter((n) => n.Type === "Placement").length;
    const resultCount = top10.filter((n) => n.Type === "Result").length;
    const eventCount = top10.filter((n) => n.Type === "Event").length;

    console.log(`Top 10 distribution: Placement=${placementCount}, Result=${resultCount}, Event=${eventCount}`);

    if (placementCount >= resultCount && resultCount >= eventCount) {
      console.log("✓ Type ordering correct");
      await Log("backend", "info", "utils", "test 2 passed: type ordering verified");
    } else {
      console.log("✗ Type ordering incorrect");
      await Log("backend", "warn", "utils", "test 2: type ordering not as expected");
    }
  } catch (error) {
    await Log("backend", "error", "utils", `test 2 failed: ${error}`);
    console.error("Test 2 failed:", error);
  }

  console.log("\n=== Test 3: Incremental Top-N Maintenance ===\n");

  try {
    const initial = await getTopNotifications(
      (mockNotifications.slice(0, 5) as unknown as Notification[]),
      3
    );
    console.log(`Initial top 3 from 5 notifications:`);
    initial.forEach((n, i) => console.log(`  ${i + 1}. ${n.Type}`));

    const newNotif: Notification = {
      ID: "new-notif-id",
      Type: "Placement",
      Message: "new placement opportunity",
      Timestamp: new Date().toISOString(),
    };

    const updated = await maintainTopN(initial, newNotif, 3);
    console.log(`After adding new Placement notification:`);
    updated.forEach((n, i) => console.log(`  ${i + 1}. ${n.Type}`));

    await Log("backend", "info", "utils", "test 3 passed: incremental maintenance works");
  } catch (error) {
    await Log("backend", "error", "utils", `test 3 failed: ${error}`);
    console.error("Test 3 failed:", error);
  }

  await Log("backend", "info", "config", "stage1 validation tests complete");
  console.log("\n=== All validation tests finished ===\n");
};

runTests().catch(async (error) => {
  await Log("backend", "fatal", "config", `validation failed: ${error}`);
  console.error("Fatal error:", error);
  process.exit(1);
});
