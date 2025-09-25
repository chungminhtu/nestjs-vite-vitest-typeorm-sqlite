export interface Product {
  id: number;
  product_name: string;
  description: string;
  stock?: number;
  reviews?: Review[];
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

export interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating?: number;
  comment: string;
  createdAt: string;
  product?: Product;
}

export interface CreateReviewDto {
  reviewerName: string;
  rating?: number;
  comment: string;
}

export interface UpdateReviewDto {
  reviewerName?: string;
  rating?: number;
  comment?: string;
}
