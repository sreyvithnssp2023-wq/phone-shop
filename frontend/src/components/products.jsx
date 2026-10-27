import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/phone-shop/Backend/public/api/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('មិនអាចទាញយកទិន្នន័យពី Server បានឡើយ!');
    } finally {
      setLoading(false);
    }
  };

  // 1. Filter ទិន្នន័យតាមការស្វែងរក
  const filteredProducts = products.filter((product) => {
    const pName = product.product_name || product.name || '';
    const sku = product.sku || product.barcode || '';
    return (
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 2. តម្រៀបទិន្នន័យពី ID តូចទៅធំ (1, 2, 3...)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const idA = a.id || a.product_id || 0;
    const idB = b.id || b.product_id || 0;
    return idA - idB;
  });

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

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>កំពុងទាញយកទិន្នន័យ...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ល.រ / ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ឈ្មោះទំនិញ</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>SKU</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>តម្លៃ ($)</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ចំនួនស្តុក</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ស្ថានភាព</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((item, index) => {
                // រៀបលេខរៀងចាប់ពី ១ ឡើងទៅតាមលំដាប់ (1, 2, 3...)
                const rowNumber = index + 1;
                const nameVal = item.product_name || item.name || 'N/A';
                const skuVal = item.sku || item.barcode || 'N/A';
                const priceVal = item.price ?? 0;
                const stockVal = item.stock_qty ?? item.stock ?? 0;
                const isAvailable = stockVal > 0;

                return (
                  <tr key={item.id || item.product_id || index}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {rowNumber}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{nameVal}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{skuVal}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>${priceVal}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{stockVal}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: isAvailable ? '#e6fffa' : '#fff5f5',
                        color: isAvailable ? '#319795' : '#e53e3e'
                      }}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })
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