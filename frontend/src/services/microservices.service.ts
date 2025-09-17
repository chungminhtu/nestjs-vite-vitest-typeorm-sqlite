import type { CreateProductDto, Product, UpdateProductDto } from '../types/Product';

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  productId: number;
  quantity: number;
  customerName: string;
  customerEmail: string;
}

class MicroservicesService {
  private readonly PRODUCT_API_BASE = 'http://localhost:3000';
  private readonly ORDER_API_BASE = 'http://localhost:3001';

  // Product Service (Backend1) methods
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.PRODUCT_API_BASE}/product`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${this.PRODUCT_API_BASE}/product/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const response = await fetch(`${this.PRODUCT_API_BASE}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  }

  async updateProduct(id: number, productData: UpdateProductDto): Promise<Product> {
    const response = await fetch(`${this.PRODUCT_API_BASE}/product/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${this.PRODUCT_API_BASE}/product/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  // Order Service (Backend2) methods
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${this.ORDER_API_BASE}/order`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }

  async getOrder(id: number): Promise<Order> {
    const response = await fetch(`${this.ORDER_API_BASE}/order/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${this.ORDER_API_BASE}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return response.json();
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    const response = await fetch(`${this.ORDER_API_BASE}/order/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    return response.json();
  }

  async deleteOrder(id: number): Promise<void> {
    const response = await fetch(`${this.ORDER_API_BASE}/order/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  }

  // Combined operations that use both services
  async createOrderAndUpdateStock(orderData: CreateOrderDto): Promise<{ order: Order; updatedProduct: Product }> {
    // First, verify product exists and has enough stock
    const product = await this.getProduct(orderData.productId);
    if (product.stock < orderData.quantity) {
      throw new Error('Insufficient stock');
    }

    // Create the order (this will trigger microservice communication to update stock)
    const order = await this.createOrder(orderData);

    // Wait a moment for microservice communication
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the updated product
    const updatedProduct = await this.getProduct(orderData.productId);

    return { order, updatedProduct };
  }
}

export const microservicesService = new MicroservicesService();
