import type { Product } from '../types/Product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddReview: (product: Product) => void;
  isLoading: boolean;
}

export const ProductTable = ({ products, onEdit, onDelete, onAddReview, isLoading }: ProductTableProps) => {
  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table" data-testid="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Stock</th>
            <th>Reviews</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="no-data">
                No products found. Create your first product!
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td className="product-name">{product.product_name}</td>
                <td className="description">{product.description}</td>
                <td>
                  <span className={`stock-badge ${product.stock && product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock ?? 'N/A'}
                  </span>
                </td>
                <td>
                  <div className="review-info">
                    <span className="review-count">
                      {product.reviews?.length || 0} reviews
                    </span>
                    <button
                      className="btn-link"
                      onClick={() => onAddReview(product)}
                      title="Add review"
                    >
                      + Add Review
                    </button>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => onEdit(product)}
                      title="Edit product"
                      data-testid="edit-product-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => onDelete(product.id)}
                      title="Delete product"
                      data-testid="delete-product-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
