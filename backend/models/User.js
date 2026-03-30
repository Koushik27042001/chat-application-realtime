const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
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
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: null,
    },
    refreshTokenHash: {
        type: String,
        default: "",
        select: false,
    },
    refreshTokenExpire: {
        type: Date,
        default: null,
        select: false,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    otp: { type: String },
    otpExpire: { type: Date },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
