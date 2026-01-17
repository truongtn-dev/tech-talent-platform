import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotificationsByUser(req.user.userId);
    const unreadCount = await notificationService.getUnreadCount(req.user.userId);
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const readNotification = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const readAllNotifications = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
