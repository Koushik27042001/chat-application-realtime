const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { getConversationWithUserService } = require("../services/conversation.service");

const getConversationWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid user id"));
  }

  const result = await getConversationWithUserService(req.user.id, userId);

  res.status(200).json(
    new ApiResponse(200, "Conversation retrieved", result)
  );
});

module.exports = {
  getConversationWithUser,
};
