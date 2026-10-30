import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function HeaderBar({ currentRole }) {
  const location = useLocation();

  // Determine user display name based on currentRole
  const getUserName = () => {
    if (!currentRole) return 'Som Sreyvith';
    if (currentRole.includes('Chork')) return 'Chork Chansovanpanha';
    if (currentRole.toLowerCase().includes('cashier')) return 'Som Sreyvith';
    return 'Som Sreyvith';
  };

  // Map route paths to specific banner titles and descriptions
  const getPageBannerInfo = (path) => {
    switch (path) {
      case '/dashboard':
        return {
          title: `Welcome back, ${getUserName()}!`,
          subtitle: 'Here is your live performance summary for Angkor-Electronic today.',
          showButton: true
        };
      case '/pos':
        return {
          title: 'POS & Sales Terminal',
          subtitle: 'Process customer checkouts, handle product sales, and issue bills.',
          showButton: false
        };
      case '/products':
        return {
          title: 'Product Management',
          subtitle: 'Manage inventory items, stock levels, pricing, and device details.',
          showButton: false
        };
      case '/categories':
        return {
          title: 'Product Categories',
          subtitle: 'Organize items into smartphones, accessories, chargers, and more.',
          showButton: false
        };
      case '/repairs':
        return {
          title: 'Repair Service Management',
          subtitle: 'Track incoming customer device repairs and technician statuses.',
          showButton: false
        };
      case '/notifications':
        return {
          title: 'Notification Management',
          subtitle: 'Manage system notifications for orders, stock alerts, and reminders.',
          showButton: false
        };
      case '/reports':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Generate financial statements, sales metrics, and export data logs.',
          showButton: false
        };
      case '/suppliers':
        return {
          title: 'Suppliers & Stock Management',
          subtitle: 'Coordinate vendor partnerships, purchase records, and restocking.',
          showButton: false
        };
      case '/warranties':
        return {
          title: 'Warranty Tracking & Claims',
          subtitle: 'Verify customer warranty periods and monitor active service claims.',
          showButton: false
        };
      case '/settings':
        return {
          title: 'System Settings',
          subtitle: 'Configure store hours, shop info, backups, and security parameters.',
          showButton: false
        };
      default:
        return {
          title: 'Angkor-Electronic Portal',
          subtitle: 'Phone shop management and point of sale administration system.',
          showButton: false
        };
    }
  };

  const bannerInfo = getPageBannerInfo(location.pathname);

  return (
    <header className="p-6 pb-0">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full border border-white/20 tracking-wider inline-block">
            {currentRole || 'ADMIN'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">
            {bannerInfo.title}
          </h1>
          <p className="text-xs text-blue-100 mt-1 opacity-90 font-medium">
            {bannerInfo.subtitle}
          </p>
        </div>

        {bannerInfo.showButton && (
          <Link
            to="/pos"
            className="bg-white text-blue-600 hover:bg-blue-50 font-black px-5 py-3 rounded-2xl text-xs shadow-md transition-all uppercase tracking-wider shrink-0 flex items-center gap-2"
          >
            <span>Open POS Terminal</span>
            <span>&rarr;</span>
          </Link>
        )}
      </div>
    </header>
  );
}