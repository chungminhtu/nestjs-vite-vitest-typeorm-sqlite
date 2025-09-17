import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisMemoryServer } from 'redis-memory-server';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisServer: RedisMemoryServer;
  private redisPort: number;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    console.log('🔧 RedisService onModuleInit called');
    const useMockRedis = this.configService.get<boolean>('redis.use_mock_redis');
    console.log('🔧 useMockRedis:', useMockRedis);

    if (useMockRedis) {
      console.log('🚀 Starting Redis Memory Server...');
      // Use random port for isolation
      this.redisServer = new RedisMemoryServer();

      try {
        // Start the Redis server explicitly
        await this.redisServer.start();
        this.redisPort = await this.redisServer.getPort();
        const host = await this.redisServer.getHost();
        console.log(`📡 Redis Memory Server running at ${host}:${this.redisPort}`);

        // Wait for the server to be ready
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('Failed to start Redis Memory Server:', error);
        this.redisPort = undefined as any;
      }
    } else {
      console.log('🔧 Using external Redis, not starting Redis Memory Server');
      this.redisPort = this.configService.get<number>('redis.port');
    }
  }

  async onModuleDestroy() {
    if (this.redisServer) {
      console.log('🛑 Stopping Redis Memory Server...');
      await this.redisServer.stop();
    }
  }

  // No port-killing in test mode; each run uses isolated random port

  getRedisConfig() {
    const useMockRedis = this.configService.get<boolean>('redis.use_mock_redis');

    if (useMockRedis && this.redisServer && this.redisPort) {
      console.log(`🔧 Using Redis Memory Server port: ${this.redisPort}`);
      return {
        host: '127.0.0.1',
        port: this.redisPort,
      };
    }

    // In test mode, use the configured test port
    const testPort = this.configService.get<number>('redis.port') || 6379;
    console.log(`🔧 Using Redis port: ${testPort}`);
    return {
      host: this.configService.get<string>('redis.host') || '127.0.0.1',
      port: testPort,
    };
  }
}
