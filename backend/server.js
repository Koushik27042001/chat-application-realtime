require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const allowedOrigins = require("./config/allowedOrigins");
const connectDB = require("./config/db");
const { initFirebaseAdmin } = require("./firebaseAdmin");
const initializeSocket = require("./socket/socket");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

initializeSocket(io);

const PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRIES = 10;

const listenOnPort = (preferredPort) =>
  new Promise((resolve, reject) => {
    let attempts = 0;
    let activePort = preferredPort;

    const tryListen = () => {
      const onError = (error) => {
        server.off("listening", onListening);

        if (error.code === "EADDRINUSE" && attempts < MAX_PORT_RETRIES) {
          attempts += 1;
          activePort += 1;
          console.warn(
            `Port ${activePort - 1} is already in use. Retrying on port ${activePort}...`
          );
          setImmediate(tryListen);
          return;
        }

        reject(error);
      };

      const onListening = () => {
        server.off("error", onError);
        resolve(activePort);
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(activePort, "0.0.0.0");
    };

    tryListen();
  });

const startServer = async () => {
  try {
    initFirebaseAdmin();
    console.log("Connecting to MongoDB...");
    await connectDB();

    const activePort = await listenOnPort(PORT);
    console.log(`Server running on port ${activePort}`);
  } catch (error) {
    console.error("Server failed:", error.message);
    process.exit(1);
  }
};

startServer();
