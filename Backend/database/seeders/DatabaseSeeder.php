<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================================
        // 1. USERS (staff accounts)
        // ============================================================
        if (Schema::hasTable('users')) {
            if (DB::table('users')->count() === 0) {
                $userCols = Schema::getColumnListing('users');
                $users = [
                    [
                        'name'       => 'Chork Chansovanpanha',
                        'email'      => 'admin@gmail.com',
                        'password'   => Hash::make('password'),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'name'       => 'Brovith',
                        'email'      => 'cashier@gmail.com',
                        'password'   => Hash::make('password'),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'name'       => 'Marivith (Technician)',
                        'email'      => 'tech@gmail.com',
                        'password'   => Hash::make('password'),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ];

                foreach ($users as $user) {
                    $row = array_intersect_key($user, array_flip($userCols));
                    // Add role columns if they exist in the table
                    if (in_array('role', $userCols)) {
                        $row['role'] = str_contains($user['email'], 'admin') ? 'Admin' : 'Cashier';
                    }
                    if (in_array('roles', $userCols)) {
                        $row['roles'] = str_contains($user['email'], 'admin') ? 'Admin' : 'Cashier';
                    }
                    try {
                        DB::table('users')->insert($row);
                    } catch (\Throwable $e) {
                        // Skip duplicates
                    }
                }
            }
        }

        // ============================================================
        // 2. CATEGORIES
        // ============================================================
        if (Schema::hasTable('categories') && DB::table('categories')->count() === 0) {
            $catCols = Schema::getColumnListing('categories');
            $categories = ['Phones', 'Accessories', 'Tablets', 'Laptops', 'iOS', 'Android'];

            foreach ($categories as $cat) {
                $data = ['created_at' => now(), 'updated_at' => now()];
                if (in_array('title', $catCols))         $data['title']         = $cat;
                if (in_array('name', $catCols))          $data['name']          = $cat;
                if (in_array('category_name', $catCols)) $data['category_name'] = $cat;
                try {
                    DB::table('categories')->insert($data);
                } catch (\Throwable $e) {
                    // Skip duplicates
                }
            }
        }

        // ============================================================
        // 3. SUPPLIERS
        // ============================================================
        if (Schema::hasTable('suppliers') && DB::table('suppliers')->count() === 0) {
            try {
                DB::table('suppliers')->insert([
                    [
                        'name'           => 'ក្រុមហ៊ុន អង្គរ អេឡិចត្រូនិច',
                        'contact_person' => 'លោក សុខា',
                        'phone'          => '012 345 678',
                        'email'          => 'supplier@angkor.com',
                        'address'        => 'រាជធានីភ្នំពេញ, កម្ពុជា',
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ],
                    [
                        'name'           => 'ហាង ខ្មែរ តិចណូឡូជី',
                        'contact_person' => 'កញ្ញា បុប្ផា',
                        'phone'          => '098 765 432',
                        'email'          => 'tech@khmer.com',
                        'address'        => 'ខេត្តសៀមរាប, កម្ពុជា',
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ],
                ]);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // ============================================================
        // 4. PRODUCTS (sample demo data)
        // ============================================================
        if (Schema::hasTable('products') && DB::table('products')->count() === 0) {
            $products = [
                // --- PHONES ---
                ['name' => 'iPhone 16 Pro Max 256GB (Black Titanium)',   'category' => 'iOS',         'barcode' => 'IP16PM-256-BLK',  'price' => 1299.00, 'cost' => 1050.00, 'stock' => 20],
                ['name' => 'Samsung Galaxy S24 Ultra 512GB',             'category' => 'Android',     'barcode' => 'SS-S24U-512',     'price' => 1180.00, 'cost' =>  980.00, 'stock' => 15],
                ['name' => 'Xiaomi 14 Ultra 512GB (White)',              'category' => 'Android',     'barcode' => 'MI-14U-512',      'price' =>  890.00, 'cost' =>  750.00, 'stock' => 10],
                // --- ACCESSORIES ---
                ['name' => 'AirPods Pro (2nd Gen)',                      'category' => 'Accessories', 'barcode' => 'ACC-APP2-01',     'price' =>  229.00, 'cost' =>  180.00, 'stock' => 30],
                ['name' => 'Anker 65W Fast Charger',                     'category' => 'Accessories', 'barcode' => 'ANK-65W-USB',     'price' =>   29.00, 'cost' =>   18.00, 'stock' => 25],
                ['name' => 'Apple Watch Series 9 45mm',                  'category' => 'Accessories', 'barcode' => 'AW-S9-45-BLK',   'price' =>  399.00, 'cost' =>  320.00, 'stock' => 12],
                // --- TABLETS ---
                ['name' => 'iPad Pro 11-inch M4 256GB WiFi',             'category' => 'Tablets',     'barcode' => 'IPAD-M4-256',     'price' =>  999.00, 'cost' =>  880.00, 'stock' =>  8],
                ['name' => 'Samsung Galaxy Tab S9 Ultra 256GB',          'category' => 'Tablets',     'barcode' => 'SAMSUNG-TABS9U',  'price' =>  950.00, 'cost' =>  820.00, 'stock' =>  6],
                // --- LAPTOPS ---
                ['name' => 'MacBook Air 13-inch M3 (8GB / 256GB)',       'category' => 'Laptops',     'barcode' => 'MBA-M3-256-SLV',  'price' => 1099.00, 'cost' =>  920.00, 'stock' => 10],
                ['name' => 'ASUS ROG Zephyrus G16 Gaming Laptop',        'category' => 'Laptops',     'barcode' => 'ASUS-ROG-G16',    'price' => 1599.00, 'cost' => 1350.00, 'stock' =>  5],
            ];

            foreach ($products as $p) {
                try {
                    DB::table('products')->insert(array_merge($p, [
                        'image'      => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        }
    }
}
