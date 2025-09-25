import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        useFactory: () => ({
          transport: Transport.REDIS,
          options: {
            host: 'localhost',
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
            retryAttempts: 10,
            retryDelay: 2000,
          }
        }),
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
