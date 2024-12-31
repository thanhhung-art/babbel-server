export interface ICreateUser {
  email: string;
  name: string;
  password: string;
}

export interface IDataToUpdate {
  email?: string;
  name?: string;
  avatar?: string;
}
