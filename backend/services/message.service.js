const conversationRepository = require("../repositories/conversation.repository");
const messageRepository = require("../repositories/message.repository");

const sendMessageService = async (senderId, receiverId, content) => {
  let conversation = await conversationRepository.findByParticipants([senderId, receiverId]);

  if (!conversation) {
    conversation = await conversationRepository.create({
      participants: [senderId, receiverId],
      unreadCounts: {},
    });
  }

  const message = await messageRepository.create({
    conversationId: conversation._id,
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
    status: "sent",
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageText = content;
  conversation.lastMessageAt = new Date();

  const receiverKey = receiverId.toString();
  const count = conversation.unreadCounts?.get(receiverKey) || 0;
  conversation.unreadCounts = conversation.unreadCounts || new Map();
  conversation.unreadCounts.set(receiverKey, count + 1);

  await conversationRepository.save(conversation);

  return { message, conversation };
};

const getMessagesService = async (conversationId, page = 0, limit = 20) => {
  const messages = await messageRepository.findByConversation(conversationId, {
    page,
    limit,
  });
  return messages.reverse();
};

module.exports = {
  sendMessageService,
  getMessagesService,
};
