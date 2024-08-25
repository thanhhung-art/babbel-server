export interface ICreateMessageInRoom {
  content: string;
  userId: string;
  roomId: string;
  files?: string[];
}

export interface ICreateMessageInConversation {
  content: string;
  userId: string;
  conversationId: string;
  files?: string[];
}
