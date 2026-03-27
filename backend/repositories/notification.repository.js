const Notification = require("../models/Notification");

const create = (data) => Notification.create(data);

const findByUser = (userId, { page = 0, limit = 20 } = {}) =>
  Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .lean();

const countUnread = (userId) => Notification.countDocuments({ userId, isRead: false });

const markRead = (userId, notificationId) =>
  Notification.updateOne({ _id: notificationId, userId }, { $set: { isRead: true } });

const markAllRead = (userId) =>
  Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

module.exports = {
  create,
  findByUser,
  countUnread,
  markRead,
  markAllRead,
};
