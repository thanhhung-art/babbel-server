import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomCacheInterceptor } from './CustomCacheInterceptor';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new CacheableMemory({
              ttl: 6000,
              lruSize: 5000,
            }),
          }),
          createKeyv(configService.get('REDIS_URL', 'redis://localhost:6379')),
        ],
      }),
    }),
  ],
  exports: [CacheService, NestCacheModule],
  providers: [
    CacheService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor,
    },
  ],
})
export class CacheModule {}
