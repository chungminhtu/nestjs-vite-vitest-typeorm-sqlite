import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject('PRODUCT_SERVICE')
    private productClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(order);

    // Send message to product service to update stock
    console.log('📤 Sending order_created event:', {
      productId: createOrderDto.productId,
      quantity: createOrderDto.quantity,
      orderId: savedOrder.id,
    });

    this.productClient.emit('order_created', {
      productId: createOrderDto.productId,
      quantity: createOrderDto.quantity,
      orderId: savedOrder.id,
    });

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne({ where: { id } });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }
}
