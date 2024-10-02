import { IsNotEmpty, IsString } from 'class-validator';

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
