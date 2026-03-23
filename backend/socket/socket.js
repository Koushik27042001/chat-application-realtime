const onlineUsers = new Map();

const emitOnlineUsers = (io) => {
  io.emit("online-users", Array.from(onlineUsers.keys()));
};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const registerUser = (userId) => {
      if (!userId) {
        return;
      }

      onlineUsers.set(userId, socket.id);
      emitOnlineUsers(io);
    };

    socket.on("addUser", registerUser);
    socket.on("join", registerUser);

    const relayMessage = (payload) => {
      const receiverId = payload.receiverId;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (!receiverSocketId) {
        return;
      }

      const outgoingMessage = payload.message || {
        senderId: payload.senderId,
        receiverId: payload.receiverId,
        text: payload.text || payload.content,
        sender: payload.senderId,
        receiver: payload.receiverId,
        content: payload.text || payload.content,
        createdAt: new Date().toISOString(),
      };

      io.to(receiverSocketId).emit("getMessage", outgoingMessage);
      io.to(receiverSocketId).emit("receive-message", outgoingMessage);
    };

    socket.on("sendMessage", relayMessage);
    socket.on("private-message", relayMessage);

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      console.log("User disconnected:", socket.id);
      emitOnlineUsers(io);
    });
  });
};

module.exports = socketHandler;
