import { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
  userId: String,
  notifications: [
    {
      msg: String,
      time: String,
    }
  ]
});

const Notification = model("Conversation", NotificationSchema);

export default Notification;
