const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("private-message", ({ receiverId, message }) => {
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", message);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = initializeSocket;
