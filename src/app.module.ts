import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { db_config } from '../orm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';

@Module({
  imports: [TypeOrmModule.forRoot(db_config), ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
