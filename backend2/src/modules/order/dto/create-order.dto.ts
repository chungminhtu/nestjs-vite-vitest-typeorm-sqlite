import { IsEmail, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  @MinLength(1)
  customerName: string;

  @IsEmail()
  customerEmail: string;
}

export interface OrderCreatedMessage {
  productId: number;
  quantity: number;
  orderId: number;
}
