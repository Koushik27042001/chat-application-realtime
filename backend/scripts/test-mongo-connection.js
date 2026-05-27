/**
 * Usage: node scripts/test-mongo-connection.js
 * Loads ../.env and attempts mongoose connect (no secrets printed).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { applyMongoDnsFromEnv } = require("../config/mongoDns");
applyMongoDnsFromEnv();

const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  console.log("Attempting mongoose.connect with MONGO_URI (password hidden)...");
  try {
    await mongoose.connect(uri, {
      dbName: "chat-app",
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 5,
    });
    console.log("SUCCESS — MongoDB connected:", mongoose.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("FAILED —", err.message);
    if (err.message && err.message.includes("bad auth")) {
      console.error(
        "\n→ Fix: Atlas → Database Access → reset password for this user.\n" +
          "→ Put the new password in MONGO_URI (encode @ as %40).\n" +
          "→ Username in URI must exactly match the Atlas database user."
      );
    }
    if (/\bquerySrv\b/.test(err.message || "")) {
      console.error(
        "\n→ Fix: Node SRV DNS failed. Add to backend/.env:\n" +
          "   MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1\n" +
          "   (or change Windows DNS; or use Atlas non-SRV / standard URI in MONGO_URI.)"
      );
    }
    process.exit(1);
  }
}

main();
