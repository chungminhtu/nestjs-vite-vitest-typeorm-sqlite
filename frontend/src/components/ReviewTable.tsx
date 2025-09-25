import type { Product, Review } from '../types/Product';

interface ReviewTableProps {
  reviews: Review[];
  products: Product[];
  onEdit: (product: Product, review: Review) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const ReviewTable = ({ reviews, products, onEdit, onDelete, isLoading }: ReviewTableProps) => {
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.product_name || `Product ${productId}`;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="no-rating">No rating</span>;

    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
        <span className="rating-text">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table" data-testid="review-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan={7} className="no-data">
                No reviews found. Create your first review!
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td className="product-name">{getProductName(review.productId)}</td>
                <td>{review.reviewerName}</td>
                <td>{renderStars(review.rating)}</td>
                <td className="comment-cell">
                  <div className="comment-preview">
                    {review.comment.length > 50
                      ? `${review.comment.substring(0, 50)}...`
                      : review.comment
                    }
                  </div>
                </td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => {
                        const product = products.find(p => p.id === review.productId);
                        if (product) {
                          onEdit(product, review);
                        } else {
                          // Fallback: create a mock product if not found
                          const mockProduct = {
                            id: review.productId,
                            product_name: `Product ${review.productId}`,
                            description: 'Mock product for editing',
                            stock: 0
                          };
                          onEdit(mockProduct, review);
                        }
                      }}
                      title="Edit review"
                      data-testid="edit-review-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => onDelete(review.id)}
                      title="Delete review"
                      data-testid="delete-review-btn"
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
