import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty()
  product_name: string;

  @Column({ type: 'text', nullable: false })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'integer', nullable: true })
  stock?: number;
}
