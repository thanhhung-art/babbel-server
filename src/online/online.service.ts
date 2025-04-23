import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OnlineService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly userService: UserService,
  ) {}

  private readonly USER_ONLINE_PREFIX = 'user:online:';
  private readonly DEFAULT_TTL = 86400; // 24 hours in seconds

  async saveUserOnlineStatus(userId: string, socketId: string): Promise<void> {
    if (!userId) return;

    const key = `${this.USER_ONLINE_PREFIX}${userId}`;
    await this.cacheManager.set(key, socketId, this.DEFAULT_TTL);
    console.log(`User ${userId} marked as online`);
  }

  async removeUserOnlineStatus(userId: string): Promise<void> {
    if (!userId) return;

    const key = `${this.USER_ONLINE_PREFIX}${userId}`;
    await this.cacheManager.del(key);
    console.log(`User ${userId} marked as offline`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    if (!userId) return false;

    const key = `${this.USER_ONLINE_PREFIX}${userId}`;
    const result = await this.cacheManager.get(key);
    return !!result;
  }

  async getAllOnlineFriends(
    userId: string,
  ): Promise<{ id: string; socketId: string }[]> {
    if (!userId) return [];

    const friendIds = await this.userService.getFriendIds(userId);

    if (!friendIds || friendIds.length === 0) return [];

    const onlineFriends: { id: string; socketId: string }[] = [];
    for (const friendId of friendIds) {
      const key = `${this.USER_ONLINE_PREFIX}${friendId}`;
      const result = await this.cacheManager.get<string>(key);
      if (result) {
        onlineFriends.push({ id: friendId, socketId: result });
      }
    }

    return onlineFriends;
  }
}
