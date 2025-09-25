import { Injectable } from '@nestjs/common';
import { RedisMemoryServer } from 'redis-memory-server';

@Injectable()
export class RedisService {
  private redisServer: RedisMemoryServer | null = null;

  async ensureRedisServer(): Promise<void> {
    if (this.redisServer) {
      return;
    }
    try {
      this.redisServer = new RedisMemoryServer();
      await this.redisServer.start();
      const actualPort = await this.redisServer.getPort();
      process.env.REDIS_PORT = actualPort.toString();
      console.log(`📡 Redis Memory Server running at 127.0.0.1:${actualPort}`);
    } catch (error) {
      console.error('❌ Failed to start Redis Memory Server:', error.stack);
      throw error;
    }
  }


  async getRedisConfig() {
    const port = this.redisServer ? await this.redisServer.getPort() : 6379;
    console.log('🔍 Redis config - host: 127.0.0.1, port:', port);
    return {
      host: '127.0.0.1',
      port: port,
    };
  }

}
