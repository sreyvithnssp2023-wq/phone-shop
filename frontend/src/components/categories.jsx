import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiArrowUp, FiArrowDown, FiX, FiLayers } from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost/phone-shop/Backend/public/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sort_order: 1,
  });

  // Helper to save categories locally to prevent losing data on refresh
  const saveCategoriesLocally = (catList) => {
    localStorage.setItem('pos_categories', JSON.stringify(catList));
    setCategories(catList);
  };

  // Fetch Categories & Products
  const fetchData = async () => {
    try {
      setLoading(true);
      
      let fetchedCats = [];
      try {
        const catRes = await axios.get(`${API_BASE}/categories`);
        fetchedCats = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);
      } catch (e) {
        console.warn('API category fetch failed, falling back to LocalStorage...');
      }

      // Check LocalStorage fallback
      const localCats = JSON.parse(localStorage.getItem('pos_categories') || '[]');
      
      // Use API data if available; fallback to LocalStorage if API is empty/outdated
      const finalCats = fetchedCats.length > 0 ? fetchedCats : localCats;
      
      // Keep LocalStorage updated
      if (finalCats.length > 0) {
        localStorage.setItem('pos_categories', JSON.stringify(finalCats));
      }

      const sortedList = finalCats.sort((a, b) => (a.sort_order || a.sort || 0) - (b.sort_order || b.sort || 0));
      setCategories(sortedList);

      // Fetch products to calculate dynamic product counts
      let prodList = [];
      try {
        const prodRes = await axios.get(`${API_BASE}/products`);
        prodList = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
      } catch (err) {
        console.warn('Checking LocalStorage for products...');
      }

      const localProds = JSON.parse(localStorage.getItem('pos_products') || '[]');
      setProducts([...prodList, ...localProds]);

    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('មិនអាចទាញយកទិន្នន័យ Categories បានទេ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate live product count for each category
  const getProductCount = (cat) => {
    const catId = cat.id;
    const catName = (cat.name || cat.title || '').trim().toLowerCase();
    const catSlug = (cat.slug || '').trim().toLowerCase();

    return products.filter(p => {
      if (p.category_id && String(p.category_id) === String(catId)) return true;
      if (p.category) {
        const pCat = String(p.category).trim().toLowerCase();
        return (
          pCat === catName ||
          pCat === catSlug ||
          pCat === catName.replace(/s$/, '') ||
          catName === pCat.replace(/s$/, '')
        );
      }
      return false;
    }).length;
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
    setForm(prev => ({
      ...prev,
      name: val,
      slug: editId ? prev.slug : autoSlug
    }));
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditId(cat.id);
      setForm({
        name: cat.name || cat.title || '',
        slug: cat.slug || '',
        sort_order: cat.sort_order || cat.sort || 1,
      });
    } else {
      setEditId(null);
      setForm({
        name: '',
        slug: '',
        sort_order: categories.length + 1,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  // Submit Handler: Updates local storage and API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះ Category!');
      return;
    }

    let updatedList = [...categories];

    if (editId) {
      // Update local state
      updatedList = updatedList.map(c => c.id === editId ? { ...c, ...form } : c);
      saveCategoriesLocally(updatedList);

      try {
        await axios.put(`${API_BASE}/categories/${editId}`, form);
      } catch (err) {
        console.warn('Backend PUT failed, saved locally');
      }
      toast.success('បានបច្ចុប្បន្នភាព Category រួចរាល់!');

    } else {
      // Create new category item
      const newCat = {
        id: Date.now(),
        name: form.name,
        slug: form.slug,
        sort_order: form.sort_order,
      };
      updatedList.push(newCat);
      saveCategoriesLocally(updatedList);

      try {
        await axios.post(`${API_BASE}/categories`, form);
      } catch (err) {
        console.warn('Backend POST failed, saved locally');
      }
      toast.success('បានបន្ថែម Category ថ្មីជោគជ័យ!');
    }

    handleCloseModal();
  };

  // Delete Handler: Updates local storage and API
  const handleDelete = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុប Category នេះមែនទេ?')) return;
    
    const updatedList = categories.filter(c => c.id !== id);
    saveCategoriesLocally(updatedList);

    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
    } catch (err) {
      console.warn('Backend DELETE failed, deleted locally');
    }
    toast.success('បានលុប Category រួចរាល់!');
  };

  // Sort Change Handler: Updates local storage and API
  const handleSortChange = async (cat, direction) => {
    const currentSort = cat.sort_order || cat.sort || 1;
    const newSort = direction === 'up' ? currentSort - 1 : currentSort + 1;
    if (newSort < 1) return;

    const updatedList = categories.map(c => 
      c.id === cat.id ? { ...c, sort_order: newSort, sort: newSort } : c
    ).sort((a, b) => (a.sort_order || a.sort || 0) - (b.sort_order || b.sort || 0));

    saveCategoriesLocally(updatedList);

    try {
      await axios.put(`${API_BASE}/categories/${cat.id}`, {
        name: cat.name || cat.title,
        slug: cat.slug,
        sort_order: newSort,
      });
    } catch (err) {
      console.warn('Sort sync with backend failed, saved locally');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 select-none font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiLayers className="text-indigo-600" />
            <span>Product Categories</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Organize items into smartphones, accessories, chargers, and more.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <FiPlus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 font-extrabold text-slate-800 text-sm flex justify-between items-center">
          <span>Categories List ({categories.length})</span>
          {loading && <span className="text-xs text-indigo-600 animate-pulse font-medium">Syncing...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                <th className="px-6 py-4">NAME</th>
                <th className="px-6 py-4">SLUG</th>
                <th className="px-6 py-4">SORT</th>
                <th className="px-6 py-4">PRODUCTS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">
                    No categories found. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {cat.name || cat.title}
                    </td>

                    <td className="px-6 py-4 text-slate-400 font-normal">
                      {cat.slug || '-'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          onClick={() => handleSortChange(cat, 'up')}
                          className="hover:text-indigo-600 transition p-1 bg-slate-100 hover:bg-indigo-50 rounded"
                          title="Move Up"
                        >
                          <FiArrowUp size={12} />
                        </button>
                        <span className="font-bold text-slate-800 w-6 text-center">
                          {cat.sort_order || cat.sort || 1}
                        </span>
                        <button
                          onClick={() => handleSortChange(cat, 'down')}
                          className="hover:text-indigo-600 transition p-1 bg-slate-100 hover:bg-indigo-50 rounded"
                          title="Move Down"
                        >
                          <FiArrowDown size={12} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[11px]">
                        {getProductCount(cat)} Products
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-auto">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <FiLayers className="text-indigo-600" />
                <span>{editId ? 'Edit Category' : 'Add New Category'}</span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smartphones"
                  value={form.name}
                  onChange={handleNameChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. smartphones"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  {editId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}