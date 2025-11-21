import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import authService from '../../services/authService';

const AddProductContainer = styled.div`
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
  color: var(--dark-gray);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-xl);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--dark-gray);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: border-color var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  min-height: 120px;
  resize: vertical;
  transition: border-color var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: var(--white);
  transition: border-color var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed var(--gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-color);
    background: var(--primary-light);
  }
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const PreviewImage = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: var(--light-gray);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #dc3545;
  color: var(--white);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-xl);
  background: var(--light-gray);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.primary {
    background: var(--primary-color);
    color: var(--white);
    
    &:hover {
      background: var(--primary-dark);
    }
  }
  
  &.secondary {
    background: var(--white);
    color: var(--gray);
    border: 1px solid var(--gray);
    
    &:hover {
      background: var(--light-gray);
    }
  }
`;

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    category: '',
    tags: '',
    materials: '',
    techniques: '',
    customizationOptions: '',
    inventory: {
      quantity: '',
      trackQuantity: true,
      lowStockThreshold: '5'
    }
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Jewelry',
    'Home Decor',
    'Art & Prints',
    'Clothing',
    'Pottery',
    'Woodwork',
    'Textiles',
    'Accessories',
    'Toys & Games',
    'Beauty & Personal Care'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + index,
          file,
          preview: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission triggered');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category || !formData.inventory.quantity) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate numeric fields
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error('Please enter a valid price');
      }
      
      if (isNaN(parseInt(formData.inventory.quantity)) || parseInt(formData.inventory.quantity) < 0) {
        throw new Error('Please enter a valid quantity');
      }

      // Send to API using productService
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.inventory.quantity),
        materials: formData.materials,
        techniques: formData.techniques,
        customizationOptions: formData.customizationOptions,
        images: images.map(img => img.file).filter(Boolean)
      };

      console.log('🛍️ Creating product:', productData);
      const result = await productService.createProduct(productData);

      console.log('✅ Product created successfully:', result);
      alert('Product submitted successfully! It will be reviewed by an admin before going live. You can check the approval status in your dashboard.');
      navigate('/seller/dashboard');

    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddProductContainer>
      <div className="container">
        <Header>
          <BackButton onClick={() => navigate('/seller')}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <div>
            <h1>Add New Product</h1>
            <p>Create a new listing for your handmade product</p>
          </div>
        </Header>

        <div style={{ 
          background: '#e7f3ff', 
          border: '1px solid #bee5eb', 
          borderRadius: 'var(--radius-md)', 
          padding: 'var(--spacing-lg)', 
          marginBottom: 'var(--spacing-xl)',
          color: '#0c5460'
        }}>
          <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>📝 Product Approval Process</h4>
          <p style={{ fontSize: 'var(--font-sm)' }}>
            Your product will be submitted for admin approval before it becomes visible to customers. 
            You can track the approval status in your seller dashboard.
          </p>
        </div>

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
                    onChange={handleInputChange}
                    placeholder="e.g., Handmade Ceramic Vase"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
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
              </FormGrid>

              <FormGroup>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  type="text"
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief description for product listings"
                  maxLength="200"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Full Description *</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of your product, materials used, crafting process, etc."
                  required
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Pricing & Inventory</SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="price">Price (Rs.) *</Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    type="number"
                    id="comparePrice"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="inventory.quantity">Quantity Available *</Label>
                  <Input
                    type="number"
                    id="inventory.quantity"
                    name="inventory.quantity"
                    value={formData.inventory.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="inventory.lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    type="number"
                    id="inventory.lowStockThreshold"
                    name="inventory.lowStockThreshold"
                    value={formData.inventory.lowStockThreshold}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>Product Images</SectionTitle>
              <ImageUploadArea onClick={() => document.getElementById('imageInput').click()}>
                <FiUpload size={48} color="var(--gray)" />
                <h4>Upload Product Images</h4>
                <p>Click to select images or drag and drop</p>
                <input
                  type="file"
                  id="imageInput"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </ImageUploadArea>
              
              {images.length > 0 && (
                <ImagePreview>
                  {images.map((image) => (
                    <PreviewImage key={image.id}>
                      <img 
                        src={image.preview} 
                        alt={image.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                      <RemoveImageButton onClick={() => removeImage(image.id)}>
                        <FiX />
                      </RemoveImageButton>
                    </PreviewImage>
                  ))}
                </ImagePreview>
              )}
            </FormSection>

            <FormSection>
              <SectionTitle>Handmade Details</SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="materials">Materials Used</Label>
                  <Input
                    type="text"
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="e.g., Clay, Glaze, Wood (comma separated)"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="techniques">Techniques</Label>
                  <Input
                    type="text"
                    id="techniques"
                    name="techniques"
                    value={formData.techniques}
                    onChange={handleInputChange}
                    placeholder="e.g., Hand-thrown, Glazed, Fired (comma separated)"
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., ceramic, vase, home decor, handmade (comma separated)"
                />
              </FormGroup>
            </FormSection>

            <ActionButtons>
              <Button type="button" className="secondary" onClick={() => navigate('/seller')}>
                Cancel
              </Button>
              <Button type="submit" className="primary" disabled={loading}>
                <FiSave />
                {loading ? 'Adding Product...' : 'Add Product'}
              </Button>
            </ActionButtons>
          </FormContainer>
        </form>
      </div>
    </AddProductContainer>
  );
};

export default AddProduct;
