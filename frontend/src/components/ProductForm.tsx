import { useEffect, useState } from 'react';
import type { CreateProductDto, Product, UpdateProductDto } from '../types/Product';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: CreateProductDto | UpdateProductDto) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProductForm = ({ product, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    stock: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name,
        description: product.description,
        stock: product.stock?.toString() || '',
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.stock && isNaN(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      product_name: formData.product_name.trim(),
      description: formData.description.trim(),
      ...(formData.stock && { stock: Number(formData.stock) }),
    };

    try {
      await onSubmit(submitData);
      setFormData({ product_name: '', description: '', stock: '' });
    } catch (error) {
      console.error('Failed to submit product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="product-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      {Object.keys(errors).length > 0 && (
        <div className="error-message" data-testid="error-message">
          {Object.values(errors).join(', ')}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product_name">Product Name *</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className={errors.product_name ? 'error' : ''}
            disabled={isLoading}
            data-testid="product-name-input"
          />
          {errors.product_name && <span className="error-message">{errors.product_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            disabled={isLoading}
            rows={3}
            data-testid="product-description-input"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={errors.stock ? 'error' : ''}
            disabled={isLoading}
            min="0"
            data-testid="product-stock-input"
          />
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading} data-testid={product ? "update-product-btn" : "create-product-btn"}>
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};
