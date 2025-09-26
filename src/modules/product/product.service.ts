import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderCreatedMessage } from './dto/order-created.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product } from './entities/product.entity';
import { Review } from './entities/review.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    if (isNaN(id) || id <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const result = await this.productRepository.update(id, updateProductDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async handleOrderCreated(data: OrderCreatedMessage) {
    try {
      console.log('📥 Received order_created event:', data);
      const product = await this.findOne(data.productId);
      const newStock = product.stock - data.quantity;
      if (newStock < 0) {
        console.warn('⚠️ Insufficient stock for product', data.productId);
        return;
      }
      await this.update(data.productId, { stock: newStock });
      console.log(
        '✅ Stock updated for product',
        data.productId,
        'new stock:',
        newStock,
      );
    } catch (error) {
      console.error('❌ Error updating stock:', error);
    }
  }

  // Reviews CRUD methods
  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    console.log(
      '🔥 Backend createReview called with:',
      JSON.stringify(createReviewDto),
    );
    // Verify product exists using provided productId
    await this.findOne(createReviewDto.productId);
    console.log('✅ Product exists, creating review');

    const review = this.reviewRepository.create(createReviewDto);
    console.log('📝 Review entity created:', review);
    const saved = await this.reviewRepository.save(review);
    console.log('💾 Review saved:', saved);
    return saved;
  }

  async findAllReviews(): Promise<Review[]> {
    return this.reviewRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findReviewsByProduct(productId: number): Promise<Review[]> {
    // Temporary hack: return all reviews for frontend testing (until routing is fixed)
    return this.reviewRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneReview(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async updateReview(
    id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const result = await this.reviewRepository.update(id, updateReviewDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return this.findOneReview(id);
  }

  async removeReview(id: number): Promise<void> {
    const result = await this.reviewRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
  }
}
