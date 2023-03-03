import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: String,
    friends: [ String ],
    friendreq: [ String ],
    roomJoined: [ String ],
    notification: [
      {
        msg: String,
        senderId: String,
        time: String,
        unread: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

export default User;
