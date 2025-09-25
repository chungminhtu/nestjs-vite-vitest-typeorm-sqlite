import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'The name of the product (optional for updates)',
    example: 'iPhone 15 Pro Max',
    minLength: 1
  })
  product_name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the product (optional for updates)',
    example: 'Updated iPhone model with enhanced features',
    minLength: 1
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Stock quantity (optional for updates)',
    example: 150,
    minimum: 0
  })
  stock?: number;
}
