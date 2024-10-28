import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KickUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class AcceptRequestDto extends KickUserDto {}
export class RejectRequestDto extends KickUserDto {}
export class BanUserDto extends KickUserDto {}

export class UpdateRoomDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  isPublic: boolean;
}
