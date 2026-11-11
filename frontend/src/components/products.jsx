import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { apiFetch, getImageUrl } from '../api/client';
import {
  FiRefreshCw,
  FiSearch,
  FiAlertCircle,
  FiPackage,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiPlus,
  FiX,
  FiUploadCloud,
  FiEdit,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';

const MAX_STOCK_CAPACITY = 30; // 🟢 ចំនួនស្តុក Full Stock អតិបរមាត្រឹមតែ 30 គ្រឿងប៉ុណ្ណោះ

// Helper សម្រាប់កំណត់ពណ៌ Category Badge ឱ្យស្អាតទាក់ទាញ
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
  if (cat.includes('laptop') || cat.includes('mac')) {
    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 Filters & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL'); // ALL, FULL, IN_STOCK, OUT_OF_STOCK, LOW_STOCK
  const [sortField, setSortField] = useState('id'); // id, name, price, stock, category
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  // 🟢 Modal បន្ថែមទំនិញថ្មី (Add Product Modal State)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    category: 'iOS',
    price: '',
    cost: '',
    stock_qty: 30, // Default to full stock 30
    sku: '',
    warranty_months: 12,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // ✏️ Modal កែប្រែទំនិញ (Edit Product Modal State)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    product_name: '',
    category: 'iOS',
    price: '',
    cost: '',
    stock_qty: 30,
    sku: '',
    warranty_months: 12,
    image: null,
  });
  const [editImagePreview, setEditImagePreview] = useState(null);

  const handleEditClick = (product) => {
    setEditingProduct(product);
    const rawStock = Number(product.stock_qty !== undefined ? product.stock_qty : (product.stock || 0));
    setEditFormData({
      product_name: product.product_name || product.name || '',
      category: product.category || product.category_name || 'iOS',
      price: product.price || '',
      cost: product.cost || '',
      stock_qty: Math.min(MAX_STOCK_CAPACITY, Math.max(0, rawStock)),
      sku: product.sku || product.barcode || '',
      warranty_months: product.warranty_months || 0,
      image: null,
    });
    setEditImagePreview(getImageUrl(product.image));
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const id = editingProduct.id || editingProduct.product_id;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('product_name', editFormData.product_name.trim());
      formData.append('category', editFormData.category || 'iOS');
      formData.append('price', Number(editFormData.price));
      if (editFormData.cost) formData.append('cost', Number(editFormData.cost));

      const safeStock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(editFormData.stock_qty || 0)));
      formData.append('stock_qty', safeStock);

      if (editFormData.sku) formData.append('sku', editFormData.sku.trim());
      if (editFormData.warranty_months !== undefined) {
        formData.append('warranty_months', Number(editFormData.warranty_months));
      }
      if (editFormData.image) formData.append('image', editFormData.image);

      await apiFetch(`/products/${id}`, {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('កែប្រែទិន្នន័យទំនិញជោគជ័យ!');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const id = product.id || product.product_id;
    const name = product.product_name || product.name;
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${name}" (ID #${id}) នេះចេញពី MySQL មែនទេ?`)) {
      return;
    }

    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      toast.success(`លុបទំនិញ "${name}" ជោគជ័យ!`);
      setProducts((prev) => prev.filter((p) => (p.id || p.product_id) !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('មានបញ្ហាក្នុងការលុបទំនិញ!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះទំនិញ!');
      return;
    }
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      toast.error('សូមបញ្ចូលតម្លៃទំនិញឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product_name', newProduct.product_name.trim());
      formData.append('category', newProduct.category || 'iOS');
      formData.append('price', Number(newProduct.price));
      if (newProduct.cost) formData.append('cost', Number(newProduct.cost));

      const safeStock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(newProduct.stock_qty || 0)));
      formData.append('stock_qty', safeStock);

      if (newProduct.sku) formData.append('sku', newProduct.sku.trim());
      if (newProduct.warranty_months) formData.append('warranty_months', Number(newProduct.warranty_months));
      if (newProduct.image) formData.append('image', newProduct.image);

      await apiFetch('/products', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('បន្ថែមទំនិញថ្មីជោគជ័យ!');
      setIsAddModalOpen(false);
      setNewProduct({
        product_name: '',
        category: 'iOS',
        price: '',
        cost: '',
        stock_qty: 30,
        sku: '',
        warranty_months: 12,
        image: null,
      });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error('មានបញ្ហាក្នុងការរក្សាទុកទំនិញ! សូមសាកល្បងម្តងទៀត។');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch('/products');
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('មិនអាចភ្ជាប់ទៅកាន់ MySQL Database បានឡើយ! សូមត្រួតពិនិត្យ XAMPP MySQL & Apache។');
    } finally {
      setLoading(false);
    }
  };

  // 1. បញ្ជី Categories ទាំងអស់ដែលមានក្នុងទិន្នន័យផលិតផលជាក់ស្តែង
  const availableCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.category || p.category_name;
      if (cat && String(cat).trim() !== '') {
        set.add(String(cat).trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // 2. តម្រៀប Sort & Filter ទិន្នន័យផលិតផល
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter តាម Category
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => {
        const cat = (p.category || p.category_name || '').toLowerCase();
        return cat === selectedCategory.toLowerCase();
      });
    }

    // Filter តាម Stock Status (Full Stock 30, In Stock, Out of Stock, Low Stock)
    if (selectedStockFilter !== 'ALL') {
      result = result.filter((p) => {
        const stock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(p.stock_qty ?? p.stock ?? 0)));
        if (selectedStockFilter === 'FULL') return stock >= MAX_STOCK_CAPACITY;
        if (selectedStockFilter === 'IN_STOCK') return stock > 0 && stock < MAX_STOCK_CAPACITY;
        if (selectedStockFilter === 'LOW_STOCK') return stock > 0 && stock <= 5;
        if (selectedStockFilter === 'OUT_OF_STOCK') return stock === 0;
        return true;
      });
    }

    // Filter តាម Search Term (ឈ្មោះ, SKU, Category)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const pName = (p.product_name || p.name || '').toLowerCase();
        const sku = (p.sku || p.barcode || '').toLowerCase();
        const cat = (p.category || p.category_name || '').toLowerCase();
        return pName.includes(q) || sku.includes(q) || cat.includes(q);
      });
    }

    // Sort (តម្រៀបទិន្នន័យ)
    result.sort((a, b) => {
      let valA, valB;

      if (sortField === 'id') {
        valA = Number(a.id || a.product_id || 0);
        valB = Number(b.id || b.product_id || 0);
      } else if (sortField === 'price') {
        valA = Number(a.price || 0);
        valB = Number(b.price || 0);
      } else if (sortField === 'stock') {
        valA = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(a.stock_qty ?? a.stock ?? 0)));
        valB = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(b.stock_qty ?? b.stock ?? 0)));
      } else if (sortField === 'category') {
        valA = String(a.category || a.category_name || '').toLowerCase();
        valB = String(b.category || b.category_name || '').toLowerCase();
      } else {
        valA = String(a.product_name || a.name || '').toLowerCase();
        valB = String(b.product_name || b.name || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, selectedCategory, selectedStockFilter, searchTerm, sortField, sortOrder]);

  // មុខងារចុចប្តូរទិសដៅ Sort ពេលចុចលើ Column Header
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-slate-300 ml-1">⇅</span>;
    }
    return sortOrder === 'asc' ? (
      <FiArrowUp className="inline w-3.5 h-3.5 text-indigo-600 ml-1" />
    ) : (
      <FiArrowDown className="inline w-3.5 h-3.5 text-indigo-600 ml-1" />
    );
  };

  // ស្ថិតិសង្ខេបស្តុក (Stats Summary)
  const stats = useMemo(() => {
    let full = 0;
    let inStock = 0;
    let out = 0;
    let low = 0;

    products.forEach((p) => {
      const stock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, Number(p.stock_qty ?? p.stock ?? 0)));
      if (stock >= MAX_STOCK_CAPACITY) full++;
      else if (stock > 0) inStock++;
      else out++;

      if (stock > 0 && stock <= 5) low++;
    });

    return { total: products.length, full, inStock, out, low };
  }, [products]);

  return (
    <div className="p-3 sm:p-5 md:p-6 font-sans">
      {/* 1. Header Bar & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Products</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
              {loading ? '...' : `${processedProducts.length} / ${products.length} មុខ`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            គ្រប់គ្រងទំនិញតាម Category និងកំណត់ Full Stock អតិបរមា {MAX_STOCK_CAPACITY} គ្រឿង
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* 🟢 ប៊ូតុងបន្ថែមទំនិញថ្មី (+ Add Product Button) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={fetchProducts}
            disabled={loading}
            title="Refresh from Database"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 shrink-0"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Reload DB</span>
          </button>
        </div>
      </div>

      {/* 2. Stock Capacity Summary Cards (Full Stock 30) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400">សរុបទាំងអស់</div>
          <div className="text-lg font-black text-slate-800 mt-0.5">{stats.total} មុខ</div>
        </div>
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <FiCheckCircle className="w-3.5 h-3.5" /> Full Stock ({MAX_STOCK_CAPACITY})
          </div>
          <div className="text-lg font-black text-emerald-800 mt-0.5">{stats.full} មុខ</div>
        </div>
        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-[11px] font-semibold text-blue-700">មានក្នុងស្តុក (1-{MAX_STOCK_CAPACITY - 1})</div>
          <div className="text-lg font-black text-blue-800 mt-0.5">{stats.inStock} មុខ</div>
        </div>
        <div className="bg-red-50/70 p-3 rounded-xl border border-red-200 shadow-sm">
          <div className="text-[11px] font-semibold text-red-700 flex items-center gap-1">
            <FiXCircle className="w-3.5 h-3.5" /> អស់ពីស្តុក (0)
          </div>
          <div className="text-lg font-black text-red-800 mt-0.5">{stats.out} មុខ</div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-700">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
            <FiAlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProducts}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shrink-0 self-start sm:self-auto"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* ✏️ MODAL កែប្រែទំនិញ (EDIT PRODUCT MODAL) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100 relative my-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    ✏️
                  </span>
                  <span>កែប្រែទំនិញ (Edit Product)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  កែប្រែទិន្នន័យទំនិញ ID #{editingProduct?.id || editingProduct?.product_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditImagePreview(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ឈ្មោះទំនិញ (Product Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.product_name}
                  onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ប្រភេទ / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  required
                >
                  <option value="iOS">iOS (Apple, iPhone)</option>
                  <option value="Android">Android (Samsung, Xiaomi...)</option>
                  <option value="Accessories">Accessories (Case, Charger, Watch)</option>
                  <option value="Tablets">Tablets (iPad)</option>
                  <option value="Laptops">Laptops (MacBook)</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃលក់ / Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold text-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃដើម / Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.cost}
                    onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      ចំនួនស្តុក (Max {MAX_STOCK_CAPACITY})
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold">ពេញស្តុក = {MAX_STOCK_CAPACITY}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={MAX_STOCK_CAPACITY}
                    value={editFormData.stock_qty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditFormData({
                        ...editFormData,
                        stock_qty: val > MAX_STOCK_CAPACITY ? MAX_STOCK_CAPACITY : val,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SKU / Barcode
                  </label>
                  <input
                    type="text"
                    value={editFormData.sku}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  រូបភាពទំនិញ / Product Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs text-slate-600 bg-slate-50/50">
                    <FiUploadCloud className="w-4 h-4 text-indigo-500" />
                    <span>{editFormData.image ? editFormData.image.name : 'ប្តូររូបភាពថ្មី (Optional)...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditFormData({ ...editFormData, image: file });
                          setEditImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {editImagePreview && (
                    <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white p-0.5 shadow-xs">
                      <img src={editImagePreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Controls Bar: Search, Category Filter Chips, Stock Filter, and Sort */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 shadow-sm space-y-3">
        {/* Row 1: Search & Sort Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category (e.g. iPhone, iOS, 1234)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stock Filter Dropdown */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">📦 ស្តុកទាំងអស់ (All)</option>
              <option value="FULL">🟢 Full Stock ({MAX_STOCK_CAPACITY})</option>
              <option value="IN_STOCK">🔵 មានក្នុងស្តុក (In Stock)</option>
              <option value="LOW_STOCK">🟡 ជិតអស់ (Low Stock ≤ 5)</option>
              <option value="OUT_OF_STOCK">🔴 អស់ពីស្តុក (Out of Stock)</option>
            </select>
          </div>

          {/* Sort Dropdown (short all page) */}
          <div className="w-full sm:w-52 shrink-0">
            <select
              value={`${sortField}_${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('_');
                setSortField(f);
                setSortOrder(o);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
            >
              <option value="id_asc">ល.រ / ID (1 ➔ 10)</option>
              <option value="id_desc">ល.រ / ID (10 ➔ 1)</option>
              <option value="name_asc">ឈ្មោះទំនិញ (A ➔ Z)</option>
              <option value="name_desc">ឈ្មោះទំនិញ (Z ➔ A)</option>
              <option value="price_asc">តម្លៃ ($): ទាប ➔ ខ្ពស់</option>
              <option value="price_desc">តម្លៃ ($): ខ្ពស់ ➔ ទាប</option>
              <option value="stock_desc">ស្តុក: ច្រើន ➔ តិច (Max {MAX_STOCK_CAPACITY} មុន)</option>
              <option value="stock_asc">ស្តុក: តិច ➔ ច្រើន</option>
              <option value="category_asc">ប្រភេទ (Category A ➔ Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Relationship Filter Chips (e.g. iPhone 15 Pro Max in iOS category) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <FiLayers className="w-3.5 h-3.5" /> Category:
          </span>

          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ទាំងអស់ ({products.length})
          </button>

          {availableCategories.map((cat) => {
            const count = products.filter(
              (p) => (p.category || p.category_name || '').toLowerCase() === cat.toLowerCase()
            ).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 flex items-center gap-1.5 ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {(selectedCategory !== 'ALL' || selectedStockFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedStockFilter('ALL');
                setSearchTerm('');
              }}
              className="text-[11px] text-indigo-600 hover:underline font-bold shrink-0 ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Main Table Container */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse min-w-[760px] text-xs sm:text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }} className="text-slate-700 font-bold border-b border-slate-200 select-none">
              <th
                onClick={() => handleSort('id')}
                style={{ padding: '12px 14px' }}
                className="cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                ល.រ / ID {getSortIcon('id')}
              </th>
              <th
                onClick={() => handleSort('name')}
                style={{ padding: '12px 14px' }}
                className="cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                ឈ្មោះទំនិញ {getSortIcon('name')}
              </th>
              <th
                onClick={() => handleSort('category')}
                style={{ padding: '12px 14px' }}
                className="cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                ប្រភេទ / Category {getSortIcon('category')}
              </th>
              <th style={{ padding: '12px 14px' }} className="whitespace-nowrap">
                SKU / Barcode
              </th>
              <th
                onClick={() => handleSort('price')}
                style={{ padding: '12px 14px' }}
                className="cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                តម្លៃ ($) {getSortIcon('price')}
              </th>
              <th
                onClick={() => handleSort('stock')}
                style={{ padding: '12px 14px' }}
                className="cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                ចំនួនស្តុក (Max {MAX_STOCK_CAPACITY}) {getSortIcon('stock')}
              </th>
              <th style={{ padding: '12px 14px' }} className="whitespace-nowrap">
                ស្ថានភាព
              </th>
              <th style={{ padding: '12px 14px' }} className="whitespace-nowrap text-center">
                សកម្មភាព
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 🟢 Skeleton Loading Animation Rows */}
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-slate-100">
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-4 w-6 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-44 max-w-full animate-pulse" />
                        <div className="h-2.5 bg-slate-100 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-3.5 bg-slate-200 rounded w-20 animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-4 bg-indigo-100 rounded w-16 animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse" />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <div className="h-6 bg-slate-100 rounded-lg w-16 mx-auto animate-pulse" />
                  </td>
                </tr>
              ))
            ) : processedProducts.length > 0 ? (
              processedProducts.map((item, index) => {
                const rowNumber = index + 1;
                const nameVal = item.product_name || item.name || 'N/A';
                const skuVal = item.sku || item.barcode || 'N/A';
                const priceVal = Number(item.price ?? 0);
                const rawStock = Number(item.stock_qty ?? item.stock ?? 0);

                // 🟢 គណនាចំនួនស្តុក Capped អតិបរមាត្រឹម 30 គ្រឿង
                const stockVal = Math.min(MAX_STOCK_CAPACITY, Math.max(0, rawStock));
                const isFullStock = stockVal >= MAX_STOCK_CAPACITY;
                const isOut = stockVal === 0;
                const isLow = stockVal > 0 && stockVal <= 5;

                const categoryVal = item.category || item.category_name || 'General';
                const imgUrl = getImageUrl(item.image);

                // Progress percentage out of max 30
                const percent = Math.min(100, Math.round((stockVal / MAX_STOCK_CAPACITY) * 100));

                return (
                  <tr key={item.id || item.product_id || index} className="hover:bg-slate-50 transition">
                    {/* ID */}
                    <td style={{ padding: '12px 14px' }} className="font-bold text-slate-900">
                      {rowNumber}
                    </td>

                    {/* ឈ្មោះទំនិញ + រូបភាព */}
                    <td style={{ padding: '12px 14px' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={nameVal}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerText = '📱';
                              }}
                            />
                          ) : (
                            <span className="text-lg">📱</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 block truncate">{nameVal}</span>
                          <span className="text-[11px] text-slate-400">ID: #{item.id || item.product_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* 🟢 Category Relationship (ឧ. iPhone 15 Pro Max in iOS category) */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryBadgeStyle(
                          categoryVal
                        )}`}
                      >
                        {categoryVal}
                      </span>
                    </td>

                    {/* SKU */}
                    <td style={{ padding: '12px 14px' }} className="text-slate-500 font-mono text-xs">
                      {skuVal}
                    </td>

                    {/* តម្លៃ */}
                    <td style={{ padding: '12px 14px' }} className="font-black text-indigo-600 text-sm">
                      ${priceVal.toFixed(2)}
                    </td>

                    {/* 🟢 ចំនួនស្តុក (Full Stock Max 30 items) */}
                    <td style={{ padding: '12px 14px' }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-xs ${
                              isFullStock
                                ? 'text-emerald-700 font-black'
                                : isOut
                                ? 'text-red-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {stockVal} / {MAX_STOCK_CAPACITY}
                          </span>
                          {isFullStock && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded">
                              FULL
                            </span>
                          )}
                        </div>

                        {/* Mini Progress Bar showing stock / 30 */}
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFullStock
                                ? 'bg-emerald-500'
                                : isOut
                                ? 'bg-red-400'
                                : isLow
                                ? 'bg-amber-400'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* ស្ថានភាព Badge */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          backgroundColor: isFullStock ? '#ecfdf5' : stockVal > 0 ? '#e6fffa' : '#fff5f5',
                          color: isFullStock ? '#047857' : stockVal > 0 ? '#319795' : '#e53e3e',
                          border: `1px solid ${isFullStock ? '#a7f3d0' : stockVal > 0 ? '#b2f5ea' : '#fed7d7'}`,
                        }}
                      >
                        {isFullStock
                          ? `Full Stock (${MAX_STOCK_CAPACITY})`
                          : stockVal > 0
                          ? isLow
                            ? `Low Stock (${stockVal})`
                            : 'In Stock'
                          : 'Out of Stock'}
                      </span>
                    </td>

                    {/* 🟢 Actions (Edit, Delete, View) */}
                    <td style={{ padding: '12px 14px' }} className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toast(`ទំនិញ: ${nameVal} | ប្រភេទ: ${categoryVal} | ស្តុក: ${stockVal}/${MAX_STOCK_CAPACITY} គ្រឿង`, { icon: '📱' })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          title="View Info"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition"
                          title="Edit Product"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiPackage className="w-10 h-10 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      {searchTerm || selectedCategory !== 'ALL' || selectedStockFilter !== 'ALL'
                        ? 'រកមិនឃើញទំនិញដែលត្រូវនឹងការ Filter / Search ឡើយ'
                        : 'មិនទាន់មានទំនិញក្នុង Database ឡើយ'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || selectedCategory !== 'ALL' || selectedStockFilter !== 'ALL' ? (
                        <button
                          onClick={() => {
                            setSelectedCategory('ALL');
                            setSelectedStockFilter('ALL');
                            setSearchTerm('');
                          }}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          កំណត់ Filter ឡើងវិញ (Reset Filters)
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>+ បន្ថែមទំនិញដំបូងរបស់អ្នក</span>
                        </button>
                      )}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🟢 MODAL បន្ថែមទំនិញថ្មី (ADD PRODUCT MODAL) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100 relative my-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    +
                  </span>
                  <span>បន្ថែមទំនិញថ្មី (Add Product)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">បញ្ចូលទិន្នន័យទំនិញចូលក្នុង MySQL Database</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setImagePreview(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ឈ្មោះទំនិញ (Product Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. iPhone 15 Pro Max 256GB"
                  value={newProduct.product_name}
                  onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ប្រភេទ / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  required
                >
                  <option value="iOS">iOS (Apple, iPhone)</option>
                  <option value="Android">Android (Samsung, Xiaomi...)</option>
                  <option value="Accessories">Accessories (Case, Charger, Watch)</option>
                  <option value="Tablets">Tablets (iPad)</option>
                  <option value="Laptops">Laptops (MacBook)</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃលក់ / Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1200.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold text-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃដើម / Cost ($) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1000.00"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Stock (Max 30) & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      ចំនួនស្តុក (Max {MAX_STOCK_CAPACITY})
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold">ពេញស្តុក = {MAX_STOCK_CAPACITY}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={MAX_STOCK_CAPACITY}
                    placeholder="30"
                    value={newProduct.stock_qty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewProduct({
                        ...newProduct,
                        stock_qty: val > MAX_STOCK_CAPACITY ? MAX_STOCK_CAPACITY : val,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SKU / Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. 123456789"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              {/* Warranty Months */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ការធានា / Warranty
                </label>
                <select
                  value={newProduct.warranty_months}
                  onChange={(e) => setNewProduct({ ...newProduct, warranty_months: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={0}>គ្មានការធានា (No Warranty)</option>
                  <option value={3}>3 ខែ (3 Months)</option>
                  <option value={6}>6 ខែ (6 Months)</option>
                  <option value={12}>12 ខែ (1 Year)</option>
                  <option value={24}>24 ខែ (2 Years)</option>
                </select>
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  រូបភាពទំនិញ / Product Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs text-slate-600 bg-slate-50/50">
                    <FiUploadCloud className="w-4 h-4 text-indigo-500" />
                    <span>{newProduct.image ? newProduct.image.name : 'ជ្រើសរើសរូបភាព (JPG, PNG)...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white p-0.5 shadow-xs">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទំនិញ (Save Product)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ MODAL កែប្រែទំនិញ (EDIT PRODUCT MODAL) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100 relative my-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    ✏️
                  </span>
                  <span>កែប្រែទំនិញ (Edit Product)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  កែប្រែទិន្នន័យទំនិញ ID #{editingProduct?.id || editingProduct?.product_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditImagePreview(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ឈ្មោះទំនិញ (Product Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.product_name}
                  onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ប្រភេទ / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  required
                >
                  <option value="iOS">iOS (Apple, iPhone)</option>
                  <option value="Android">Android (Samsung, Xiaomi...)</option>
                  <option value="Accessories">Accessories (Case, Charger, Watch)</option>
                  <option value="Tablets">Tablets (iPad)</option>
                  <option value="Laptops">Laptops (MacBook)</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃលក់ / Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold text-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    តម្លៃដើម / Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.cost}
                    onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      ចំនួនស្តុក (Max {MAX_STOCK_CAPACITY})
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold">ពេញស្តុក = {MAX_STOCK_CAPACITY}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={MAX_STOCK_CAPACITY}
                    value={editFormData.stock_qty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditFormData({
                        ...editFormData,
                        stock_qty: val > MAX_STOCK_CAPACITY ? MAX_STOCK_CAPACITY : val,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SKU / Barcode
                  </label>
                  <input
                    type="text"
                    value={editFormData.sku}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  រូបភាពទំនិញ / Product Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs text-slate-600 bg-slate-50/50">
                    <FiUploadCloud className="w-4 h-4 text-indigo-500" />
                    <span>{editFormData.image ? editFormData.image.name : 'ប្តូររូបភាពថ្មី (Optional)...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditFormData({ ...editFormData, image: file });
                          setEditImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {editImagePreview && (
                    <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white p-0.5 shadow-xs">
                      <img src={editImagePreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
