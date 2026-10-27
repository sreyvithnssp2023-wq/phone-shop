import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import HeaderBar from './components/HeaderBar';

// Import Pages / Views
import Dashboard from './components/dashboard.jsx';
import POS from './components/POS.jsx';             // ឬ pos.jsx
import Products from './components/products.jsx';     // ឬ Products.jsx
import Categories from './components/categories.jsx';
import Report from './components/report.jsx';         // 🟢 ទំព័រ Report 
import Suppliers from './components/suppliers.jsx';   // ឬ Suppliers.jsx
import Warranties from './components/Warranties.jsx';  // ឬ warranties.jsx
import EditProduct from './components/EditProduct.jsx';
import Login from './components/login.jsx';
import Logout from './components/logout.jsx';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100">
        <Navbar />

        <div className="flex-1 flex flex-col min-w-0">
          <HeaderBar />

          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/report" element={<Report />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/warranties" element={<Warranties />} />
              <Route path="/edit-product" element={<EditProduct />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}