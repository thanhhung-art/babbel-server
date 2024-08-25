import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileDto } from './file.dto';

@Controller('file')
export class FileController {
  private readonly tempChunks: {
    [key: string]: { chunks: Buffer[]; totalChunks: number; type: string };
  } = {};

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: FileDto,
  ) {
    const { fileName, type, totalChunks } = body;
    if (!this.tempChunks[fileName]) {
      this.tempChunks[fileName] = {
        chunks: [],
        totalChunks: parseInt(totalChunks),
        type,
      };
    }

    this.tempChunks[fileName].chunks[parseInt(body.chunkIndex)] = file.buffer;

    if (
      this.tempChunks[fileName].chunks.length ===
        this.tempChunks[fileName].totalChunks &&
      !this.tempChunks[fileName].chunks.includes(undefined)
    ) {
      const buffer = this.fileService.concatBuffer(
        this.tempChunks[fileName].chunks,
      );

      const fileData = await this.fileService.uploadFile(
        buffer,
        fileName,
        type,
      );

      delete this.tempChunks[fileName];

      return { fileData, status: 'uploaded' };
    }

    return { fileData: '', status: 'uploading' };
  }
}
