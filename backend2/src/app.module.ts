import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostResponseInterceptor } from './common/handlers/post-response.interceptor';
import configuration from './configuration';
import { OrderModule } from './modules/order/order.module';
import { db_config } from './orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...db_config }),
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PostResponseInterceptor,
    },
  ],
})
export class AppModule {}
