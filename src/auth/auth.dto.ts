import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UserDto {
  email: string;
  name: string;
  id: string;
  avatar: string;
  createdAt: Date;
  updateAt: Date;
  FriendRequest: {
    id: string;
    userId: string;
    friendId: string;
    createdAt: Date;
    udpateAt: Date;
  }[];
}
