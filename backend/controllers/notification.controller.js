const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const notificationRepository = require("../repositories/notification.repository");

const getNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 0);
  const limit = Number(req.query.limit ?? 20);

  const [items, unreadCount] = await Promise.all([
    notificationRepository.findByUser(req.user.id, { page, limit }),
    notificationRepository.countUnread(req.user.id),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Notifications retrieved", {
      items,
      unreadCount,
    })
  );
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, "Invalid notification id"));
  }

  await notificationRepository.markRead(req.user.id, id);

  res.status(200).json(new ApiResponse(200, "Notification marked as read"));
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationRepository.markAllRead(req.user.id);

  res.status(200).json(new ApiResponse(200, "Notifications marked as read"));
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
};
