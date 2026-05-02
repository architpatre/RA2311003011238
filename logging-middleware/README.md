# Logging Middleware

This folder contains the reusable logging middleware design and implementation for the frontend notification app.

## Purpose

- Capture meaningful lifecycle events
- Send logs to the evaluation service
- Support frontend-specific log packages and levels

## Usage

Import and call `logEvent` from the frontend app:

```ts
import { logEvent } from "../notification_app_fe/src/utils/logClient";

logEvent("frontend", "info", "component", "User clicked the notification submit button.");
```

## Accepted values

- `stack`: `frontend` | `backend`
- `level`: `debug` | `info` | `warn` | `error` | `fatal`
- `package`: `api`, `component`, `hook`, `page`, `state`, `style`, `auth`, `config`, `middleware`, `utils`
