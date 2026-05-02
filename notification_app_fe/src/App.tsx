import { useMemo, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import NotificationCard from "./components/NotificationCard";
import { useNotifications } from "./hooks/useNotifications";
import { logEvent } from "./utils/logClient";

const App = () => {
  const { notificationText, setNotificationText, notifications, sendNotification } = useNotifications();
  const [statusMessage, setStatusMessage] = useState("Ready to send notifications.");

  const handleSubmit = async () => {
    logEvent("frontend", "info", "component", "Submit button clicked for notification delivery.");
    setStatusMessage("Sending notification...");

    try {
      await sendNotification(notificationText);
      setStatusMessage("Notification sent successfully.");
      logEvent("frontend", "info", "api", "Notification payload sent successfully.");
    } catch (error) {
      setStatusMessage("Notification send failed. See console for details.");
      logEvent("frontend", "error", "api", `Notification send failed: ${error}`);
    }
  };

  const recentNotifications = useMemo(
    () => notifications.slice().reverse(),
    [notifications]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }} elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notification Demo App
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          This React frontend is designed for the notification pre-test. It includes logging middleware and a UI optimized for desktop and mobile.
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Notification message"
            value={notificationText}
            onChange={(event) => setNotificationText(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Button variant="contained" size="large" onClick={handleSubmit}>
            Send Notification
          </Button>

          <Typography variant="subtitle1">Status: {statusMessage}</Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        {recentNotifications.length ? (
          recentNotifications.map((item) => (
            <NotificationCard key={item.id} notification={item} />
          ))
        ) : (
          <Typography>No notifications have been sent yet.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default App;
