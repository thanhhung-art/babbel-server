import { IsNotEmpty, IsString } from 'class-validator';

export class FileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  chunkIndex: string;

  @IsNotEmpty()
  @IsString()
  totalChunks: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  size: string;
}
