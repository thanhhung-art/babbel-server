"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    avatar: String,
    friends: [String],
    friendreq: [String],
    roomJoined: [String],
    loginWithGG: Boolean,
    ggId: String,
    notification: [
        {
            msg: String,
            senderId: String,
            time: String,
            unread: Boolean,
        },
    ],
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
