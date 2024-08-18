export interface IRoom {
  id: string;
  name: string;
  avatar: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRoom {
  name: string;
  avatar: string;
  userId: string;
}
