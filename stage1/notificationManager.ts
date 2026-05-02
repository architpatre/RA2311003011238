import { Log } from "../logging-middleware/logClient.js";

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

type ScoredNotification = { notification: Notification; score: number };

class MinHeap {
  private data: ScoredNotification[] = [];

  size() {
    return this.data.length;
  }

  peek() {
    return this.data[0] ?? null;
  }

  push(item: ScoredNotification) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    const root = this.data[0]!;
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  replaceRoot(item: ScoredNotification) {
    if (this.data.length === 0) {
      this.data.push(item);
      return;
    }
    this.data[0] = item;
    this.bubbleDown(0);
  }

  toArray() {
    return this.data.slice();
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.data[parentIndex]!.score <= this.data[index]!.score) break;
      [this.data[parentIndex], this.data[index]] = [this.data[index]!, this.data[parentIndex]!];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    const length = this.data.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.data[left]!.score < this.data[smallest]!.score) {
        smallest = left;
      }
      if (right < length && this.data[right]!.score < this.data[smallest]!.score) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.data[index], this.data[smallest]] = [this.data[smallest]!, this.data[index]!];
      index = smallest;
    }
  }
}

export const getTopNotifications = async (
  notifications: Notification[],
  topN: number = 10
): Promise<Notification[]> => {
  await Log("backend", "debug", "utils", `calculating top ${topN} from ${notifications.length} notifications`);

  const heap = new MinHeap();
  for (const notification of notifications) {
    const score = calculateScore(notification);
    if (heap.size() < topN) {
      heap.push({ notification, score });
      continue;
    }

    const lowest = heap.peek();
    if (lowest && score > lowest.score) {
      heap.replaceRoot({ notification, score });
    }
  }

  const result = heap
    .toArray()
    .sort((a, b) => b.score - a.score)
    .map((s) => s.notification);

  await Log("backend", "info", "utils", `top ${topN} notifications computed successfully`);

  return result;
};

export const maintainTopN = async (
  currentTop: Notification[],
  newNotification: Notification,
  topN: number = 10
): Promise<Notification[]> => {
  await Log("backend", "debug", "utils", `new notification received: ${newNotification.ID}`);

  const heap = new MinHeap();
  for (const existing of currentTop) {
    heap.push({ notification: existing, score: calculateScore(existing) });
  }

  const newScore = calculateScore(newNotification);
  if (heap.size() < topN) {
    heap.push({ notification: newNotification, score: newScore });
    await Log("backend", "debug", "utils", `added to top ${topN}, current size: ${heap.size()}`);
  } else {
    const lowest = heap.peek();
    if (lowest && newScore > lowest.score) {
      heap.replaceRoot({ notification: newNotification, score: newScore });
      await Log("backend", "debug", "utils", `replaced lowest score, new score: ${newScore}`);
    } else {
      await Log("backend", "debug", "utils", `new notification score too low: ${newScore}, skipped`);
    }
  }

  return heap
    .toArray()
    .sort((a, b) => b.score - a.score)
    .map((s) => s.notification);
};
