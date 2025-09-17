import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductEventsController {
  constructor(private readonly productService: ProductService) {}

  @EventPattern('order_created')
  async onOrderCreated(@Payload() data: { productId: number; quantity: number; orderId: number }) {
    try {
      const product = await this.productService.findOne(data.productId);
      const newStock = product.stock - data.quantity;
      if (newStock < 0) {
        return;
      }
      await this.productService.update(data.productId, { stock: newStock });
    } catch (error) {
      // minimal: do nothing
    }
  }
}


