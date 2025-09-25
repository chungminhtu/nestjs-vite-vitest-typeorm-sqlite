import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const isSQLite = process.env.DB_TYPE === 'sqlite';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'customer_name', type: 'varchar' })
  customerName: string;

  @Column({ name: 'customer_email', type: 'varchar' })
  customerEmail: string;

  @Column({ name: 'status', type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: isSQLite ? 'datetime' : 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: isSQLite ? 'datetime' : 'timestamptz' })
  updatedAt: Date;
}
