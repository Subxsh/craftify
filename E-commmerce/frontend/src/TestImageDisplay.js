import React, { useEffect, useState } from 'react';
import productService from './services/productService';
import getImageUrl from './utils/getImageUrl';

const TestImageDisplay = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getAllProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Image Display</h1>
      {products.map((product) => {
        const imageUrl = product.images && product.images.length > 0 
          ? getImageUrl(product.images[0]) 
          : null;
        
        console.log('🔍 Test Product:', product.name, imageUrl);
        
        return (
          <div key={product._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>ID: {product._id}</p>
            <p>Images: {product.images?.length || 0}</p>
            
            {imageUrl ? (
              <>
                <p>Image URL: {imageUrl}</p>
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
                  onError={(e) => {
                    console.error('❌ Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              </>
            ) : (
              <p>No image available</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TestImageDisplay;