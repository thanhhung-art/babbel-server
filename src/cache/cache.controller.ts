import { Controller, Delete } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('cache')
class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Delete()
  async clearCache() {
    await this.cacheService.clearStore();
    return 'Cache cleared';
  }
}

export default CacheController;
