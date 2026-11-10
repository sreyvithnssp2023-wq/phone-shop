import React, { useState } from 'react';
import axios from 'axios';

export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('iOS');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('category', category || 'iOS');
    formData.append('price', price);
    const safeStock = Math.min(30, Math.max(0, Number(stockQty || 0)));
    formData.append('stock_qty', safeStock);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost/phone-shop/Backend/public/api';
      await axios.post(
        `${apiBase}/products`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('បន្ថែមទំនិញ និងរូបភាពជោគជ័យ!');
      setProductName('');
      setPrice('');
      setStockQty('');
      setImageFile(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert('មានបញ្ហាក្នុងការ Upload!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 sm:my-10 p-4 sm:p-6 bg-white rounded-2xl shadow-md border">
      <h2 className="text-xl font-bold mb-6 text-gray-800">📦 បន្ថែមទំនិញថ្មី</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">ឈ្មោះទំនិញ</label>
          <input
            type="text"
            placeholder="ឧទាហរណ៍: iPhone 15 Pro Max"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">ប្រភេទ / Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
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
            <label className="block text-sm font-semibold mb-1">តម្លៃ ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="999.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">ចំនួនស្តុក (Max 30)</label>
            <input
              type="number"
              min="0"
              max="30"
              placeholder="10"
              value={stockQty}
              onChange={(e) => {
                const val = Number(e.target.value);
                setStockQty(val > 30 ? 30 : val);
              }}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Full Stock អតិបរមាត្រឹម 30 គ្រឿង</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">រូបភាពទំនិញ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-1.5 border rounded-xl text-sm bg-slate-50"
          />
        </div>

        {preview && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 mb-1">រូបភាពដែលបានជ្រើសរើស ៖</p>
            <img src={preview} alt="Preview" className="h-32 mx-auto object-cover rounded-xl border shadow-sm" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50 mt-4"
        >
          {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទំនិញ'}
        </button>
      </form>
    </div>
  );
}