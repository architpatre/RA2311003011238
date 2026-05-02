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
3. Sort by score descending
4. Take top 10

**Efficient Top-N Maintenance:**
When new notifications arrive continuously:
- If heap size < N, add notification and re-sort
- If heap size = N, compare new notification score with the lowest score in heap
- If new score > lowest, remove lowest and add new notification
- Otherwise, skip
- Time complexity: O(N log N) for initial sort, O(log N) per new notification

**Implementation:**
- `getTopNotifications()` — batch processing for initial top 10
- `maintainTopN()` — incremental update as new notifications arrive
- All operations logged via middleware with package types: `api`, `utils`, `config`
