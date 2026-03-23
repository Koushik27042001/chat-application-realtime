const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "chat-app",
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error("❌ MongoDB Error:", error.message);
        throw error; // ❗ don't exit here, let server handle it
    }
};

module.exports = connectDB;