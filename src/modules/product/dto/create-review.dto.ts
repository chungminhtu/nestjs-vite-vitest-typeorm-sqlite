import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID of the product being reviewed',
    example: 1
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Name of the reviewer',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  reviewerName: string;

  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great product, highly recommended!'
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
