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
Log(stack, level, package, message)
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
