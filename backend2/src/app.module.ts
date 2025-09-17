import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './configuration';
import { OrderModule } from './modules/order/order.module';
import { getDbConfig } from './orm.config';
// removed ClientsModule here; provided in OrderModule

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDbConfig(configService),
    }),
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
