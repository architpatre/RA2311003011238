import { Card, CardContent, Typography } from "@mui/material";

type Notification = {
  id: string;
  message: string;
  timestamp: string;
};

const NotificationCard = ({ notification }: { notification: Notification }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="subtitle1">{notification.message}</Typography>
      <Typography variant="caption" color="text.secondary">
        {notification.timestamp}
      </Typography>
    </CardContent>
  </Card>
);

export default NotificationCard;
