import Notification from "./notification.model.js";

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const getNotificationsByUser = async (userId) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, isRead: false });
};

export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
