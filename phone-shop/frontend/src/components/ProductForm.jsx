import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost/phone-shop/Backend/public/api';

export default function ProductList({ onAddNew, onEdit }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // Fetch product list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product function
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the product "${name}"?`)) {
      try {
        await axios.delete(`${API_BASE}/products/${id}`);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        alert('Error deleting product!');
      }
    }
  };

  // Helper Function to format image path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    let cleanPath = imagePath.replace(/^\/+/, '');
    return `http://localhost/phone-shop/Backend/public/${cleanPath}`;
  };

  // Filter by search & category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = (p.product_name || p.name || '')
      .toLowerCase()
      .includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
          <p className="text-sm text-slate-500">Total product list and stock updates</p>
        </div>
        
        {/* Add New Product Button */}
        <button
          onClick={onAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <span>+</span> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-xl bg-slate-50 text-sm focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Accessories">Accessories</option>
            <option value="Tablets">Tablets</option>
            <option value="Smartwatches">Smartwatches</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b">
                <th className="p-4">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price ($)</th>
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400">Loading data...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400">No product data found</td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const pId = item.id || item.product_id;
                  const stock = Number(item.stock_qty ?? item.stock ?? 0);
                  const imgUrl = getImageUrl(item.image);

                  return (
                    <tr key={pId} className="hover:bg-slate-50 transition">
                      {/* Image */}
                      <td className="p-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.product_name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-xl">📱</span>
                          )}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="p-4 font-semibold text-slate-800">
                        {item.product_name || item.name}
                      </td>

                      {/* SKU */}
                      <td className="p-4 text-slate-500 font-mono">
                        {item.sku || `SKU-${1000 + pId}`}
                      </td>

                      {/* Category */}
                      <td className="p-4 text-slate-600">
                        {item.category_name || 'General'}
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-indigo-600">
                        ${Number(item.price || 0).toFixed(2)}
                      </td>

                      {/* Stock Qty */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          stock > 10 ? 'bg-emerald-100 text-emerald-700' :
                          stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => onEdit && onEdit(item)}
                            className="p-2 hover:bg-slate-100 text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(pId, item.product_name || item.name)}
                            className="p-2 hover:bg-slate-100 text-rose-600 rounded-lg transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}