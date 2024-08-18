import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
