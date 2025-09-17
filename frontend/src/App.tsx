import { useEffect, useState } from 'react';
import './App.css';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { microservicesService } from './services/microservices.service';
import type { CreateProductDto, Product, UpdateProductDto } from './types/Product';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await microservicesService.getProducts();
      setProducts(fetchedProducts);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (productData: CreateProductDto | UpdateProductDto) => {
    try {
      setIsLoading(true);
      await microservicesService.createProduct(productData as CreateProductDto);
      await loadProducts();
      setError('');
    } catch (err) {
      setError('Failed to create product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: UpdateProductDto) => {
    if (!editingProduct) return;

    try {
      setIsLoading(true);
      await microservicesService.updateProduct(editingProduct.id, productData);
      await loadProducts();
      setEditingProduct(null);
      setError('');
    } catch (err) {
      setError('Failed to update product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsLoading(true);
      await microservicesService.deleteProduct(id);
      await loadProducts();
      setError('');
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Product Management</h1>
        {error && <div className="error-banner" data-testid="error-message">{error}</div>}
      </header>

      <main>
        <div className="container">
          <section className="form-section">
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={handleCancelEdit}
              isLoading={isLoading}
            />
          </section>

          <section className="list-section">
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
