import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Check if using SQLite
const isSQLite = process.env.DB_TYPE === 'sqlite';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ length: 100 })
  reviewerName: string;

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 stars

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at', type: isSQLite ? 'datetime' : 'timestamptz' })
  createdAt: Date;
}
