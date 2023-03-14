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
exports.getMessage = exports.dontLikeMessage = exports.likeMessage = exports.deleteTheUserInTheRoom = exports.deleteRoom = exports.leaveRoom = exports.unfriend = exports.sendJoinMessageToRoom = exports.addUserToRoom = exports.declineRequestJoinRoom = exports.sendRequestToRoom = exports.groupChatUpdate = exports.privateChatUpdate = exports.deleteRoomMessage = exports.deletePersonalMessage = exports.uploadImage = exports.handleUpdateRoom = exports.handleUpdateUserInfo = exports.declineRequest = exports.acceptRequest = exports.addMessageToDB = exports.addFriendReq = void 0;
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
function addMessageToDB(conversationId, userId, message, time, image, likes) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataSaved = { userId, time, message };
        if (image)
            dataSaved.image = image;
        yield Conversation_1.default.findByIdAndUpdate(conversationId, {
            $addToSet: { content: dataSaved },
        });
    });
}
exports.addMessageToDB = addMessageToDB;
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
        const data = {};
        if (name)
            data.name = name;
        if (email)
            data.email = email;
        if (password)
            data.password = password;
        if (image)
            data.avatar = image;
        yield User_1.default.findByIdAndUpdate(id, data);
    });
}
exports.handleUpdateUserInfo = handleUpdateUserInfo;
function handleUpdateRoom(id, name, image) {
    return __awaiter(this, void 0, void 0, function* () {
        if (image && name) {
            yield Room_1.default.findByIdAndUpdate(id, { name, avatar: image.secure_url });
        }
        else if (image) {
            yield Room_1.default.findByIdAndUpdate(id, { avatar: image.secure_url });
        }
    });
}
exports.handleUpdateRoom = handleUpdateRoom;
function uploadImage(image) {
    return cloudinary.uploader.upload(image, { width: "0.10", crop: "scale" }, (err, result) => {
        return result ? result : err;
    });
}
exports.uploadImage = uploadImage;
function deletePersonalMessage(_id, time, userId, otherId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_id) {
            yield Conversation_1.default.updateOne({ users: { $all: [userId, otherId] } }, { $pull: { content: { _id } } });
        }
        else {
            yield Conversation_1.default.updateOne({ users: { $all: [userId, otherId] } }, { $pull: { content: { time } } });
        }
    });
}
exports.deletePersonalMessage = deletePersonalMessage;
function deleteRoomMessage(roomId, messageId, time) {
    return __awaiter(this, void 0, void 0, function* () {
        if (messageId) {
            yield Room_1.default.findByIdAndUpdate(roomId, {
                $pull: { content: { _id: messageId } },
            });
        }
        else {
            yield Room_1.default.findByIdAndUpdate(roomId, {
                $pull: { content: { time } },
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
function groupChatUpdate(roomId, senderId, message, time, image) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {};
        data.userId = senderId;
        data.time = time;
        data.message = message;
        image && (data.image = image);
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $addToSet: { content: data },
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
function declineRequestJoinRoom(userId, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $pull: { joinRequest: userId },
        });
    });
}
exports.declineRequestJoinRoom = declineRequestJoinRoom;
function addUserToRoom(roomId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $addToSet: { members: userId },
            $pull: { joinRequest: userId },
        });
    });
}
exports.addUserToRoom = addUserToRoom;
function sendJoinMessageToRoom(roomId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $push: { content: message },
        });
    });
}
exports.sendJoinMessageToRoom = sendJoinMessageToRoom;
function unfriend(sender, receiver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield User_1.default.findByIdAndUpdate(sender, { $pull: { friends: receiver } });
        yield User_1.default.findByIdAndUpdate(receiver, { $pull: { friends: sender } });
    });
}
exports.unfriend = unfriend;
function leaveRoom(userId, roomId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $pull: { members: userId },
            $push: { content: message },
        });
    });
}
exports.leaveRoom = leaveRoom;
function deleteRoom(userId, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield Room_1.default.findById(roomId);
        if ((room === null || room === void 0 ? void 0 : room.roomMasterId) === userId) {
            yield Room_1.default.findByIdAndDelete(roomId);
        }
    });
}
exports.deleteRoom = deleteRoom;
function deleteTheUserInTheRoom(roomId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Room_1.default.findByIdAndUpdate(roomId, {
            $pull: { members: userId },
        });
    });
}
exports.deleteTheUserInTheRoom = deleteTheUserInTheRoom;
function likeMessage(conversationId, userId, messageId, otherId) {
    return __awaiter(this, void 0, void 0, function* () {
        // in personal chat
        if (otherId) {
            yield Conversation_1.default.findByIdAndUpdate(conversationId, {
                $addToSet: {
                    "content.$[element].likes": userId,
                }
            }, { arrayFilters: [{ "element._id": messageId }] });
        }
        else {
            // in room chat
            yield Room_1.default.findByIdAndUpdate(conversationId, {
                $addToSet: {
                    "content.$[element].likes": userId,
                }
            }, { arrayFilters: [{ "element._id": messageId }] });
        }
    });
}
exports.likeMessage = likeMessage;
function dontLikeMessage(conversationId, userId, messageId, otherId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (otherId) {
            // in personal chat
            yield Conversation_1.default.findByIdAndUpdate(conversationId, {
                $pull: {
                    "content.$[element].likes": userId,
                }
            }, {
                arrayFilters: [{ "element._id": messageId }]
            });
        }
        else {
            // in room chat
            yield Room_1.default.findByIdAndUpdate(conversationId, {
                $pull: {
                    "content.$[element].likes": userId,
                }
            }, {
                arrayFilters: [{ "element._id": messageId }]
            });
        }
    });
}
exports.dontLikeMessage = dontLikeMessage;
function getMessage() {
    return __awaiter(this, void 0, void 0, function* () { });
}
exports.getMessage = getMessage;
