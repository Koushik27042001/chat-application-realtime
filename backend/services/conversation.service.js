const mongoose = require("mongoose");
const conversationRepository = require("../repositories/conversation.repository");

const { createDefaultAvatar } = require("../utils/avatar");

const listMyConversationsService = async (currentUserId) => {
  const conversations = await conversationRepository.findManyByParticipant(currentUserId);

  return conversations
    .map((conversation) => {
      const otherParticipant = (conversation.participants || []).find(
        (participant) => String(participant._id) !== String(currentUserId)
      );

      if (!otherParticipant) {
        return null;
      }

      return {
        id: otherParticipant._id.toString(),
        name: otherParticipant.name,
        email: otherParticipant.email,
        avatar: otherParticipant.avatar || createDefaultAvatar(otherParticipant.name),
        conversationId: conversation._id.toString(),
        lastMessage: conversation.lastMessageText || "Tap to start chatting.",
        lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
      };
    })
    .filter(Boolean);
};

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
  listMyConversationsService,
  getConversationWithUserService,
};
