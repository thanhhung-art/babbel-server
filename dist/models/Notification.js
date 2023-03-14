"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: String,
    notifications: [
        {
            msg: String,
            time: String,
        }
    ]
});
const Notification = (0, mongoose_1.model)("Conversation", NotificationSchema);
exports.default = Notification;
