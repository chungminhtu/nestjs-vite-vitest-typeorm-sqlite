import type { CreateProductDto, CreateReviewDto, Product, Review, UpdateProductDto, UpdateReviewDto } from '../types/Product';

const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/product');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/product/${id}`);
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    return this.request<Product>('/product', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: UpdateProductDto): Promise<Product> {
    return this.request<Product>(`/product/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/product/${id}`, {
      method: 'DELETE',
    });
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return this.request<Review[]>('/product/test-route');
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return this.request<Review[]>(`/product/${productId}/reviews`);
  }

  async getReview(id: number): Promise<Review> {
    return this.request<Review>(`/product/reviews/${id}`);
  }

  async createReview(productId: number, review: CreateReviewDto): Promise<Review> {
    console.log('🌐 Frontend API createReview called with productId:', productId, 'review:', review);
    try {
      const response = await this.request<Review>(`/product/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review),
      });
      console.log('✅ Frontend API createReview response:', response);
      return response;
    } catch (error) {
      console.log('❌ Frontend API createReview failed:', error);
      throw error;
    }
  }

  async updateReview(id: number, review: UpdateReviewDto): Promise<Review> {
    return this.request<Review>(`/product/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(review),
    });
  }

  async deleteReview(id: number): Promise<void> {
    return this.request<void>(`/product/reviews/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
