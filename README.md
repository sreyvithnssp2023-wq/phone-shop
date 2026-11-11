# 📱 Angkor Electronic - Phone Shop Management System

A full-stack Phone Shop management web application featuring POS Sales, Product Catalog (with iOS, Android, Tablets, Accessories categories), Warranty Management, and Inventory Control (Max 30 full stock capacity).

---

## 🏗️ Project Architecture & Folder Structure

```
phone-shop/
├── package.json                      # Monorepo build orchestrator (builds frontend)
├── vercel.json                       # Vercel configuration for SPA routing & CRA build
├── render.yaml                       # Render Infrastructure-as-Code Blueprint
├── Dockerfile                        # Dockerfile for Render / Cloud backend deployment
├── .dockerignore                     # Docker build ignore rules
├── README.md                         # Project documentation and deployment guides
│
├── database/                         # 🗄️ SQL Database
│   ├── phone-shop.sql                # Complete MySQL dump (10 products, categories, warranties, users)
│   └── README.md                     # Database import instructions
│
├── frontend/                         # ⚡ React SPA (Deployed to Vercel)
│   ├── package.json                  # React 19 dependencies & scripts
│   ├── vercel.json                   # Subfolder Vercel SPA configuration
│   ├── .env.example                  # Environment variables guide
│   ├── public/                       # Static public assets
│   └── src/                          # React components, pages, and API client
│
└── Backend/                          # 🚀 Laravel 12 API (Deployed to Render / Railway)
    ├── Dockerfile                    # Subfolder Dockerfile for standalone Laravel builds
    ├── Procfile                      # Procfile for Railway/Heroku
    ├── .env.example                  # Laravel environment template
    ├── app/                          # Controllers, Models, Middleware
    ├── config/                       # Laravel configuration
    ├── database/                     # Migrations & seeders
    ├── public/
    │   └── uploads/products/         # Product images
    ├── routes/
    │   └── api.php                   # REST API routes (/api/products, /api/users, etc.)
    └── storage/                      # Laravel logs & framework cache
```

---

## ⚡ 1. Frontend Deployment (Vercel)

### Method A: Monorepo Root (Automatic)
The root `vercel.json` and `package.json` are already configured to build the React app automatically from the root.

### Method B: Subfolder Settings (Recommended)
1. In Vercel Project Settings ➔ **General**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App`
   - **Output Directory**: `build`
2. In **Environment Variables**:
   - Add: `REACT_APP_API_BASE_URL` = `https://angkorelectronic.onrender.com/api` (Type: **Config**)
   - Select: **Production**, **Preview**, **Development**
3. Redeploy.

---

## 🚀 2. Backend Deployment (Render)

1. Connect this GitHub repository to Render as a **Web Service**.
2. Render uses the root `Dockerfile` automatically (PHP 8.2 Alpine + Composer + PDO MySQL).
3. Under **Environment**, configure:
   ```env
   APP_NAME="Phone Shop"
   APP_ENV=production
   APP_KEY=base64:7Kx8XG3V1/2yJ9mK8uN7Q0vP5wR4tS3u1vX0yZ2aB4c=
   APP_DEBUG=false
   APP_URL=https://angkorelectronic.onrender.com

   DB_CONNECTION=mysql
   DB_HOST=<your-cloud-mysql-host>
   DB_PORT=3306
   DB_DATABASE=<your-database-name>
   DB_USERNAME=<your-database-username>
   DB_PASSWORD=<your-database-password>
   ```

---

## 🗄️ 3. Cloud MySQL Database

1. Create a free MySQL database on [TiDB Cloud](https://tidbcloud.com), [Aiven](https://aiven.io), or [Railway](https://railway.app).
2. Import `database/phone-shop.sql` into your cloud database.
3. Supply the database credentials to Render.

---

## 💻 Local Development Setup

### Backend (Laravel)
```bash
cd Backend
composer install
php artisan serve
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000` and proxies requests to `http://localhost/phone-shop/Backend/public/api`.

