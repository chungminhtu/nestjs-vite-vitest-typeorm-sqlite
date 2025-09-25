import type { Product } from '../types/Product';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const ProductList = ({ products, onEdit, onDelete, isLoading }: ProductListProps) => {
  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="no-products">No products found. Create your first product!</div>;
  }

  return (
    <div className="product-list" data-testid="product-list">
      <h3>Product List</h3>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card" data-testid="product-item">
            <div className="product-header">
              <h4>{product.product_name}</h4>
              <div className="product-actions">
                <button
                  onClick={() => onEdit(product)}
                  className="edit-btn"
                  title="Edit product"
                  data-testid="edit-product-btn"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="delete-btn"
                  title="Delete product"
                  data-testid="delete-product-btn"
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="product-description">{product.description}</p>
            {product.stock !== undefined && (
              <div className="product-stock">
                <span className="stock-label">Stock:</span>
                <span className={`stock-value ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
                  {product.stock}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
