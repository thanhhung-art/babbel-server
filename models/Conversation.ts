import { Schema, model } from "mongoose";

const ConversationSchema = new Schema({
  content: [
    {
      userId: String,
      message: String,
      time: String,
      image: String,
      likes: [String]
    },
  ],
  users: Array,
}, {
  timestamps: true
});

const Conversation = model("Conversation", ConversationSchema);

export default Conversation;
