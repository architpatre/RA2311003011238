# Notification System Design

React + TypeScript frontend with logging middleware.

## Architecture

- `notification_app_fe/`
  - React + TypeScript
  - notification UI
  - log client integration

- `notification_app_be/`
  - backend placeholder

- `logging-middleware/`
  - reusable log client

## Logging

Use the interface:

```ts
Log(stack, level, package, message);
```

Accepted values:

- `stack`: `frontend` | `backend`
- `level`: `debug` | `info` | `warn` | `error` | `fatal`
- `package`: `api`, `component`, `hook`, `page`, `state`, `style`, `auth`, `config`, `middleware`, `utils`

Logs are posted to `http://20.207.122.201/evaluation-service/logs`.

## Folder Structure

- `logging-middleware/`
  - `README.md`
  - `logClient.ts`

- `notification_app_fe/`
  - `package.json`
  - `tsconfig.json`
  - `vite.config.ts`
  - `src/`
    - `App.tsx`
    - `main.tsx`
    - `utils/logClient.ts`
    - `hooks/useNotifications.ts`
    - `components/NotificationCard.tsx`

- `notification_app_be/`
  - `README.md`
  - `index.js`

- `stage1/`
  - `index.ts` — API fetch and main entry
  - `notificationManager.ts` — priority algorithm
  - `mockData.ts` — mock notifications for testing
  - `test.ts` — validation tests
  - `package.json` — dependencies
  - `tsconfig.json`

## Stage 1

### Priority Inbox: Top 10 Notifications

**Problem:** Users lose track due to high volume. Solution: display top 10 most important unread notifications first.

**Priority Calculation:**

- Type weight: Placement=3, Result=2, Event=1
- Recency: newer notifications score higher
- Formula: `totalScore = (typeWeight * 100) + recencyScore`
- Recency decays at 0.1 per hour: `recencyScore = max(0, 10 - hoursOld * 0.1)`

**Algorithm:**

1. Fetch all notifications from API
2. Calculate score for each notification
3. Maintain a min-heap of size 10 while scanning
4. Convert heap to array and sort descending for display

**Efficient Top-N Maintenance:**
When new notifications arrive continuously:

- Keep a min-heap of size N (root is the current lowest priority in the top list)
- If heap size < N, push the new notification
- If heap is full, compare new score with root; replace root only if higher
- Display list is derived by sorting the heap snapshot descending
- Time complexity: O(M log N) for batch (M notifications), O(log N) per incremental insert

**Implementation:**

- `getTopNotifications()` — batch processing for initial top 10
- `maintainTopN()` — incremental update as new notifications arrive
- All operations logged via middleware with package types: `api`, `utils`, `config`

**Running:**

- `cd stage1 && npm start`
- If the notifications API responds `401`, you need credentials for the protected route.
- Register once (prints `clientId`/`clientSecret` to terminal): `EVALUATION_SERVICE_ACCESS_CODE=... npm start`
- Registration also requires: `EVALUATION_SERVICE_EMAIL`, `EVALUATION_SERVICE_NAME`, `EVALUATION_SERVICE_ROLLNO`, `EVALUATION_SERVICE_MOBILENO`, `EVALUATION_SERVICE_GITHUB_USERNAME`.
- Then retry with either:
  - `EVALUATION_SERVICE_TOKEN=... npm start` (if you have a token endpoint), or
  - `EVALUATION_SERVICE_CLIENT_ID=... EVALUATION_SERVICE_CLIENT_SECRET=... npm start` (if Basic auth is supported).
