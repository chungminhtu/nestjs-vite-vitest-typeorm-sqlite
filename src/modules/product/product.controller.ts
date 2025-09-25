import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderCreatedMessage } from './dto/order-created.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product } from './entities/product.entity';
import { Review1 } from './entities/review.entity';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('test-route')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiOkResponse({
    description: 'List of all reviews',
    type: [ReviewResponseDto]
  })
  getAllReviews() {
    console.log('getAllReviews called');
    return this.productService.findAllReviews();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: Product
  })
  @ApiBadRequestResponse({ description: 'Invalid product data' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({
    description: 'List of all products',
    type: [Product]
  })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiOkResponse({
    description: 'Product found',
    type: Product
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  findOne(@Param('id') id: string) {
    console.log('findOne called with id:', id);
    const productId = +id;
    if (isNaN(productId) || productId <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    return this.productService.findOne(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: Product
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid data or ID format' })
  @ApiBody({ type: UpdateProductDto })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const productId = +id;
    if (isNaN(productId) || productId <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    return this.productService.update(productId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiNoContentResponse({ description: 'Product deleted successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  remove(@Param('id') id: string) {
    const productId = +id;
    if (isNaN(productId) || productId <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    return this.productService.remove(productId);
  }

  // Review endpoints
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiCreatedResponse({
    description: 'Review created successfully',
    type: Review1
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid review data' })
  @ApiBody({ type: CreateReviewDto })
  createReview(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto) {
    const productId = +id;
    if (isNaN(productId) || productId <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    return this.productService.createReview({ ...createReviewDto, productId });
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiOkResponse({
    description: 'List of reviews for the product',
    type: [ReviewResponseDto]
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getProductReviews(@Param('id') id: string) {
    const productId = +id;
    if (isNaN(productId) || productId <= 0) {
      throw new NotFoundException(`Invalid product ID: ${id}`);
    }
    return this.productService.findReviewsByProduct(productId);
  }

  @Get('reviews/:reviewId')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'reviewId', description: 'Review ID', type: Number })
  @ApiOkResponse({
    description: 'Review found',
    type: ReviewResponseDto
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  getReview(@Param('reviewId') reviewId: string) {
    const reviewIdNum = +reviewId;
    if (isNaN(reviewIdNum) || reviewIdNum <= 0) {
      throw new NotFoundException(`Invalid review ID: ${reviewId}`);
    }
    return this.productService.findOneReview(reviewIdNum);
  }

  @Patch('reviews/:reviewId')
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID', type: Number })
  @ApiOkResponse({
    description: 'Review updated successfully',
    type: ReviewResponseDto
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiBadRequestResponse({ description: 'Invalid review data' })
  @ApiBody({ type: UpdateReviewDto })
  updateReview(@Param('reviewId') reviewId: string, @Body() updateReviewDto: UpdateReviewDto) {
    const reviewIdNum = +reviewId;
    if (isNaN(reviewIdNum) || reviewIdNum <= 0) {
      throw new NotFoundException(`Invalid review ID: ${reviewId}`);
    }
    return this.productService.updateReview(reviewIdNum, updateReviewDto);
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID', type: Number })
  @ApiNoContentResponse({ description: 'Review deleted successfully' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  removeReview(@Param('reviewId') reviewId: string) {
    const reviewIdNum = +reviewId;
    if (isNaN(reviewIdNum) || reviewIdNum <= 0) {
      throw new NotFoundException(`Invalid review ID: ${reviewId}`);
    }
    return this.productService.removeReview(reviewIdNum);
  }

  @MessagePattern('order_created')
  async handleOrderCreated(@Payload() data: OrderCreatedMessage) {
    return this.productService.handleOrderCreated(data);
  }
}
