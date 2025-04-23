import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly memoryCache: Cache) {}

  async clearStore(): Promise<void> {
    await this.memoryCache.clear();
  }

  async clearCacheByKey(key: string): Promise<void> {
    await this.memoryCache.del(key);
  }

  async clearCachesByKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.memoryCache.del(key);
    }
  }

  async updateCacheByKey(key: string, value: any): Promise<void> {
    await this.memoryCache.set(key, value);
  }

  async updateCachesByKeys(
    caches: { key: string; value: any }[],
  ): Promise<void> {
    for (const cache of caches) {
      await this.memoryCache.set(cache.key, cache.value);
    }
  }

  async clearRoomCaches(roomId: string): Promise<void> {
    const pattern = `*${roomId}:*`;
    const redisClient = (this.memoryCache.stores[0] as any).client;

    if (redisClient?.keys) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.clearCachesByKeys(keys);
      }
    }
  }
}
