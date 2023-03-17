import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import {
  acceptRequest,
  addFriendReq,
  addMessageToDB,
  addUserToRoom,
  declineRequest,
  declineRequestJoinRoom,
  deletePersonalMessage,
  deleteRoom,
  deleteRoomMessage,
  deleteTheUserInTheRoom,
  dontLikeMessage,
  groupChatUpdate,
  handleUpdateRoom,
  handleUpdateUserInfo,
  leaveRoom,
  likeMessage,
  sendJoinMessageToRoom,
  sendRequestToRoom,
  unfriend,
  uploadImage,
} from "../utils/query";

const users_online: { id: string; socketId: string }[] = [];

export const socketHandler = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, User>,
  socket: Socket
) => {
  socket.on("user_connected", (id: string) => {
    const userIndex = users_online.findIndex((user) => user.id === id);
    console.log(id + " " + Date.now());
    if (userIndex === -1) {
      users_online.push({ id, socketId: socket.id });
    } else {
      users_online[userIndex] = { id, socketId: socket.id };
    }
    io.emit("users_online", users_online);
  });

  socket.on(
    "private_message",
    async ({
      _id,
      message,
      receiverId,
      time,
      image,
    }: {
      _id: string;
      message: string;
      receiverId: string;
      time: string;
      image: Buffer | string;
    }, callback: Function) => {
      let temp_image = "";
      if (image) {
        const resultUploadImage = await uploadImage(image).catch((error: any) => console.log(error))
        addMessageToDB(_id, socket.data._id, message, time, resultUploadImage.secure_url)
        temp_image = resultUploadImage.secure_url
        callback(resultUploadImage.secure_url)
      } else {
        addMessageToDB(_id, socket.data._id, message, time)
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
    }
  );

  socket.on(
    "room_message",
    async ({
      message,
      _id,
      senderId,
      time,
      image
    }: {
      message: string;
      _id: string;
      senderId: string;
      time: string;
      image: string;
    }) => {
      let temp_image = ""
      if (image) {
        const resultUploadImage = await uploadImage(image).catch((err: any) => console.log(err))
        temp_image = resultUploadImage.secure_url
      }
      groupChatUpdate(_id, senderId, message, time, temp_image);
      io.to(_id).emit("room_message", {
        message,
        _id,
        senderId: socket.data._id,
        time,
        image: temp_image,
      });
    }
  );

  socket.on("friend_request", (receiverId: string) => {
    const receiver = users_online.find((user) => user.id === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("friend_request", socket.data._id);
    }
    addFriendReq(socket.data._id, receiverId);
  });

  socket.on("accept_friend_request", (receiverId: string) => {
    const receiver = users_online.find((user) => user.id === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("accept_friend_request", socket.data._id);
    }

    acceptRequest(socket.data._id, receiverId);
  });

  socket.on("decline_friend_request", (receiverId: string) => {
    const receiver = users_online.find(user => user.id === receiverId)
    if (receiver) {
      io.to(receiver.socketId).emit("decline_friend_request", socket.data._id)
    }
    
    declineRequest(socket.data._id, receiverId);
  });

  socket.on("join_room", (roomId: string, prevRoomId: string) => {
    socket.join(roomId);
    socket.leave(prevRoomId)
  });

  socket.on("leave_room", (roomId: string, message: { userId: string, message: string, time: string }) => {
    io.to(roomId).emit("leave_room", socket.data._id, message)
    socket.leave(roomId)
    leaveRoom(socket.data._id, roomId, message)
  })

  socket.on("join_room_request", (roomId: string) => {
    io.to(roomId).emit("join_room_request", socket.data._id, roomId );
    sendRequestToRoom(socket.data._id, roomId);
  });

  socket.on(
    "accept_join_room_request",
    ({ userId, roomId, message }: { userId: string; roomId: string; message: Message }) => {
      const receiver = users_online.find((user) => user.id === userId);
      if (receiver) {
        io.to(receiver.socketId).emit("accept_join_room_request", roomId )
        io.to(roomId).emit("someone_join_room", roomId , message);
      }
      sendJoinMessageToRoom(roomId, message)
      addUserToRoom(roomId, userId);
    }
  );

  socket.on(
    "decline_join_room_request",
    ({ userId, roomId}: { userId: string, roomId: string }) => {
      declineRequestJoinRoom(userId, roomId)
    }
  )

  socket.on(
    'push_the_user_out_of_the_room',
    (roomId: string, userId: string) => {
      io.to(roomId).emit('push_the_user_out_of_the_room', roomId, userId)

      deleteTheUserInTheRoom(roomId, userId)
    }
  )

  socket.on("delete_room", (roomId: string) => {
    deleteRoom(socket.data._id, roomId)
  })

  socket.on(
    "edit_user_info",
    async (
      {
        email,
        name,
        password,
        image,
      }: {
        email: string;
        name: string;
        password: string;
        image: string;
      },
      callback: Function
    ) => {
      if (image) {
        const resultUploadImage = await uploadImage(image).catch((err: any) => console.log(err))
        await handleUpdateUserInfo(
          socket.data._id,
          name,
          email,
          password,
          resultUploadImage.secure_url
        );
        callback({ success: true, image_url: resultUploadImage});
      } else {
        handleUpdateUserInfo(socket.data._id, name, email, password);
        callback({ success: true });
      }
    }
  );

  socket.on(
    "delete_personal_message",
    ({
      id,
      time,
      receiverId,
    }: {
      id: string;
      time: string;
      receiverId: string;
    }) => {
      const otherUser = users_online.find((user) => user.id === receiverId);
      if (otherUser)
      io.to(otherUser.socketId).emit("delete_personal_message", id, time );
      deletePersonalMessage(id, time, socket.data._id, receiverId);
    }
  );

  socket.on(
    "delete_room_message",
    ({
      roomId,
      id,
      time,
    }: {
      roomId: string;
      id: string;
      time: string;
    }) => {
      if (roomId) deleteRoomMessage(roomId, id, time);
      io.to(roomId).emit("delete_room_message", id );
    }
  );

  socket.on(
    "typing_a_message_in_personal_chat",
    ({ currConversationId, receiverId }: { currConversationId: string; receiverId: string }) => {
      const receiver = users_online.find(user => user.id === receiverId)
      if (receiver) {
        io.to(receiver.socketId).emit("a_user_typing_a_message", currConversationId )
      }
    }
  )

  socket.on(
    "typing_a_message_in_room_chat",
    ({ currConversationId, roomId }: { currConversationId: string, roomId: string }) => {
      socket.to(roomId).emit("a_user_typing_a_message", currConversationId)
    }
  )

  socket.on(
    "stop_typing_in_personal_chat",
    ({ currConversationId, receiverId }: { currConversationId: string; receiverId: string }) => {
      const receiver = users_online.find(user => user.id === receiverId)
      if (receiver) {
        io.to(receiver.socketId).emit("a_user_stop_typing", currConversationId )
      }
    }
  )

  socket.on(
    "stop_typing_in_room_chat",
    ({ currConversationId, roomId }: { currConversationId: string, roomId: string }) => {
      socket.to(roomId).emit("a_user_stop_typing", currConversationId )
    }
  )

  socket.on(
    "edit_room_info",
    async (data: { id: string, name: string, image: string }, callback: Function) => {
      if (data.image) {
        let result = await uploadImage(data.image)
        await handleUpdateRoom(data.id, data.name, result )
        callback("success")
      }
    }
  )

  socket.on(
    "unfriend",
    ({ sender, receiver } : { sender: string; receiver: string }) => {
      const temp = users_online.find(user => user.id === receiver)
      if (temp) {
        io.to(temp.socketId).emit("unfriend", sender )
      }
      unfriend(sender, receiver)
      
    }
  )

  socket.on(
    "like_message",
    (currConversationId: string, userId: string, messageId: string, otherId: string) => {
      if (otherId) {
        const receiver = users_online.find(user => user.id === otherId)
        if (receiver) io.to(receiver.socketId).emit("like_message", currConversationId, messageId, userId)
      } else {
        io.to(currConversationId).emit("like_message", currConversationId, messageId, userId)
      }

      likeMessage(currConversationId, userId, messageId, otherId)
    }
  )

  socket.on(
    "dont_like_message",
    (currConversationId: string, userId: string, messageId: string, otherId: string) => {
      if (otherId) {
        const receiver = users_online.find(user => user.id === otherId)
        if (receiver) io.to(receiver.socketId).emit("dont_like_message", currConversationId, userId, messageId)
      }
      dontLikeMessage(currConversationId, userId, messageId, otherId)
    }
  )

  socket.on("disconnect", () => {
    const userIndex = users_online.findIndex(
      (user) => user.id === socket.data._id
    );
    users_online.splice(userIndex, 1);
    io.emit("users_online", users_online);
  });
};