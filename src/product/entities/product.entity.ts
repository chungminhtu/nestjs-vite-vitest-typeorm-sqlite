import { IsNotEmpty } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @IsNotEmpty()
  product_name: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  description: string;

  @Column({ nullable: false })
  age?: number;
}
