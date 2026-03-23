const mongoose = require("mongoose");

<<<<<<< HEAD
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
=======
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true, // 🔥 critical for fast queries
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },

    content: {
        type: String,
        required: true,
        trim: true,
    },

    // 🔥 message type (future ready)
    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text",
    },

    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent",
        index: true,
    },
}, {
    timestamps: true,
});

// 🔥 COMPOUND INDEX (VERY IMPORTANT)
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
>>>>>>> 1e7ed06a06e5b054829de5c2a39cbc3fdb71fc19
