import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';

const EditProductContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: var(--light-gray);
`;

const Header = styled.div`
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: 1px solid var(--gray);
  color: var(--gray);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
  }
`;

const FormContainer = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

const FormSection = styled.div`
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--light-gray);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  margin-bottom: var(--spacing-lg);
  color: var(--dark-gray);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--dark-gray);
`;

const Input = styled.input`
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  background: var(--white);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SubmitButton = styled.button`
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
  
  &:hover {
    background: var(--primary-dark);
  }
  
  &:disabled {
    background: var(--gray);
    cursor: not-allowed;
  }
`;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    materials: '',
    techniques: '',
    customizationOptions: ''
  });

  const categories = [
    'Home Decor',
    'Accessories', 
    'Jewelry',
    'Clothing',
    'Art',
    'Furniture',
    'Kitchen & Dining',
    'Bath & Beauty',
    'Toys & Games',
    'Electronics',
    'Books',
    'Other'
  ];

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      console.log('📦 Fetching product for edit:', id);
      const product = await productService.getProductById(id);
      
      // Check if current user is the seller
      if (product.seller._id !== user._id) {
        alert('You can only edit your own products');
        navigate('/seller/dashboard');
        return;
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        quantity: product.inventory?.quantity || '',
        materials: product.materials?.join(', ') || '',
        techniques: product.techniques?.join(', ') || '',
        customizationOptions: product.customizationOptions || ''
      });
      
      console.log('✅ Product loaded for editing');
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      alert('Failed to load product: ' + error.message);
      navigate('/seller/dashboard');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('💾 Updating product:', id);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.quantity),
        materials: formData.materials,
        techniques: formData.techniques,
        customizationOptions: formData.customizationOptions
      };

      await productService.updateProduct(id, productData);
      console.log('✅ Product updated successfully');
      alert('Product updated successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      alert('Failed to update product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <EditProductContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <h3>Loading product...</h3>
          </div>
        </div>
      </EditProductContainer>
    );
  }

  return (
    <EditProductContainer>
      <div className="container">
        <Header>
          <BackButton onClick={() => navigate('/seller/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <div>
            <h1>Edit Product</h1>
            <p>Update your product information</p>
          </div>
        </Header>

        <form onSubmit={handleSubmit}>
          <FormContainer>
            <FormSection>
              <SectionTitle>Basic Information</SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Available quantity"
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup style={{ marginTop: 'var(--spacing-lg)' }}>
                <Label htmlFor="description">Description *</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your product in detail..."
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Additional Details</SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="materials">Materials</Label>
                  <Input
                    type="text"
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleChange}
                    placeholder="e.g., Cotton, Wood, Metal"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="techniques">Techniques</Label>
                  <Input
                    type="text"
                    id="techniques"
                    name="techniques"
                    value={formData.techniques}
                    onChange={handleChange}
                    placeholder="e.g., Hand-sewn, Carved, Painted"
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup style={{ marginTop: 'var(--spacing-lg)' }}>
                <Label htmlFor="customizationOptions">Customization Options</Label>
                <TextArea
                  id="customizationOptions"
                  name="customizationOptions"
                  value={formData.customizationOptions}
                  onChange={handleChange}
                  placeholder="Describe any customization options available..."
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SubmitButton type="submit" disabled={loading}>
                <FiSave />
                {loading ? 'Updating Product...' : 'Update Product'}
              </SubmitButton>
            </FormSection>
          </FormContainer>
        </form>
      </div>
    </EditProductContainer>
  );
};

export default EditProduct;
