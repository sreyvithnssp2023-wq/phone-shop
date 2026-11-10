import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch, getImageUrl, getApiBase } from '../api/client';
import { FiRefreshCw, FiSearch, FiAlertCircle, FiPackage, FiLayers } from 'react-icons/fi';

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

export default function PosSale() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [posSortOption, setPosSortOption] = useState('default');

  // 🧾 State សម្រាប់ផ្ទុកទិន្នន័យ Invoice ពេលទិញរួចដើម្បីបង្ហាញ Pop-up
  const [completedSale, setCompletedSale] = useState(null);

  // 🔔 1. Function បាញ់ Notification ទៅកាន់ LocalStorage + Event
  const triggerNotification = (newNotif) => {
    try {
      const existing = JSON.parse(localStorage.getItem('app_notifications') || '[]');
      const updated = [newNotif, ...existing];
      localStorage.setItem('app_notifications', JSON.stringify(updated));

      // បាញ់ Event ប្រាប់ទំព័រ Notifications ឱ្យ Update រក្សាទុកក្នុង LocalStorage
      window.dispatchEvent(new CustomEvent('notifications_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Notification Error:', e);
    }
  };

  // 🔍 2. Function ស្កេនទំនិញណាដែលមានស្តុក <= 5 ឱ្យលោតចូល Notification ស្វ័យប្រវត្តិ
  const scanLowStockProducts = (productList) => {
    if (!Array.isArray(productList) || productList.length === 0) return;

    const existing = JSON.parse(localStorage.getItem('app_notifications') || '[]');
    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    productList.forEach((prod) => {
      const stock = Number(prod.stock_qty ?? prod.stock ?? prod.quantity ?? 0);
      const prodName = prod.product_name || prod.name;

      if (stock > 0 && stock <= 5) {
        const isAlreadyExist = existing.some(
          (n) => n.type === 'stock' && n.message.includes(prodName)
        );

        if (!isAlreadyExist) {
          triggerNotification({
            id: Date.now() + Math.random(),
            type: 'stock',
            title: 'ការព្រមាន ៖ ទំនិញជិតអស់ពីស្តុក (Low Stock Alert)',
            message: `ផលិតផល "${prodName}" នៅសល់ត្រឹមតែ ${stock} គ្រឿងប៉ុណ្ណោះ!`,
            amount: null,
            cashier: 'System Auto',
            time: 'ទើបតែឥឡូវ',
            date: dateStr,
            isRead: false,
          });
        }
      }
    });
  };

  // ទាញយកបញ្ជីទំនិញពិតពី MySQL Backend
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setFetchError(null);
      const res = await apiFetch('/products');
      const productList = Array.isArray(res.data) ? res.data : (res.data.data || []);

      setProducts(productList);
      if (productList && productList.length > 0) {
        scanLowStockProducts(productList);
      }
    } catch (err) {
      console.error('Error fetching POS products:', err);
      setFetchError('មិនអាចភ្ជាប់ទៅកាន់ MySQL Database បានឡើយ! សូមត្រួតពិនិត្យ XAMPP Apache & MySQL។');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const stock = Number(product.stock_qty ?? product.stock ?? product.quantity ?? 0);

    if (stock <= 0) {
      alert('ទំនិញនេះអស់ពីស្តុកហើយ (Out of stock)!');
      return;
    }

    setCart((prevCart) => {
      const pId = product.product_id || product.id;
      const exist = prevCart.find((item) => (item.product_id || item.id) === pId);

      if (exist) {
        if (exist.qty >= stock) {
          alert(`មិនអាចបន្ថែមទៀតបានទេ! ទំនិញនេះសល់ត្រឹមតែ ${stock} ក្នុងស្តុក។`);
          return prevCart;
        }
        return prevCart.map((item) =>
          (item.product_id || item.id) === pId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const increaseQty = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const id = item.product_id || item.id;
        if (id === productId) {
          const stock = Number(item.stock_qty ?? item.stock ?? item.quantity ?? 0);
          if (item.qty + 1 > stock) {
            alert(`ស្តុកមានត្រឹមតែ ${stock} ប៉ុណ្ណោះ!`);
            return item;
          }
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQty = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          const id = item.product_id || item.id;
          if (id === productId) return { ...item, qty: item.qty - 1 };
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // 💳 3. មុខងារ Checkout គិតលុយ
  const handleCheckout = async (paymentMethod) => {
    if (cart.length === 0) {
      alert('សូមជ្រើសរើសទំនិញចូល Cart ជាមុនសិន!');
      return;
    }

    setLoading(true);

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const invoiceNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    // រៀបចំបញ្ជីទំនិញលម្អិតទុកបង្ហាញក្នុង Invoice Modal
    const purchasedItems = cart.map((item) => ({
      name: item.product_name || item.name,
      qty: item.qty,
      price: Number(item.price || 0),
      subtotal: Number(item.price || 0) * item.qty,
    }));

    const finalCustomerName = customerName || 'POS Customer';
    const finalCustomerPhone = customerPhone || 'N/A';
    const finalTotal = totalAmount;

    // 🟢 1. បាញ់ Notification ការលក់/បង់ប្រាក់
    triggerNotification({
      id: Date.now(),
      type: 'sale',
      title: 'ការទូទាត់ប្រាក់ជោគជ័យ (POS Sale)',
      message: `បានលក់ទំនិញសរុប ${totalItems} មុខ (${paymentMethod}) - វិក្កយបត្រ #${invoiceNo}`,
      amount: `$${finalTotal.toFixed(2)}`,
      cashier: finalCustomerName,
      time: 'ទើបតែឥឡូវ',
      date: dateStr,
      isRead: false,
    });

    // 🟡 2. Low Stock Alert
    cart.forEach((item) => {
      const stock = Number(item.stock_qty ?? item.stock ?? item.quantity ?? 0);
      const remainingStock = stock - item.qty;

      if (remainingStock <= 5) {
        triggerNotification({
          id: Date.now() + Math.random(),
          type: 'stock',
          title: 'ការព្រមាន ៖ ទំនិញជិតអស់ពីស្តុក (Low Stock Alert)',
          message: `ផលិតផល "${item.product_name || item.name}" នៅសល់ត្រឹមតែ ${remainingStock} គ្រឿងប៉ុណ្ណោះ!`,
          amount: null,
          cashier: 'System Auto',
          time: 'ទើបតែឥឡូវ',
          date: dateStr,
          isRead: false,
        });
      }
    });

    // 3. ផ្ញើទិន្នន័យទៅកាន់ Backend Database
    try {
      const payload = {
        invoice_no: invoiceNo,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        customer_name: finalCustomerName,
        customer_phone: customerPhone || null,
        items: cart.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.qty,
          unit_price: item.price,
        })),
      };
      await apiFetch('/sales', { method: 'POST', data: payload });
    } catch (err) {
      console.warn('Backend Connection Fail (រក្សាទុកតែ Notification ក្នុង LocalStorage)', err);
    }

    // 4. បើក Pop-up Invoice Modal និងសម្អាត Cart Form
    setShowQrModal(false);
    setCompletedSale({
      invoice_no: invoiceNo,
      customer_name: finalCustomerName,
      customer_phone: finalCustomerPhone,
      payment_method: paymentMethod,
      total_amount: finalTotal,
      date: dateStr,
      items: purchasedItems,
    });

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setLoading(false);
    fetchProducts();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const availableCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.category || p.category_name;
      if (cat) set.add(String(cat).trim());
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (p) => (p.category || p.category_name || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const name = (p.product_name || p.name || '').toLowerCase();
        const cat = (p.category || p.category_name || '').toLowerCase();
        return name.includes(q) || cat.includes(q);
      });
    }

    if (posSortOption === 'price_asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (posSortOption === 'price_desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (posSortOption === 'stock_desc') {
      result.sort((a, b) => Number(b.stock_qty ?? b.stock ?? 0) - Number(a.stock_qty ?? a.stock ?? 0));
    } else if (posSortOption === 'name_asc') {
      result.sort((a, b) => (a.product_name || a.name || '').localeCompare(b.product_name || b.name || ''));
    }

    return result;
  }, [products, selectedCategory, search, posSortOption]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-3 sm:p-6 min-h-screen bg-slate-50 relative font-sans select-none">
      {/* 🖨️ CSS សម្រាប់ Print តែស្លឹកវិក្កយបត្រ Invoice */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-invoice, .printable-invoice * { visibility: visible !important; }
          .printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10px !important;
          }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      {/* ផ្នែកខាងឆ្វេង៖ បញ្ជីទំនិញ */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">POS Sale</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
              {productsLoading ? '...' : `${products.length} products`}
            </span>
          </div>
          <button
            onClick={fetchProducts}
            disabled={productsLoading}
            title="Refresh from Database"
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Reload</span>
          </button>
        </div>

        {fetchError && (
          <div className="mb-4 bg-red-50 p-3.5 rounded-xl border border-red-200 flex items-center justify-between gap-2 text-red-700 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchProducts}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shrink-0"
            >
              ម្តងទៀត
            </button>
          </div>
        )}

        {/* 🔍 Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <select
              value={posSortOption}
              onChange={(e) => setPosSortOption(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium"
            >
              <option value="default">Default Sort</option>
              <option value="price_asc">Price: Low ➔ High</option>
              <option value="price_desc">Price: High ➔ Low</option>
              <option value="stock_desc">Stock: High ➔ Low</option>
              <option value="name_asc">Name: A ➔ Z</option>
            </select>
          </div>
        </div>

        {/* 🏷️ Category Filter Chips (e.g. iPhone in iOS category) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <FiLayers className="w-3.5 h-3.5" /> Category:
          </span>

          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({products.length})
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
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 🟢 Grid បង្ហាញផលិតផល ឬ Skeleton Loading ពេលកំពុងទាញយកទិន្នន័យ */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={`pos-skel-${i}`}
                className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-5 w-14 bg-indigo-100 rounded-full animate-pulse" />
                </div>
                <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center animate-pulse border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse mb-1.5" />
                <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
            <FiPackage className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">
              {search || selectedCategory !== 'ALL'
                ? 'រកមិនឃើញទំនិញដែលស្វែងរកឡើយ'
                : 'គ្មានទំនិញក្នុងស្តុក Database ឡើយ'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search || selectedCategory !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSearch('');
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Reset Filter
                </button>
              ) : (
                'សូមបញ្ចូលទំនិញថ្មីទៅក្នុង MySQL'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const pId = p.product_id || p.id;
              const rawStock = Number(p.stock_qty ?? p.stock ?? p.quantity ?? 0);
              const stock = Math.min(MAX_STOCK_CAPACITY, Math.max(0, rawStock));
              const isFull = stock >= MAX_STOCK_CAPACITY;
              const isLow = stock > 0 && stock <= 5;
              const name = p.product_name || p.name;
              const price = Number(p.price || 0);
              const categoryVal = p.category || p.category_name || 'General';
              const imageUrl = getImageUrl(p.image);
              const isImageBroken = failedImages[pId];

              return (
                <div
                  key={pId}
                  onClick={() => addToCart(p)}
                  className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-slate-200 transition cursor-pointer hover:shadow-md hover:border-indigo-500 relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          isFull
                            ? 'bg-emerald-600 text-white'
                            : stock > 0
                            ? isLow
                              ? 'bg-amber-500 text-white'
                              : 'bg-black text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isFull ? `Full (${MAX_STOCK_CAPACITY})` : stock > 0 ? `${stock} left` : 'Out of stock'}
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        ${price.toFixed(2)}
                      </span>
                    </div>

                    <div className="h-28 bg-slate-100 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden border border-slate-100">
                      {imageUrl && !isImageBroken ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-contain p-2"
                          onError={() => setFailedImages((prev) => ({ ...prev, [pId]: true }))}
                        />
                      ) : (
                        <span className="text-3xl">📱</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm truncate text-slate-800">{name}</h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${getCategoryBadgeStyle(categoryVal)}`}>
                      {categoryVal}
                    </span>
                    <span className="text-slate-400 font-semibold">{stock}/{MAX_STOCK_CAPACITY} pcs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ផ្នែកខាងស្តាំ៖ Cart & Checkout */}
      <div className="w-full lg:w-96 shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between self-start lg:sticky lg:top-6">
        <div>
          <h2 className="text-lg font-bold mb-4 text-slate-800">🛒 Cart ({cart.length})</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">Add products to start a sale.</p>
            ) : (
              cart.map((item) => {
                const id = item.product_id || item.id;
                return (
                  <div key={id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 truncate">{item.product_name || item.name}</div>
                      <div className="text-gray-500 text-xs">${item.price} x {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => decreaseQty(id)}
                        className="px-2 py-0.5 bg-gray-200 rounded font-bold hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-800">{item.qty}</span>
                      <button
                        onClick={() => increaseQty(id)}
                        className="px-2 py-0.5 bg-gray-200 rounded font-bold hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-bold text-lg text-slate-900">
              <span>Total:</span>
              <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Items Count:</span>
              <span>{totalItems}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Customer Phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-xs font-semibold text-gray-500 mb-1">Payment Method:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Cash')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              Cash (សាច់ប្រាក់)
            </button>
            <button
              disabled={loading || cart.length === 0}
              onClick={() => {
                if (cart.length === 0) {
                  alert('សូមជ្រើសរើសទំនិញចូល Cart ជាមុនសិន!');
                  return;
                }
                setShowQrModal(true);
              }}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              KHQR (ABA Pay)
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100 text-center relative my-auto">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">ស្កែនដើម្បីបង់ប្រាក់</h3>
            <p className="text-xs text-slate-400 mb-4">ABA KHQR / Bakong Pay</p>

            <div className="bg-red-50/50 p-4 rounded-2xl inline-block border border-red-100 mb-4 max-w-full">
              <img
                src={getImageUrl('uploads/products/QR.jpg') || `${getApiBase().replace(/\/api\/?$/, '')}/uploads/products/QR.jpg`}
                alt="ABA KHQR Code"
                className="w-48 sm:w-56 max-w-full h-auto mx-auto rounded-xl shadow-sm object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PhoneShopPayment';
                }}
              />
            </div>

            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-400 block">ទឹកប្រាក់សរុបត្រូវបង់</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-600">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCheckout('ABA KHQR')}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? 'Processing...' : '✓ បង់រួចរាល់'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 POP-UP INVOICE RECEIPT MODAL (បង្ហាញភ្លាមៗពេលទិញរួច) */}
      {completedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto">
            
            {/* Header Controls */}
            <div className="flex justify-between items-center no-print-btn">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ✓ ការទូទាត់ប្រាក់ជោគជ័យ
              </span>
              <button
                onClick={() => setCompletedSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* សន្លឹកវិក្កយបត្រ (Printable Area) */}
            <div className="printable-invoice bg-white p-4 border border-slate-200 rounded-2xl space-y-3 text-slate-800 text-xs">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-black uppercase text-slate-900">ANGKOR-ELECTRONIC</h2>
                <p className="text-[10px] text-slate-500 font-semibold">Phone Shop & Management System</p>
                <p className="text-[10px] text-slate-400">Tel: 012 345 678 | Date: {completedSale.date}</p>
              </div>

              <div className="flex justify-between text-[11px] font-medium border-b pb-2">
                <div>
                  <p className="text-slate-500">Invoice No: <strong className="text-indigo-600">#{completedSale.invoice_no}</strong></p>
                  <p className="text-slate-500">Customer: <strong>{completedSale.customer_name}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Payment: <strong>{completedSale.payment_method}</strong></p>
                  <p className="text-slate-500">Phone: <strong>{completedSale.customer_phone}</strong></p>
                </div>
              </div>

              {/* បញ្ជីទំនិញលម្អិត (Purchased Items Table) */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {completedSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-bold text-slate-800">{item.name}</td>
                      <td className="py-1.5 text-center font-semibold">{item.qty}</td>
                      <td className="py-1.5 text-right text-slate-600">${item.price.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-black text-slate-900">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-2 flex justify-between items-center text-sm font-black">
                <span>Grand Total:</span>
                <span className="text-indigo-600">${completedSale.total_amount.toFixed(2)}</span>
              </div>

              <div className="text-center text-[9px] text-slate-400 pt-2 border-t">
                <p>Thank you for shopping with Angkor-Electronic!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 no-print-btn pt-2">
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                បិទ (Close)
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200"
              >
                🖨️ បោះពុម្ព (Print Receipt)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
