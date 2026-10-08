import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ទាញយកទិន្នន័យពេល Component ដំណើរការដំបូង
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // កែប្រែ URL មកប្រើ XAMPP Apache Direct Link (ឬប្តូរទៅ http://localhost:8080/api/products បើប្រើ Artisan)
      const response = await axios.get('http://localhost/phone-shop/Backend/public/api/products');
      
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('មិនអាចទាញយកទិន្នន័យពី Server បានឡើយ!');
    } finally {
      setLoading(false);
    }
  };

  // Filter ស្វែងរកតាម product_name
  const filteredProducts = products.filter((product) =>
    product.product_name
      ? product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Products</h2>

      {/* ប្រអប់ Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            width: '300px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {/* បង្ហាញ Error Alert ប្រសិនបើមាន */}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {/* ដំណើរការ Loading */}
      {loading ? (
        <p>កំពុងទាញយកទិន្នន័យ...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ឈ្មោះទំនិញ</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>SKU</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>តម្លៃ ($)</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ចំនួនស្តុក</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ស្ថានភាព</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <tr key={item.product_id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.product_id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.product_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.sku || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>${item.price}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.stock_qty}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: item.status === 'active' ? '#e6fffa' : '#fff5f5',
                      color: item.status === 'active' ? '#319795' : '#e53e3e'
                    }}>
                      {item.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  មិនទាន់មានទំនិញឡើយ! សូមបន្ថែមទំនិញដំបូងរបស់អ្នក!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Products;