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
        required: function requirePassword() {
            return !this.firebaseUid;
        },
        minlength: 6,
    },
    firebaseUid: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
    },
    avatar: {
        type: String,
        default: "",
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true,
    },
    lastLogin: {
        type: Date,
        default: null,
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