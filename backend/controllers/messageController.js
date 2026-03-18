const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "receiverId and content are required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
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

    return res.status(201).json({ conversation, message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId query param is required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
