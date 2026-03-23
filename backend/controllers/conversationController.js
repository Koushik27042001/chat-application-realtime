const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");

const getConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
    }).select("_id participants lastMessage updatedAt");

    if (!conversation) {
      return res.status(200).json({ conversationId: null });
    }

    return res.status(200).json({
      conversationId: conversation._id.toString(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversationWithUser,
};
