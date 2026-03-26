const Conversation = require("../models/Conversation");

const findByParticipants = (participantIds) =>
  Conversation.findOne({ participants: { $all: participantIds } });

const create = (data) => Conversation.create(data);

const findById = (id, projection = "_id participants lastMessage updatedAt") =>
  Conversation.findById(id).select(projection).lean();

const findByParticipantsSelect = (participantIds, projection) =>
  Conversation.findOne({ participants: { $all: participantIds } })
    .select(projection);

const findManyByParticipant = (userId) =>
  Conversation.find({ participants: userId })
    .populate("participants", "_id name email avatar")
    .sort({ lastMessageAt: -1 })
    .lean();

const save = (conversation) => conversation.save();

module.exports = {
  findByParticipants,
  create,
  findById,
  findByParticipantsSelect,
  findManyByParticipant,
  save,
};
