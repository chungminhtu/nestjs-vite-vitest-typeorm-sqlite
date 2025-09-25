import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostResponseInterceptor } from './common/handlers/post-response.interceptor';
import { RedisService } from './common/services/redis.service';
import configuration from './configuration';
import { ProductModule } from './modules/product/product.module';
import { db_config } from './orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...db_config }),
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PostResponseInterceptor,
    },
  ],
})
export class AppModule {}
