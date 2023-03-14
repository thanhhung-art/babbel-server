"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToRoom = exports.sendRequestToRoom = exports.groupChatUpdate = exports.privateChatUpdate = exports.deleteRoomMessage = exports.deletePersonalMessage = exports.uploadImage = exports.handleUpdateUserInfo = exports.declineRequest = exports.acceptRequest = exports.addFriendReq = void 0;
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Room_1 = __importDefault(require("../models/Room"));
const User_1 = __importDefault(require("../models/User"));
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
function addFriendReq(userId, reveiverId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield User_1.default.findByIdAndUpdate(reveiverId, {
            $addToSet: { friendreq: userId },
        });
    });
}
exports.addFriendReq = addFriendReq;
function acceptRequest(userId, receiverId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield User_1.default.findByIdAndUpdate(receiverId, {
            $addToSet: { friends: userId },
        });
        yield User_1.default.findByIdAndUpdate(userId, {
            $addToSet: { friends: receiverId },
        });
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { friendreq: receiverId },
        });
    });
}
exports.acceptRequest = acceptRequest;
function declineRequest(userId, receiverId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { friendreq: receiverId },
        });
    });
}
exports.declineRequest = declineRequest;
function handleUpdateUserInfo(id, name, email, password, image) {
    return __awaiter(this, void 0, void 0, function* () {
        if (image) {
            yield User_1.default.findByIdAndUpdate(id, { name, email, avatar: image.secure_url });
        }
        else {
            yield User_1.default.findByIdAndUpdate(id, { name, email });
        }
    });
}
exports.handleUpdateUserInfo = handleUpdateUserInfo;
function uploadImage(image) {
    return cloudinary.uploader.upload(image, { width: "0.10", crop: "scale" }, (err, result) => {
        return result ? result : err;
    });
}
exports.uploadImage = uploadImage;
function deletePersonalMessage(_id, content, userId, otherId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_id) {
            yield Conversation_1.default.updateOne({ users: { $all: [userId, otherId] } }, { $pull: { content: { _id } } });
        }
        else {
            yield Conversation_1.default.updateOne({ users: { $all: [userId, otherId] } }, { $pull: { content: { content } } });
        }
    });
}
exports.deletePersonalMessage = deletePersonalMessage;
function deleteRoomMessage(roomId, messageId, messageContent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (messageId) {
            yield Room_1.default.findByIdAndUpdate(roomId, {
                $pull: { content: { _id: messageId } }
            });
        }
        else {
            yield Room_1.default.findByIdAndUpdate(roomId, {
                $pull: { content: { content: messageContent } }
            });
        }
    });
}
exports.deleteRoomMessage = deleteRoomMessage;
function privateChatUpdate(receiverId, senderId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Conversation_1.default.findOneAndUpdate({ users: { $all: [senderId, receiverId] } }, { $addToSet: { content: { userId: senderId, message } } });
    });
}
exports.privateChatUpdate = privateChatUpdate;
function groupChatUpdate(roomId, senderId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $addToSet: { content: { userId: senderId, message } },
        });
    });
}
exports.groupChatUpdate = groupChatUpdate;
function sendRequestToRoom(userId, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $addToSet: { joinRequest: userId },
        });
    });
}
exports.sendRequestToRoom = sendRequestToRoom;
function addUserToRoom(roomId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield User_1.default.findByIdAndUpdate(userId, {
            $addToSet: { roomJoined: roomId },
        });
    });
}
exports.addUserToRoom = addUserToRoom;
