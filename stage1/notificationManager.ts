import { logEvent } from "../logging-middleware/logClient";

type Notification = {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
};

// weight: Placement=3, Result=2, Event=1
const typeWeights: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const parseTimestamp = (tsString: string): Date => {
  return new Date(tsString);
};

const calculateScore = (notification: Notification): number => {
  const typeWeight = typeWeights[notification.Type] || 0;
  const timestamp = parseTimestamp(notification.Timestamp);
  const now = new Date();
  const ageMs = now.getTime() - timestamp.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // recency score: newer = higher
  // decay: -0.1 per hour old
  const recencyScore = Math.max(0, 10 - ageHours * 0.1);

  const totalScore = typeWeight * 100 + recencyScore;
  return totalScore;
};

export const getTopNotifications = (
  notifications: Notification[],
  topN: number = 10
): Notification[] => {
  logEvent("backend", "debug", "utils", `calculating top ${topN} from ${notifications.length} notifications`);

  const scored = notifications.map((n) => ({
    notification: n,
    score: calculateScore(n),
  }));

  scored.sort((a, b) => b.score - a.score);

  const result = scored.slice(0, topN).map((s) => s.notification);

  logEvent("backend", "info", "utils", `top ${topN} notifications computed successfully`);

  return result;
};

export const maintainTopN = (
  currentTop: Notification[],
  newNotification: Notification,
  topN: number = 10
): Notification[] => {
  logEvent("backend", "debug", "utils", `new notification received: ${newNotification.ID}`);

  if (currentTop.length < topN) {
    currentTop.push(newNotification);
    currentTop.sort((a, b) => calculateScore(b) - calculateScore(a));
    logEvent("backend", "debug", "utils", `added to top ${topN}, current size: ${currentTop.length}`);
    return currentTop;
  }

  const newScore = calculateScore(newNotification);
  const lowestScore = calculateScore(currentTop[currentTop.length - 1]);

  if (newScore > lowestScore) {
    currentTop.pop();
    currentTop.push(newNotification);
    currentTop.sort((a, b) => calculateScore(b) - calculateScore(a));
    logEvent("backend", "debug", "utils", `replaced lowest score, new score: ${newScore}`);
  } else {
    logEvent("backend", "debug", "utils", `new notification score too low: ${newScore}, skipped`);
  }

  return currentTop;
};
