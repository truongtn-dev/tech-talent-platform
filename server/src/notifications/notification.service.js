import Notification from "./notification.model.js";
import User from "../modules/auth/user.model.js";
import { sendEmail } from "../utils/email.js";

export const notify = async ({ userId, type, title, message }) => {
  const noti = await Notification.create({
    userId,
    type,
    title,
    message,
  });

  const user = await User.findById(userId);
  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
    });
  }

  return noti;
};

export const getMyNotifications = async (user) => {
  return Notification.find({ userId: user.userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (id, user) => {
  const noti = await Notification.findById(id);
  if (!noti || noti.userId.toString() !== user.userId) {
    throw new Error("Not allowed");
  }
  noti.isRead = true;
  return noti.save();
};
