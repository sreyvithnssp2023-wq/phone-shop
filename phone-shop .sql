-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2026 at 05:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `phone-shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `title`, `created_at`, `updated_at`) VALUES
(1, 'Phones', '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(2, 'Accessories', '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(3, 'Tablets', '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(4, 'Laptops', '2026-10-17 05:14:11', '2026-10-17 05:14:11');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_26_151349_create_posts_table', 1),
(5, '2026_08_26_151755_create_categories_table', 1),
(6, '2026_08_26_152347_create_tags_table', 1),
(7, '2026_10_13_170657_add_customer_name_to_sales_table', 1),
(8, '2026_10_17_093053_create_warranties_table', 1),
(9, '2026_10_17_101836_create_products_table', 1),
(10, '2026_10_17_103134_create_sales_table', 1),
(11, '2026_10_17_103656_create_sale_items_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `price`, `cost`, `stock`, `image`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 15 Pro Max', 'Phones', '123456789', 1200.00, 1000.00, 0, NULL, '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(2, 'Smart Fitness Watch', 'Accessories', '987654321', 89.00, 50.00, 66, NULL, '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(3, 'Cotton Graphic T-Shirt', 'Accessories', '112233445', 19.99, 10.00, 8, NULL, '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(4, 'iPhone 16 Pro Max 256GB', NULL, NULL, 1199.00, 0.00, 8, 'uploads/products/1792214364_1792172061_iphone16.jpg', '2026-10-17 05:19:24', '2026-10-17 05:19:24'),
(5, 'Samsung Galaxy S24 Ultra 512GB', NULL, NULL, 1180.00, 0.00, 25, 'uploads/products/1792215129_Samsung Galaxy S24 Ultra 512GB in Titanium Violet _ Verizon (with 36 monthly installment payments + plan).jpg', '2026-10-17 05:32:09', '2026-10-17 05:32:09'),
(6, 'iPad Air 11-inch M2 Wi-Fi 128GB Starlight', NULL, NULL, 599.00, 0.00, 28, 'uploads/products/1792250427_iPad Air 11-inches (2024) 6th gen 128 GB - Wi-Fi - Starlight.jpg', '2026-10-17 15:20:27', '2026-10-17 15:20:27'),
(7, 'UAG Monarch Pro Case for iPhone 16 Pro Max', NULL, NULL, 55.00, 0.00, 29, 'uploads/products/1792250931_Monarch Pro Case with MagSafe for iPhone 16 Pro _ Shop Now.jpg', '2026-10-17 15:28:51', '2026-10-17 15:28:51'),
(8, 'JBL Charge 5 Portable Bluetooth Speaker', NULL, NULL, 169.00, 0.00, 25, 'uploads/products/1792251308_JBL Flip7 Speaker.jpg', '2026-10-17 15:35:08', '2026-10-17 15:35:08');

-- --------------------------------------------------------

--
-- Table structure for table `repairs`
--

CREATE TABLE `repairs` (
  `id` int(11) NOT NULL,
  `ticket_code` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `device_name` varchar(100) NOT NULL,
  `estimated_cost` decimal(10,2) DEFAULT 0.00,
  `problem_description` text DEFAULT NULL,
  `damage_images` longtext DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending',
  `technician_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(255) NOT NULL DEFAULT 'khqr',
  `status` varchar(255) NOT NULL DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `invoice_number`, `customer_name`, `customer_phone`, `total_amount`, `paid_amount`, `change_amount`, `payment_method`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'POS Customer', NULL, 48000.00, 48000.00, 0.00, 'ABA KHQR', 'completed', '2026-10-17 05:21:05', '2026-10-17 05:21:05'),
