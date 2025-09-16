export interface Product {
  id: number;
  product_name: string;
  description: string;
  stock?: number;
}

export interface CreateProductDto {
  product_name: string;
  description: string;
  stock?: number;
}

export interface UpdateProductDto {
  product_name?: string;
  description?: string;
  stock?: number;
}
