# 🗄️ Phone Shop MySQL Database Dump

This directory contains the complete and up-to-date MySQL database schema and seed data for the **Phone Shop Management System**.

## 📦 What's Included in `phone-shop.sql`:
- **Categories**: `iOS`, `Android`, `Accessories`, `Tablets`, etc.
- **Products**: All 10 smartphones and accessories with image paths, prices, costs, barcodes/SKUs.
- **Stock Limit**: Enforced max 30 capacity for all items.
- **Warranties**: Complete warranty records for all products.
- **Users & Authentication**: Pre-configured user accounts.
- **Sales & Orders**: Schema for POS transactions and sales tracking.

---

## 🚀 How to Import into Cloud MySQL:

### Option 1: phpMyAdmin / XAMPP (Local)
1. Open `http://localhost/phpmyadmin`.
2. Create or select database `phone-shop` (or `phone_shop`).
3. Click the **Import** tab.
4. Choose file `database/phone-shop.sql` and click **Import**.

### Option 2: TiDB Cloud / Aiven / Railway (Online Cloud MySQL)
1. Open your cloud MySQL dashboard (e.g. TiDB Cloud SQL Editor, Aiven, or DBeaver / TablePlus).
2. Connect using the credentials provided by the cloud service.
3. Open and run the contents of `database/phone-shop.sql`.
4. Done! All tables and data will be created immediately.

