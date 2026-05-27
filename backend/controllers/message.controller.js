const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { sendMessageService, getMessagesService, markConversationReadService } = require("../services/message.service");

const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res
      .status(400)
      .json(new ApiResponse(400, "receiverId and content are required"));
  }

  const result = await sendMessageService(req.user.id, receiverId, content);

  res.status(201).json(
    new ApiResponse(201, "Message sent", result)
  );
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId, page = 0, limit = 20 } = req.query;

  if (!conversationId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "conversationId is required"));
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid conversationId"));
  }

  const messages = await getMessagesService(conversationId, Number(page), Number(limit));

  res.status(200).json(
    new ApiResponse(200, "Messages retrieved", messages)
  );
});

const markMessagesRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.body || {};

  if (!conversationId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "conversationId is required"));
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid conversationId"));
  }

  try {
    await markConversationReadService(req.user.id, conversationId);
    return res
      .status(200)
      .json(new ApiResponse(200, "Messages marked as read", { conversationId }));
  } catch (error) {
    const code = error.statusCode || 500;
    return res
      .status(code)
      .json(new ApiResponse(code, error.message || "Failed to mark messages as read"));
  }
});

module.exports = {
  sendMessage,
  getMessages,
  markMessagesRead,
};
