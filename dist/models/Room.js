"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoomSchema = new mongoose_1.Schema({
    roomMasterId: String,
    name: String,
    avatar: String,
    joinRequest: [String],
    banned: [String],
    members: [String],
    content: [
        {
            userId: String,
            message: String,
            time: String,
            image: String,
            likes: [String]
        }
    ]
}, {
    timestamps: true
});
const Room = (0, mongoose_1.model)("Room", RoomSchema);
exports.default = Room;
