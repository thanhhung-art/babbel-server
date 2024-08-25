export interface ICreateMessage {
  content: string;
  userId: string;
  roomId: string;
  files?: string[];
}
