import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prismaService: PrismaService,
  ) {}

  async clearStore(): Promise<void> {
    await this.cacheService.store.reset();
  }

  async clearCacheByKey(key: string): Promise<void> {
    await this.cacheService.del(key);
  }

  async clearCachesByKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.cacheService.del(key);
    }
  }
}
