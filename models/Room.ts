import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
  roomMasterId: String,
  name: String,
  avatar: String,
  joinRequest: [ String ],
  banned: [ String ],
  members: [ String ],
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

const Room = model("Room", RoomSchema);

export default Room;
