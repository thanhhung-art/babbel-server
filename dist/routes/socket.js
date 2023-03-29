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
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const query_1 = require("../utils/query");
const users_online = [];
const socketHandler = (io, socket) => {
    socket.on("user_connected", (id) => {
        const userIndex = users_online.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            users_online.push({ id, socketId: socket.id });
        }
        else {
            users_online[userIndex] = { id, socketId: socket.id };
        }
        io.emit("users_online", users_online);
    });
    socket.on("private_message", ({ _id, message, receiverId, time, image, }, callback) => __awaiter(void 0, void 0, void 0, function* () {
        let temp_image = "";
        if (image) {
            const resultUploadImage = yield (0, query_1.uploadImage)(image).catch((error) => console.log(error));
            (0, query_1.addMessageToDB)(_id, socket.data._id, message, time, resultUploadImage.secure_url);
            temp_image = resultUploadImage.secure_url;
            callback(resultUploadImage.secure_url);
        }
        else {
            (0, query_1.addMessageToDB)(_id, socket.data._id, message, time);
        }
        const receiver = users_online.find((user) => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("private_message", {
                _id,
                message,
                from: socket.data._id,
                time,
                image: temp_image
            });
        }
    }));
    socket.on("room_message", ({ message, _id, senderId, time, image }) => __awaiter(void 0, void 0, void 0, function* () {
        let temp_image = "";
        if (image) {
            const resultUploadImage = yield (0, query_1.uploadImage)(image).catch((err) => console.log(err));
            temp_image = resultUploadImage.secure_url;
        }
        (0, query_1.groupChatUpdate)(_id, senderId, message, time, temp_image);
        io.to(_id).emit("room_message", {
            message,
            _id,
            senderId: socket.data._id,
            time,
            image: temp_image,
        });
    }));
    socket.on("friend_request", (receiverId) => {
        const receiver = users_online.find((user) => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("friend_request", socket.data._id);
        }
        (0, query_1.addFriendReq)(socket.data._id, receiverId);
    });
    socket.on("accept_friend_request", (receiverId) => {
        const receiver = users_online.find((user) => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("accept_friend_request", socket.data._id);
        }
        (0, query_1.acceptRequest)(socket.data._id, receiverId);
    });
    socket.on("decline_friend_request", (receiverId) => {
        const receiver = users_online.find(user => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("decline_friend_request", socket.data._id);
        }
        (0, query_1.declineRequest)(socket.data._id, receiverId);
    });
    socket.on("join_room", (roomId, prevRoomId) => {
        socket.join(roomId);
        socket.leave(prevRoomId);
    });
    socket.on("leave_room", (roomId, message) => {
        io.to(roomId).emit("leave_room", socket.data._id, message);
        socket.leave(roomId);
        (0, query_1.leaveRoom)(socket.data._id, roomId, message);
    });
    socket.on("join_room_request", (roomId) => {
        io.to(roomId).emit("join_room_request", socket.data._id, roomId);
        (0, query_1.sendRequestToRoom)(socket.data._id, roomId);
    });
    socket.on("accept_join_room_request", ({ userId, roomId, message }) => {
        const receiver = users_online.find((user) => user.id === userId);
        if (receiver) {
            io.to(receiver.socketId).emit("accept_join_room_request", roomId);
            io.to(roomId).emit("someone_join_room", roomId, message);
        }
        (0, query_1.sendJoinMessageToRoom)(roomId, message);
        (0, query_1.addUserToRoom)(roomId, userId);
    });
    socket.on("decline_join_room_request", ({ userId, roomId }) => {
        (0, query_1.declineRequestJoinRoom)(userId, roomId);
    });
    socket.on('push_the_user_out_of_the_room', (roomId, userId) => {
        io.to(roomId).emit('push_the_user_out_of_the_room', roomId, userId);
        (0, query_1.deleteTheUserInTheRoom)(roomId, userId);
    });
    socket.on("delete_room", (roomId) => {
        (0, query_1.deleteRoom)(socket.data._id, roomId);
    });
    socket.on("edit_user_info", ({ email, name, password, image, }, callback) => __awaiter(void 0, void 0, void 0, function* () {
        if (image) {
            const resultUploadImage = yield (0, query_1.uploadImage)(image).catch((err) => console.log(err));
            yield (0, query_1.handleUpdateUserInfo)(socket.data._id, name, email, password, resultUploadImage.secure_url);
            callback({ success: true, image_url: resultUploadImage });
        }
        else {
            (0, query_1.handleUpdateUserInfo)(socket.data._id, name, email, password);
            callback({ success: true });
        }
    }));
    socket.on("delete_personal_message", ({ id, time, receiverId, }) => {
        const otherUser = users_online.find((user) => user.id === receiverId);
        if (otherUser)
            io.to(otherUser.socketId).emit("delete_personal_message", id, time);
        (0, query_1.deletePersonalMessage)(id, time, socket.data._id, receiverId);
    });
    socket.on("delete_room_message", ({ roomId, id, time, }) => {
        if (roomId)
            (0, query_1.deleteRoomMessage)(roomId, id, time);
        io.to(roomId).emit("delete_room_message", id);
    });
    socket.on("typing_a_message_in_personal_chat", ({ currConversationId, receiverId }) => {
        const receiver = users_online.find(user => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("a_user_typing_a_message", currConversationId);
        }
    });
    socket.on("typing_a_message_in_room_chat", ({ currConversationId, roomId }) => {
        socket.to(roomId).emit("a_user_typing_a_message", currConversationId);
    });
    socket.on("stop_typing_in_personal_chat", ({ currConversationId, receiverId }) => {
        const receiver = users_online.find(user => user.id === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("a_user_stop_typing", currConversationId);
        }
    });
    socket.on("stop_typing_in_room_chat", ({ currConversationId, roomId }) => {
        socket.to(roomId).emit("a_user_stop_typing", currConversationId);
    });
    socket.on("edit_room_info", (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.image) {
            let result = yield (0, query_1.uploadImage)(data.image);
            yield (0, query_1.handleUpdateRoom)(data.id, data.name, result);
            callback("success");
        }
    }));
    socket.on("unfriend", ({ sender, receiver }) => {
        const temp = users_online.find(user => user.id === receiver);
        if (temp) {
            io.to(temp.socketId).emit("unfriend", sender);
        }
        (0, query_1.unfriend)(sender, receiver);
    });
    socket.on("like_message", (currConversationId, userId, messageId, otherId) => {
        if (otherId) {
            const receiver = users_online.find(user => user.id === otherId);
            if (receiver)
                io.to(receiver.socketId).emit("like_message", currConversationId, messageId, userId);
        }
        else {
            io.to(currConversationId).emit("like_message", currConversationId, messageId, userId);
        }
        (0, query_1.likeMessage)(currConversationId, userId, messageId, otherId);
    });
    socket.on("dont_like_message", (currConversationId, userId, messageId, otherId) => {
        if (otherId) {
            const receiver = users_online.find(user => user.id === otherId);
            if (receiver)
                io.to(receiver.socketId).emit("dont_like_message", currConversationId, userId, messageId);
        }
        else {
            io.to(currConversationId).emit("dont_like_message", currConversationId, userId, messageId);
        }
        (0, query_1.dontLikeMessage)(currConversationId, userId, messageId, otherId);
    });
    socket.on("disconnect", () => {
        const userIndex = users_online.findIndex((user) => user.id === socket.data._id);
        users_online.splice(userIndex, 1);
        io.emit("users_online", users_online);
    });
};
exports.socketHandler = socketHandler;
