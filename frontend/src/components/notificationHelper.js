// Function សម្រាប់បន្ថែម Notification ថ្មី និងរុញទៅកាន់ LocalStorage
export const addNotification = ({ type, title, message, amount, cashier }) => {
  const existingNotifs = JSON.parse(localStorage.getItem('app_notifications') || '[]');
  
  const newNotif = {
    id: Date.now(),
    type, // 'sale' ឬ 'stock'
    title,
    message,
    amount: amount || null,
    cashier: cashier || 'Cashier',
    time: 'ទើបតែឥឡូវ',
    date: new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    isRead: false,
  };

  const updatedNotifs = [newNotif, ...existingNotifs];
  localStorage.setItem('app_notifications', JSON.stringify(updatedNotifs));

  // បាញ់ Event ប្រាប់ទំព័រ Notifications ឱ្យ Update ភ្លាមៗ
  window.dispatchEvent(new Event('notifications_updated'));
};