const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const conversationRepository = require("../repositories/conversation.repository");
const messageRepository = require("../repositories/message.repository");

const normalizeMessageType = (value) => (value === "image" ? "image" : "text");

const serializeMessage = (message) => {
  const doc = typeof message?.toObject === "function" ? message.toObject() : message;
  if (!doc) return doc;
  return {
    ...doc,
    _id: doc._id?.toString?.() || doc._id,
    conversationId: doc.conversationId?.toString?.() || doc.conversationId,
    conversation: doc.conversation?.toString?.() || doc.conversation,
    sender: doc.sender?.toString?.() || doc.sender,
    receiver: doc.receiver?.toString?.() || doc.receiver,
    messageType: doc.messageType || "text",
  };
};

const ensureParticipant = (conversation, userId) =>
  (conversation.participants || []).some(
    (participant) => String(participant) === String(userId) || String(participant?._id) === String(userId)
  );

const sendMessageService = async (
  senderId,
  { receiverId, conversationId, content, messageType = "text" }
) => {
  const type = normalizeMessageType(messageType);
  let conversation;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      const error = new Error("Conversation not found");
      error.statusCode = 404;
      throw error;
    }
    if (!ensureParticipant(conversation, senderId)) {
      const error = new Error("Not a participant in this conversation");
      error.statusCode = 403;
      throw error;
    }
  } else {
    if (!receiverId) {
      const error = new Error("receiverId is required");
      error.statusCode = 400;
      throw error;
    }

    conversation = await conversationRepository.findByParticipants([senderId, receiverId]);
    if (!conversation) {
      conversation = await conversationRepository.create({
        participants: [senderId, receiverId],
        unreadCounts: {},
      });
    }
  }

  const participantIds = (conversation.participants || []).map((p) => String(p));
  const isGroup = Boolean(conversation.isGroup);
  const resolvedReceiverId = isGroup
    ? String(senderId)
    : receiverId ||
      participantIds.find((id) => id !== String(senderId)) ||
      String(senderId);

  const message = await messageRepository.create({
    conversationId: conversation._id,
    conversation: conversation._id,
    sender: senderId,
    receiver: resolvedReceiverId,
    content,
    messageType: type,
    status: "sent",
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageText = type === "image" ? "Photo" : content;
  conversation.lastMessageAt = new Date();
  conversation.unreadCounts = conversation.unreadCounts || new Map();

  for (const participantId of participantIds) {
    if (participantId === String(senderId)) {
      continue;
    }
    const unread = conversation.unreadCounts.get(participantId) || 0;
    conversation.unreadCounts.set(participantId, unread + 1);
  }

  await conversationRepository.save(conversation);

  return {
    message: serializeMessage(message),
    conversation,
    recipientIds: participantIds.filter((id) => id !== String(senderId)),
  };
};

const getMessagesService = async (readerId, conversationId, page = 0, limit = 20) => {
  const conversation = await conversationRepository.findById(
    conversationId,
    "_id participants"
  );

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (!ensureParticipant(conversation, readerId)) {
    const error = new Error("Not a participant");
    error.statusCode = 403;
    throw error;
  }

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

  const conversation = await conversationRepository.findById(
    conversationId,
    "participants unreadCounts isGroup"
  );

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (!ensureParticipant(conversation, readerId)) {
    const error = new Error("Not a participant");
    error.statusCode = 403;
    throw error;
  }

  if (!conversation.isGroup) {
    await messageRepository.markAsSeenForReceiver(convId, readerId);
  }

  const convDoc = await Conversation.findById(convId);
  if (convDoc) {
    convDoc.unreadCounts = convDoc.unreadCounts || new Map();
    convDoc.unreadCounts.set(String(readerId), 0);
    await convDoc.save();
  }

  return { conversationId: String(convId) };
};

module.exports = {
  sendMessageService,
  getMessagesService,
  markConversationReadService,
};
