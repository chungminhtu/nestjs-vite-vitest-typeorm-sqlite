import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: 1,
    readOnly: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The name of the product',
    example: 'iPhone 15 Pro',
    minLength: 1
  })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({
    description: 'Detailed description of the product',
    example: 'Latest iPhone model with advanced features',
    minLength: 1
  })
  @Column({ type: 'text', nullable: false })
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
    nullable: true
  })
  @Column({ type: 'integer', nullable: true })
  stock?: number;

  @OneToMany('Review', 'product', { cascade: true, eager: false })
  reviews?: any[];

}
