const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true, // 🔥 search optimization
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatar: {
        type: String,
        default: "",
    },

    // 🔥 NEW (important for chat apps)
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: null,
    },

    // Password reset (link-based) - store hashed token, send plain in URL
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // OTP-based reset
    otp: { type: String },
    otpExpire: { type: Date },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);