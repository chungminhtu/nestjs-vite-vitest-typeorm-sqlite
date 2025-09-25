import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'iPhone 17 Air',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @ApiProperty({
    description: 'Detailed description of the product',
    example: 'Latest iPhone model with advanced features',
    minLength: 1
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Stock quantity (optional)',
    example: 100,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
