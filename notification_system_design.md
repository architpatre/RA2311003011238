# Notification System Design

## Overview
This repository contains a frontend-focused notification application designed for the pre-test assignment. The implementation will use React with TypeScript, Material UI for styling, and a reusable logging middleware that sends lifecycle logs to the evaluation server.

## Architecture

- `notification_app_fe/`
  - React + TypeScript application
  - UI components for registering and managing notifications
  - Logging middleware integrated via a reusable API client

- `notification_app_be/`
  - Backend placeholder for a future notification service
  - Designed to support registration, notifications, and logging

- `logging-middleware/`
  - Reusable middleware implementation for log creation
  - Portable between frontend and backend contexts

## Logging Design

The logging middleware is built around the following interface:

```ts
Log(stack, level, package, message)
```

All log calls must use lowercase values and one of the accepted categories.

### Example log usage

- `Log("frontend", "info", "api", "Notification request sent to backend")`
- `Log("frontend", "warn", "component", "User submitted invalid payload")`
- `Log("frontend", "error", "hook", "Failed to fetch notification templates")`

## Frontend Flow

1. User opens the notification dashboard
2. User submits a new notification or registers
3. The app sends a request to the backend/service
4. Each meaningful event logs through the logging middleware
5. Logs are posted to `http://20.207.122.201/evaluation-service/logs`

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

## Deployment Notes

- Use `npm install` inside `notification_app_fe/`
- Use `npm run dev` to start the app
- `node notification_app_be/index.js` can be used as a placeholder backend server

## Compliance

- No personal name or Affordmed references appear in this repository
- `.gitignore` contains `node_modules/`
- The repo name remains `RA2311003011238`
