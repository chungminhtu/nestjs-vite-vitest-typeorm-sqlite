import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the review',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'ID of the product being reviewed',
    example: 1
  })
  productId: number;

  @ApiProperty({
    description: 'Name of the reviewer',
    example: 'John Doe'
  })
  reviewerName: string;

  @ApiPropertyOptional({
    description: 'Rating from 1 to 5 stars',
    example: 4
  })
  rating?: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great product, highly recommended!'
  })
  comment: string;

  @ApiProperty({
    description: 'When the review was created',
    example: '2025-01-15T10:30:00Z'
  })
  createdAt: Date;
}
