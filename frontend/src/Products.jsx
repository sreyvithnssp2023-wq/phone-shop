import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit, FiEye, FiTrash2, FiX, FiRefreshCw, FiSearch, FiPackage, FiLayers, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { apiFetch, getImageUrl as resolveImageUrl, getApiBase } from './api/client';

const API_BASE = getApiBase();
const API_URL = `${API_BASE}/products`;
const MAX_STOCK_CAPACITY = 30; // 🟢 Full Stock អតិបរមាត្រឹម 30 គ្រឿង

const getCategoryBadgeStyle = (category) => {
  const cat = String(category || '').trim().toLowerCase();
  if (cat === 'ios' || cat.includes('apple') || cat.includes('iphone')) {
    return 'bg-sky-50 text-sky-700 border border-sky-200';
  }
  if (cat === 'android' || cat.includes('samsung')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
  if (cat.includes('access') || cat.includes('case') || cat.includes('charger')) {
    return 'bg-purple-50 text-purple-700 border border-purple-200';
  }
  if (cat.includes('tablet') || cat.includes('ipad')) {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('id_asc');

  // States សម្រាប់គ្រប់គ្រង Modal Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'iOS',
    price: '',
    stock_qty: '',
    status: 'Active',
    image: null,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('មិនអាចទាញយកទិន្នន័យពី Server បានឡើយ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getImageUrl = (imagePath) => {
    return resolveImageUrl(imagePath);
  };

  // 1. មុខងារពេលចុចប៊ូតុង Edit
  const handleEditClick = (product) => {
    setEditingProduct(product);
    const rawStock = Number(product.stock_qty !== undefined ? product.stock_qty : (product.quantity || product.stock || 0));
    setFormData({
      product_name: product.product_name || product.name || '',
      category: product.category || product.category_name || 'iOS',
      price: product.price || '',
      stock_qty: Math.min(MAX_STOCK_CAPACITY, Math.max(0, rawStock)),
      status: product.status || 'Active',
      image: null,
    });
    setIsEditOpen(true);
  };

  // 2. មុខងារ Update ទិន្នន័យទៅ Backend (Laravel) ជាមួយ Capped Stock 30
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const id = editingProduct.product_id || editingProduct.id;
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('product_name', formData.product_name);
      data.append('category', formData.category || 'iOS');
      data.append('price', formData.price);

      // Capped max stock to 30
      const safeStock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(formData.stock_qty || 0)));
      data.append('stock_qty', safeStock);
      data.append('status', formData.status);

      if (formData.image) {
        data.append('image', formData.image);
      }

      await axios.post(`${API_URL}/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('កែប្រែទិន្នន័យទំនិញជោគជ័យ!');
      setIsEditOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (product) => {
    const id = product.product_id || product.id;
    const name = product.product_name || product.name;

    if (!window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${name}" នេះមែនទេ?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts((prev) => prev.filter((p) => (p.product_id || p.id) !== id));
      toast.success('លុបទំនិញបានជោគជ័យ!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('មានបញ្ហាក្នុងការលុបទំនិញ!');
    }
  };

  // Available categories
  const availableCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.category || p.category_name;
      if (cat) set.add(String(cat).trim());
    });
    return Array.from(set).sort();
  }, [products]);

  // Process Filter & Sort
  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (p) => (p.category || p.category_name || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedStockFilter !== 'ALL') {
      result = result.filter((p) => {
        const stock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(p.stock_qty ?? p.stock ?? p.quantity ?? 0)));
        if (selectedStockFilter === 'FULL') return stock >= MAX_STOCK_CAPACITY;
        if (selectedStockFilter === 'IN_STOCK') return stock > 0 && stock < MAX_STOCK_CAPACITY;
        if (selectedStockFilter === 'LOW') return stock > 0 && stock <= 5;
        if (selectedStockFilter === 'OUT') return stock === 0;
        return true;
      });
    }

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const productName = (p.product_name || p.name || '').toLowerCase();
        const categoryName = (p.category || p.category_name || '').toLowerCase();
        const sku = (p.sku || p.barcode || '').toLowerCase();
        return productName.includes(q) || categoryName.includes(q) || sku.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      const [field, order] = sortOption.split('_');
      let valA, valB;

      if (field === 'id') {
        valA = Number(a.id || a.product_id || 0);
        valB = Number(b.id || b.product_id || 0);
      } else if (field === 'price') {
        valA = Number(a.price || 0);
        valB = Number(b.price || 0);
      } else if (field === 'stock') {
        valA = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(a.stock_qty ?? a.stock ?? a.quantity ?? 0)));
        valB = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(b.stock_qty ?? b.stock ?? b.quantity ?? 0)));
      } else {
        valA = String(a.product_name || a.name || '').toLowerCase();
        valB = String(b.product_name || b.name || '').toLowerCase();
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, selectedCategory, selectedStockFilter, search, sortOption]);

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Products Management</h1>
          <p className="text-xs text-slate-500">
            គ្រប់គ្រងបញ្ជីទំនិញតាម Category និងកំណត់ Full Stock អតិបរមា {MAX_STOCK_CAPACITY} គ្រឿង
          </p>
        </div>
        <Link
          to="/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition text-center shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU, category..."
              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Stock Filter */}
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">📦 ស្តុកទាំងអស់ (All)</option>
              <option value="FULL">🟢 Full Stock ({MAX_STOCK_CAPACITY})</option>
              <option value="IN_STOCK">🔵 មានក្នុងស្តុក (1-29)</option>
              <option value="LOW">🟡 ជិតអស់ (≤ 5)</option>
              <option value="OUT">🔴 អស់ពីស្តុក (0)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
            >
              <option value="id_asc">ID: 1 ➔ 10</option>
              <option value="id_desc">ID: 10 ➔ 1</option>
              <option value="price_asc">Price: Low ➔ High</option>
              <option value="price_desc">Price: High ➔ Low</option>
              <option value="stock_desc">Stock: High ➔ Low</option>
              <option value="name_asc">Name: A ➔ Z</option>
            </select>

            <button
              onClick={fetchProducts}
              disabled={loading}
              title="Reload products"
              className="p-2 border border-gray-300 rounded-xl hover:bg-slate-50 text-slate-600 transition disabled:opacity-50 shrink-0"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
          <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <FiLayers /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({products.length})
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock (Max {MAX_STOCK_CAPACITY})</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...Array(6)].map((_, i) => (
                  <tr key={`skel-prod-${i}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                        <div className="h-4 bg-slate-200 rounded w-44 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded-full w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-indigo-100 rounded w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded-full w-20 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-blue-100 rounded-full w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="w-20 h-7 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {products.length === 0
              ? 'មិនទាន់មានទំនិញឡើយ។ សូមបន្ថែមទំនិញដំបូងរបស់អ្នក!'
              : 'រកមិនឃើញទំនិញដែលត្រូវនឹងការស្វែងរកឡើយ។'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock (Max {MAX_STOCK_CAPACITY})</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => {
                  const id = p.product_id || p.id;
                  const name = p.product_name || p.name;
                  const price = Number(p.price || 0);
                  const rawStock = Number(p.stock_qty !== undefined ? p.stock_qty : (p.quantity || p.stock || 0));
                  const stock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, rawStock));
                  const isFullStock = stock >= MAX_STOCK_CAPACITY;
                  const categoryVal = p.category || p.category_name || 'General';
                  const imageUrl = getImageUrl(p.image);
                  const percent = Math.min(100, Math.round((stock / MAX_STOCK_CAPACITY) * 100));

                  return (
                    <tr key={id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <span>📱</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{name}</span>
                            <span className="text-[11px] text-slate-400">ID: #{id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryBadgeStyle(categoryVal)}`}>
                          {categoryVal}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-600">${price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span className={isFullStock ? 'text-emerald-700 font-black' : stock === 0 ? 'text-red-600' : 'text-slate-800'}>
                              {stock} / {MAX_STOCK_CAPACITY}
                            </span>
                            {isFullStock && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded">
                                FULL
                              </span>
                            )}
                          </div>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border">
                            <div
                              className={`h-full ${isFullStock ? 'bg-emerald-500' : stock <= 5 ? 'bg-amber-400' : 'bg-indigo-600'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isFullStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : stock <= 0
                              ? 'bg-red-100 text-red-700'
                              : stock <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isFullStock ? 'Full Stock' : stock <= 0 ? 'Out of stock' : stock <= 5 ? `Low (${stock})` : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => toast(`Product: ${name} (${categoryVal}) - Stock: ${stock}/${MAX_STOCK_CAPACITY}`, { icon: 'ℹ️' })}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => remove(p)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal with Category & Max 30 Stock */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-xl relative my-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-slate-800">Edit Product</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* 🟢 Category Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Category (Relationship)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="iOS">iOS (Apple, iPhone)</option>
                  <option value="Android">Android (Samsung, etc.)</option>
                  <option value="Accessories">Accessories (Case, Charger, Watch)</option>
                  <option value="Tablets">Tablets (iPad)</option>
                  <option value="Laptops">Laptops</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Stock Qty (Max {MAX_STOCK_CAPACITY})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={MAX_STOCK_CAPACITY}
                    value={formData.stock_qty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        stock_qty: val > MAX_STOCK_CAPACITY ? MAX_STOCK_CAPACITY : val,
                      });
                    }}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ស្តុកពេញអតិបរមា {MAX_STOCK_CAPACITY} គ្រឿង
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Change Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full p-1.5 border rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
