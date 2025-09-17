import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductEventsController } from './product.events.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController, ProductEventsController],
  providers: [ProductService],
})
export class ProductModule {}
