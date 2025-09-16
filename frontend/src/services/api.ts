import { Product, CreateProductDto, UpdateProductDto } from '../types/Product';

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
}

export const apiService = new ApiService();
