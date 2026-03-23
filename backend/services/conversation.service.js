const mongoose = require("mongoose");
const conversationRepository = require("../repositories/conversation.repository");

const getConversationWithUserService = async (currentUserId, targetUserId) => {
  const conversation = await conversationRepository.findByParticipantsSelect(
    [currentUserId, targetUserId],
    "_id participants lastMessage updatedAt"
  );

  if (!conversation) {
    return { conversationId: null };
  }

  return {
    conversationId: conversation._id.toString(),
  };
};

module.exports = {
  getConversationWithUserService,
};
