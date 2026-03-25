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

        if (process.env.ADMIN_EMAIL) {
            const User = require("../models/User");
            const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
            const result = await User.updateOne(
                { email },
                { $set: { role: "admin" } }
            );
            if (result.matchedCount === 0) {
                console.warn(
                    `ADMIN_EMAIL is set but no user exists with email: ${email}`
                );
            } else {
                console.log(`✅ Admin role synced for ${email}`);
            }
        }

    } catch (error) {
        console.error("❌ MongoDB Error:", error.message);
        throw error; // ❗ don't exit here, let server handle it
    }
};

module.exports = connectDB;