import { BadRequestException, Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(
    private readonly awsService: AwsService,
    private readonly prismaService: PrismaService,
  ) {}

  concatChunks(chunks: ArrayBuffer[]): ArrayBuffer {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new BadRequestException('Chunks array is invalid or empty');
    }
    const totalLength = chunks.reduce((acc, chunk) => {
      if (!(chunk instanceof ArrayBuffer)) {
        throw new BadRequestException('Chunk is not an ArrayBuffer');
      }
      return acc + chunk.byteLength;
    }, 0);

    if (isNaN(totalLength) || totalLength < 0) {
      throw new BadRequestException('Total length calculation failed');
    }
    const combinedBuffer = Buffer.alloc(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
      const bufferChunk = Buffer.from(chunk);
      bufferChunk.copy(combinedBuffer, offset);
      offset += bufferChunk.length;
    });

    return combinedBuffer;
  }

  concatBuffer(buffers: Buffer[]) {
    if (buffers.includes(undefined)) {
      throw new BadRequestException('Buffer array is invalid or empty');
    }
    return Buffer.concat(buffers);
  }

  async uploadFile(buffer: Buffer, fileName: string, type: string) {
    const url = await this.awsService.uploadFIleToS3(buffer, fileName, type);
    // save file to db
    const file = await this.prismaService.files.create({
      data: {
        url,
        name: fileName,
        type,
      },
    });

    return file.id;
  }
}
