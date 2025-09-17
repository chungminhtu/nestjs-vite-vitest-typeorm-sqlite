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
      this.redisServer = new RedisMemoryServer();

      try {
        this.redisPort = await this.redisServer.getPort();
        const host = await this.redisServer.getHost();
        console.log(`📡 Redis Memory Server running at ${host}:${this.redisPort}`);

        // Wait for the server to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Failed to start Redis Memory Server:', error);
        // Fallback to configured/default port
        this.redisPort = this.configService.get<number>('redis.port');
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

  getRedisConfig() {
    const useMockRedis = this.configService.get<boolean>('redis.use_mock_redis');

    if (useMockRedis && this.redisServer && this.redisPort) {
      console.log(`🔧 Using Redis Memory Server port: ${this.redisPort}`);
      return {
        host: '127.0.0.1',
        port: this.redisPort,
      };
    }

    console.log(`🔧 Using external Redis port: ${this.configService.get<number>('redis.port')}`);
    return {
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
    };
  }
}
