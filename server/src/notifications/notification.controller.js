import * as service from "./notification.service.js";

export const myNotifications = async (req, res) => {
  const notis = await service.getMyNotifications(req.user);
  res.json(notis);
};

export const markRead = async (req, res) => {
  try {
    const noti = await service.markAsRead(req.params.id, req.user);
    res.json(noti);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