(2, NULL, 'POS Customer', NULL, 1288.00, 1288.00, 0.00, 'ABA KHQR', 'completed', '2026-10-17 05:26:43', '2026-10-17 05:26:43'),
(3, NULL, 'POS Customer', NULL, 89.00, 89.00, 0.00, 'Cash', 'completed', '2026-10-17 05:27:04', '2026-10-17 05:27:04'),
(4, NULL, 'POS Customer', 'N/A', 89.00, 89.00, 0.00, 'ABA KHQR', 'completed', '2026-10-17 11:19:38', '2026-10-17 11:19:38'),
(5, NULL, 'POS Customer', 'N/A', 144.00, 144.00, 0.00, 'ABA KHQR', 'completed', '2026-10-17 15:50:02', '2026-10-17 15:50:02'),
(6, NULL, 'POS Customer', 'N/A', 599.00, 599.00, 0.00, 'Cash', 'completed', '2026-10-30 15:33:29', '2026-10-30 15:33:29'),
(7, NULL, 'POS Customer', 'N/A', 1199.00, 1199.00, 0.00, 'ABA KHQR', 'completed', '2026-10-30 15:33:51', '2026-10-30 15:33:51'),
(8, NULL, 'POS Customer', 'N/A', 169.00, 169.00, 0.00, 'ABA KHQR', 'completed', '2026-10-30 15:44:32', '2026-10-30 15:44:32'),
(9, NULL, 'POS Customer', 'N/A', 169.00, 169.00, 0.00, 'Cash', 'completed', '2026-10-30 15:51:48', '2026-10-30 15:51:48'),
(10, NULL, 'POS Customer', 'N/A', 599.00, 599.00, 0.00, 'ABA KHQR', 'completed', '2026-10-30 15:57:38', '2026-10-30 15:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `quantity`, `price`, `total`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'iPhone 15 Pro Max', 40, 1200.00, 48000.00, '2026-10-17 05:21:05', '2026-10-17 05:21:05'),
(2, 2, 4, 'iPhone 16 Pro Max 256GB', 1, 1199.00, 1199.00, '2026-10-17 05:26:43', '2026-10-17 05:26:43'),
(3, 2, 2, 'Smart Fitness Watch', 1, 89.00, 89.00, '2026-10-17 05:26:43', '2026-10-17 05:26:43'),
(4, 3, 2, 'Smart Fitness Watch', 1, 89.00, 89.00, '2026-10-17 05:27:04', '2026-10-17 05:27:04'),
(5, 4, 2, 'Smart Fitness Watch', 1, 89.00, 89.00, '2026-10-17 11:19:38', '2026-10-17 11:19:38'),
(6, 5, 2, 'Smart Fitness Watch', 1, 89.00, 89.00, '2026-10-17 15:50:02', '2026-10-17 15:50:02'),
(7, 5, 7, 'UAG Monarch Pro Case for iPhone 16 Pro Max', 1, 55.00, 55.00, '2026-10-17 15:50:02', '2026-10-17 15:50:02'),
(8, 6, 6, 'iPad Air 11-inch M2 Wi-Fi 128GB Starlight', 1, 599.00, 599.00, '2026-10-30 15:33:29', '2026-10-30 15:33:29'),
(9, 7, 4, 'iPhone 16 Pro Max 256GB', 1, 1199.00, 1199.00, '2026-10-30 15:33:51', '2026-10-30 15:33:51'),
(10, 8, 8, 'JBL Charge 5 Portable Bluetooth Speaker', 1, 169.00, 169.00, '2026-10-30 15:44:32', '2026-10-30 15:44:32'),
(11, 9, 8, 'JBL Charge 5 Portable Bluetooth Speaker', 1, 169.00, 169.00, '2026-10-30 15:51:48', '2026-10-30 15:51:48'),
(12, 10, 6, 'iPad Air 11-inch M2 Wi-Fi 128GB Starlight', 1, 599.00, 599.00, '2026-10-30 15:57:38', '2026-10-30 15:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `company_name`, `contact_person`, `phone`, `phone_number`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'ក្រុមហ៊ុន អង្គរ អេឡិចត្រូនិច', NULL, 'លោក សុខា', '012 345 678', NULL, 'supplier@angkor.com', 'រាជធានីភ្នំពេញ, កម្ពុជា', '2026-10-17 05:14:11', '2026-10-17 05:14:11'),
(2, 'ហាង ខ្មែរ តិចណូឡូជី', NULL, 'កញ្ញា បុប្ផា', '098 765 432', NULL, 'tech@khmer.com', 'ខេត្តសៀមរាប, កម្ពុជា', '2026-10-17 05:14:11', '2026-10-17 05:14:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Cashier',
  `roles` varchar(50) NOT NULL DEFAULT 'Cashier',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `roles`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Chork Chansovanpanha', 'admin@gmail.com', 'Admin (Chork)', 'Cashier', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.XWGmMi', NULL, NULL, NULL),
(2, 'Srey vith (Cashier)', 'cashier@gmail.com', 'Cashier', 'Cashier', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.XWGmMi', NULL, NULL, NULL),
(3, 'Harivith (Technician)', 'tech@gmail.com', 'Technician (Fixer)', 'Cashier', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.XWGmMi', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warranties`
--

CREATE TABLE `warranties` (
  `warranty_id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `imei_serial` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `warranty_months` int(11) NOT NULL DEFAULT 12,
  `expiry_date` date NOT NULL,
  `warranty_type` enum('Store','Official') NOT NULL DEFAULT 'Store',
  `issue_description` text DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Replaced','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warranties`
--

INSERT INTO `warranties` (`warranty_id`, `customer_name`, `customer_phone`, `imei_serial`, `product_name`, `invoice_number`, `purchase_date`, `warranty_months`, `expiry_date`, `warranty_type`, `issue_description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'អតិថិជនទូទៅ', 'N/A', '123456789', 'iPhone 15 Pro Max', 'INV-1792251507-1', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(2, 'អតិថិជនទូទៅ', 'N/A', '987654321', 'Smart Fitness Watch', 'INV-1792251507-2', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(3, 'អតិថិជនទូទៅ', 'N/A', '112233445', 'Cotton Graphic T-Shirt', 'INV-1792251507-3', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(4, 'អតិថិជនទូទៅ', 'N/A', 'SN-0004', 'iPhone 16 Pro Max 256GB', 'INV-1792251507-4', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(5, 'អតិថិជនទូទៅ', 'N/A', 'SN-0005', 'Samsung Galaxy S24 Ultra 512GB', 'INV-1792251507-5', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(6, 'អតិថិជនទូទៅ', 'N/A', 'SN-0006', 'iPad Air 11-inch M2 Wi-Fi 128GB Starlight', 'INV-1792251507-6', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(7, 'អតិថិជនទូទៅ', 'N/A', 'SN-0007', 'UAG Monarch Pro Case for iPhone 16 Pro Max', 'INV-1792251507-7', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27'),
(8, 'អតិថិជនទូទៅ', 'N/A', 'SN-0008', 'JBL Charge 5 Portable Bluetooth Speaker', 'INV-1792251507-8', '2026-10-17', 12, '2027-10-17', 'Store', 'ទំនិញក្នុងស្តុក (Auto Created)', 'Pending', '2026-10-17 15:38:27', '2026-10-17 15:38:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_title_unique` (`title`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `repairs`
--
ALTER TABLE `repairs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_code` (`ticket_code`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_sale_id_foreign` (`sale_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `warranties`
--
ALTER TABLE `warranties`
  ADD PRIMARY KEY (`warranty_id`),
  ADD KEY `warranties_imei_serial_index` (`imei_serial`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `repairs`
--
ALTER TABLE `repairs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warranties`
--
ALTER TABLE `warranties`
  MODIFY `warranty_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
