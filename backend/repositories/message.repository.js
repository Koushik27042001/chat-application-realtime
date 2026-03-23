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

module.exports = {
  create,
  findByConversation,
};
