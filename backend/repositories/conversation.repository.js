const Conversation = require("../models/Conversation");

const findByParticipants = (participantIds) =>
  Conversation.findOne({
    isGroup: false,
    participants: { $all: participantIds },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });

const create = (data) => Conversation.create(data);

const findById = (id, projection = "_id participants lastMessage updatedAt") =>
  Conversation.findById(id).select(projection).lean();

const findByParticipantsSelect = (participantIds, projection) =>
  Conversation.findOne({
    isGroup: false,
    participants: { $all: participantIds },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  })
    .select(projection);

const findManyByParticipant = (userId) =>
  Conversation.find({ participants: userId })
    .populate("participants", "_id name email avatar")
    .populate("groupAdmin", "_id name")
    .sort({ lastMessageAt: -1 })
    .lean();

const save = (conversation) => conversation.save();

// 🔥 GROUP OPERATIONS
const createGroup = (groupData) => Conversation.create(groupData);

const findGroupById = (groupId) =>
  Conversation.findById(groupId)
    .populate("participants", "_id name email avatar")
    .populate("groupAdmin", "_id name");

const addGroupMember = async (groupId, userId) => {
  const conversation = await Conversation.findById(groupId);
  if (conversation && !conversation.participants.includes(userId)) {
    conversation.participants.push(userId);
    return conversation.save();
  }
  return conversation;
};

const removeGroupMember = async (groupId, userId) => {
  const conversation = await Conversation.findById(groupId);
  if (conversation) {
    conversation.participants = conversation.participants.filter(
      (id) => String(id) !== String(userId)
    );
    return conversation.save();
  }
  return conversation;
};

const updateGroupInfo = async (groupId, groupData) => {
  return Conversation.findByIdAndUpdate(groupId, groupData, {
    new: true,
    runValidators: true,
  }).populate("participants", "_id name email avatar");
};

module.exports = {
  findByParticipants,
  create,
  findById,
  findByParticipantsSelect,
  findManyByParticipant,
  save,
  createGroup,
  findGroupById,
  addGroupMember,
  removeGroupMember,
  updateGroupInfo,
};
