import { useEffect, useState } from 'react';
import type { CreateReviewDto, Product, Review, UpdateReviewDto } from '../types/Product';

interface ReviewDialogProps {
  isOpen: boolean;
  review?: Review | null;
  product?: Product | null;
  products: Product[];
  onSubmit: (review: CreateReviewDto | UpdateReviewDto) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const ReviewDialog = ({ isOpen, review, product, products, onSubmit, onClose, isLoading }: ReviewDialogProps) => {
  const [formData, setFormData] = useState({
    reviewerName: '',
    rating: '',
    comment: '',
    productId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (review) {
      setFormData({
        reviewerName: review.reviewerName,
        rating: review.rating?.toString() || '',
        comment: review.comment,
        productId: review.productId?.toString() || '',
      });
    } else {
      setFormData({
        reviewerName: '',
        rating: '',
        comment: '',
        productId: product?.id ? product.id.toString() : '',
      });
    }
    setErrors({});
  }, [review, product, products, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reviewerName.trim()) {
      newErrors.reviewerName = 'Reviewer name is required';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    }

    if (formData.rating && (isNaN(Number(formData.rating)) || Number(formData.rating) < 1 || Number(formData.rating) > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (!formData.productId || formData.productId === '' || isNaN(Number(formData.productId))) {
      newErrors.productId = 'Product selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productId = Number(formData.productId);
    if (isNaN(productId)) {
      setErrors({ productId: 'Invalid product selection' });
      return;
    }

    const submitData = {
      reviewerName: formData.reviewerName.trim(),
      comment: formData.comment.trim(),
      productId: productId, // This will be extracted by the parent component
      ...(formData.rating && { rating: Number(formData.rating) }),
    };

    try {
      await onSubmit(submitData);
      // Dialog will be closed by parent component
    } catch (error) {
      // Error is handled by the parent component
      // Don't close dialog on error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog dialog-large" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>{review ? 'Edit Review' : 'Add New Review'}</h3>
          <button className="dialog-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            {Object.keys(errors).length > 0 && (
              <div className="error-message" data-testid="error-message">
                {Object.values(errors).join(', ')}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reviewerName">Reviewer Name *</label>
                <input
                  type="text"
                  id="reviewerName"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleChange}
                  className={errors.reviewerName ? 'error' : ''}
                  disabled={isLoading}
                  data-testid="reviewer-name-input"
                  required
                />
                {errors.reviewerName && <span className="error-message">{errors.reviewerName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="productId">Product *</label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className={errors.productId ? 'error' : ''}
                  disabled={isLoading || !!product}
                  data-testid="product-select"
                  required
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
                {errors.productId && <span className="error-message">{errors.productId}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating (1-5 stars)</label>
              <div className="rating-input">
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className={errors.rating ? 'error' : ''}
                  disabled={isLoading}
                  min="1"
                  max="5"
                  placeholder="Optional"
                  data-testid="rating-input"
                />
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${Number(formData.rating) >= star ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star.toString() }))}
                      disabled={isLoading}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              {errors.rating && <span className="error-message">{errors.rating}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="comment">Comment *</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className={errors.comment ? 'error' : ''}
                disabled={isLoading}
                rows={6}
                data-testid="comment-input"
                placeholder="Share your thoughts about this product..."
                required
              />
              {errors.comment && <span className="error-message">{errors.comment}</span>}
            </div>
          </div>

          <div className="dialog-footer">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              data-testid={review ? "update-review-btn" : "create-review-btn"}
            >
              {isLoading ? 'Saving...' : (review ? 'Update Review' : 'Create Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
