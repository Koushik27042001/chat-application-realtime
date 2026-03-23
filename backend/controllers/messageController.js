const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const normalizeMessage = (message) => ({
  id: message._id,
  _id: message._id,
  senderId: message.senderId?.toString?.() || message.senderId,
  receiverId: message.receiverId?.toString?.() || message.receiverId,
  text: message.text,
  sender: message.senderId?.toString?.() || message.senderId,
  receiver: message.receiverId?.toString?.() || message.receiverId,
  content: message.text,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, content } = req.body;
    const messageText = text || content;

    if (!receiverId || !messageText) {
      return res
        .status(400)
        .json({ message: "receiverId and text are required" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: messageText,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        lastMessage: message._id,
      });
    } else {
      conversation.lastMessage = message._id;
      await conversation.save();
    }

    return res.status(201).json({
      conversation,
      message: normalizeMessage(message),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages.map(normalizeMessage));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
