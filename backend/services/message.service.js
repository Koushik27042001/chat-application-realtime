const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
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

const markConversationReadService = async (readerId, conversationId) => {
  const convId = mongoose.Types.ObjectId.isValid(conversationId)
    ? new mongoose.Types.ObjectId(conversationId)
    : null;
  if (!convId) {
    const error = new Error("Invalid conversationId");
    error.statusCode = 400;
    throw error;
  }

  const conversation = await conversationRepository.findById(conversationId, "participants unreadCounts");

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const readerStr = String(readerId);
  const isParticipant = (conversation.participants || []).some(
    (p) => String(p) === readerStr || String(p?._id) === readerStr
  );
  if (!isParticipant) {
    const error = new Error("Not a participant");
    error.statusCode = 403;
    throw error;
  }

  await messageRepository.markAsSeenForReceiver(convId, readerId);

  const convDoc = await Conversation.findById(convId);
  if (convDoc) {
    convDoc.unreadCounts = convDoc.unreadCounts || new Map();
    convDoc.unreadCounts.set(readerStr, 0);
    await convDoc.save();
  }

  return { conversationId: String(convId) };
};

module.exports = {
  sendMessageService,
  getMessagesService,
  markConversationReadService,
};
