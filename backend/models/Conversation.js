const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, ],

    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },

    // 🔥 NEW (IMPORTANT OPTIMIZATION)
    lastMessageText: {
        type: String,
        default: "",
    },

    lastMessageAt: {
        type: Date,
        default: Date.now,
    },

    // 🔥 unread messages count per user
    unreadCounts: {
        type: Map,
        of: Number,
        default: {},
    },

    // 🔥 for future (group chats)
    isGroup: {
        type: Boolean,
        default: false,
    },

    groupName: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});

// 🔥 INDEXES (VERY IMPORTANT)
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);