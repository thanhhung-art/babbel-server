import Conversation from "../models/Conversation";
import Room from "../models/Room";
import User from "../models/User";
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function addFriendReq(userId: string, reveiverId: string) {
  await User.findByIdAndUpdate(reveiverId, {
    $addToSet: { friendreq: userId },
  });
}

export async function addMessageToDB(
  conversationId: string,
  userId: string,
  message: string,
  time: string,
  image?: string,
  likes?: string[]
) {
  const dataSaved: {
    userId?: string;
    message?: string;
    time?: string;
    image?: string;
  } = { userId, time, message };
  if (image) dataSaved.image = image;

  await Conversation.findByIdAndUpdate(conversationId, {
    $addToSet: { content: dataSaved },
  });
}

export async function acceptRequest(userId: string, receiverId: string) {
  await User.findByIdAndUpdate(receiverId, {
    $addToSet: { friends: userId },
  });
  await User.findByIdAndUpdate(userId, {
    $addToSet: { friends: receiverId },
  });
  await User.findByIdAndUpdate(userId, {
    $pull: { friendreq: receiverId },
  });
}

export async function declineRequest(userId: string, receiverId: string) {
  await User.findByIdAndUpdate(userId, {
    $pull: { friendreq: receiverId },
  });
}

export async function handleUpdateUserInfo(
  id: string,
  name: string,
  email: string,
  password: string,
  image?: string
) {
  const data = {} as {
    name: string;
    email: string;
    password: string;
    avatar: string;
  };

  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = password;
  if (image) data.avatar = image;

  await User.findByIdAndUpdate(id, data);
}

export async function handleUpdateRoom(id: string, name: string, image: any) {
  if (image && name) {
    await Room.findByIdAndUpdate(id, { name, avatar: image.secure_url });
  } else if (image) {
    await Room.findByIdAndUpdate(id, { avatar: image.secure_url });
  }
}

export function uploadImage(image: Buffer | string) {
  return cloudinary.uploader.upload(
    image,
    { width: "0.10", crop: "scale" },
    (err: any, result: any) => {
      return result ? result : err;
    }
  );
}

export async function deletePersonalMessage(
  _id: string,
  time: string,
  userId: string,
  otherId: string
) {
  if (_id) {
    await Conversation.updateOne(
      { users: { $all: [userId, otherId] } },
      { $pull: { content: { _id } } }
    );
  } else {
    await Conversation.updateOne(
      { users: { $all: [userId, otherId] } },
      { $pull: { content: { time } } }
    );
  }
}

export async function deleteRoomMessage(
  roomId: string,
  messageId: string,
  time: string
) {
  if (messageId) {
    await Room.findByIdAndUpdate(roomId, {
      $pull: { content: { _id: messageId } },
    });
  } else {
    await Room.findByIdAndUpdate(roomId, {
      $pull: { content: { time } },
    });
  }
}

export async function privateChatUpdate(
  receiverId: string,
  senderId: string,
  message: string
) {
  await Conversation.findOneAndUpdate(
    { users: { $all: [senderId, receiverId] } },
    { $addToSet: { content: { userId: senderId, message } } }
  );
}

export async function groupChatUpdate(
  roomId: string,
  senderId: string,
  message: string,
  time: string,
  image?: string,
) {
  const data = {} as Message
  data.userId = senderId
  data.time = time
  data.message = message
  image && (data.image = image)

  await Room.findByIdAndUpdate(roomId, {
    $addToSet: { content: data },
  });
}

export async function sendRequestToRoom(userId: string, roomId: string) {
  await Room.findByIdAndUpdate(roomId, {
    $addToSet: { joinRequest: userId },
  });
}

export async function declineRequestJoinRoom(userId: string, roomId: string) {
  await Room.findByIdAndUpdate(roomId, {
    $pull: { joinRequest: userId },
  });
}

export async function addUserToRoom(roomId: string, userId: string) {
  await Room.findByIdAndUpdate(roomId, {
    $addToSet: { members: userId },
    $pull: { joinRequest: userId },
  });
}

export async function sendJoinMessageToRoom(roomId: string, message: Message) {
  await Room.findByIdAndUpdate(roomId, {
    $push: { content: message },
  });
}

export async function unfriend(sender: string, receiver: string) {
  await User.findByIdAndUpdate(sender, { $pull: { friends: receiver } });
  await User.findByIdAndUpdate(receiver, { $pull: { friends: sender } });
}

export async function leaveRoom(
  userId: string,
  roomId: string,
  message: Message
) {
  await Room.findByIdAndUpdate(roomId, {
    $pull: { members: userId },
    $push: { content: message },
  });
}

export async function deleteRoom(userId: string, roomId: string) {
  const room = await Room.findById(roomId);
  if (room?.roomMasterId === userId) {
    await Room.findByIdAndDelete(roomId);
  }
}

export async function deleteTheUserInTheRoom(roomId: string, userId: string) {
  await Room.findByIdAndUpdate(roomId, {
    $pull: { members: userId },
  });
}

export async function likeMessage(
  conversationId: string,
  userId: string,
  messageId: string,
  otherId: string,
) {
  // in personal chat
  if (otherId) {
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: {
          "content.$[element].likes": userId,
        }
      },
      { arrayFilters: [{ "element._id": messageId }] }
    );
  } else {
    // in room chat
    await Room.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: {
          "content.$[element].likes": userId,
        }
      },
      { arrayFilters: [{ "element._id": messageId }]}
    )
  }
}

export async function dontLikeMessage (
  conversationId: string,
  userId: string,
  messageId: string,
  otherId: string,
) {
  if (otherId) {
    // in personal chat
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          "content.$[element].likes": userId,
        }
      }, {
        arrayFilters: [{ "element._id": messageId }]
      }
    )
  } else {
    // in room chat
    await Room.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          "content.$[element].likes": userId,
        }
      }, {
        arrayFilters: [{ "element._id": messageId }]
      }
    )
  }
}

export async function getMessage() {}
