# Logging Middleware

Reusable frontend log client.

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
