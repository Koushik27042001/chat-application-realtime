require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { initFirebaseAdmin } = require("./firebaseAdmin");
const initializeSocket = require("./socket/socket");

const allowedOrigin =
  process.env.CLIENT_URL ||
  "https://chat-application-realtime-ruddy.vercel.app";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    initFirebaseAdmin();
    console.log("Connecting to MongoDB...");
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed:", error.message);
    process.exit(1);
  }
};

startServer();
