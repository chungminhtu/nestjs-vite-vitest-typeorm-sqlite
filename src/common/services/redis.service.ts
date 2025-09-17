import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisMemoryServer } from 'redis-memory-server';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisServer: RedisMemoryServer;
  private redisPort: number;

  constructor(private configService: ConfigService) {}

  // Allow setting dynamic Redis port (useful for e2e tests)
  setRedisPort(port: number) {
    this.redisPort = port;
  }

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

      // Always check environment first, then fall back to existing value or config
      const envPort = process.env.REDIS_PORT;
      if (envPort) {
        this.redisPort = parseInt(envPort, 10);
        console.log(`🔧 Redis port set from env: ${this.redisPort}`);
      } else if (this.redisPort === undefined) {
        this.redisPort = this.configService.get<number>('redis.port');
        console.log(`🔧 Redis port set from config: ${this.redisPort}`);
      } else {
        console.log(`🔧 Redis port already set to: ${this.redisPort}, keeping existing value`);
      }
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

    // If a Redis port has been explicitly set (e.g., from e2e tests), use it
    if (this.redisPort && !useMockRedis) {
      console.log(`🔧 Using explicitly set Redis port: ${this.redisPort}`);
      return {
        host: this.configService.get<string>('redis.host') || '127.0.0.1',
        port: this.redisPort,
      };
    }

    if (useMockRedis && this.redisServer && this.redisPort) {
      console.log(`🔧 Using Redis Memory Server port: ${this.redisPort}`);
      return {
        host: '127.0.0.1',
        port: this.redisPort,
      };
    }

    // Fallback to configured test port
    const testPort = this.configService.get<number>('redis.port') || 6380;
    console.log(`🔧 Using Redis port: ${testPort}`);
    return {
      host: this.configService.get<string>('redis.host') || '127.0.0.1',
      port: testPort,
    };
  }
}
