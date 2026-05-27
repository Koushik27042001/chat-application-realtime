const Message = require("../models/Message");

const create = (data) => Message.create(data);

const findByConversation = (conversationId, options = {}) => {
  const { page = 0, limit = 20 } = options;
  return Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(Number(limit))
    .lean();
};

const markAsSeenForReceiver = (conversationId, receiverId) =>
  Message.updateMany(
    {
      conversationId,
      receiver: receiverId,
      status: { $nin: ["seen"] },
    },
    { $set: { status: "seen" } }
  );

module.exports = {
  create,
  findByConversation,
  markAsSeenForReceiver,
};
