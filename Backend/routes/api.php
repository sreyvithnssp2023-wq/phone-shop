<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WarrantyController;

/*
|--------------------------------------------------------------------------
| API Routes - Phone Shop Management System
|--------------------------------------------------------------------------
*/

// 👥 Users Route
Route::get('/users', function () {
    try {
        $users = DB::table('users')->select('id', 'name', 'email', 'role')->get();
        return response()->json($users, 200);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
});

// 📊 Dashboard Statistics Route
Route::get('/dashboard', [SaleController::class, 'dashboard']);

// 📈 Reports Routes
Route::get('/reports', [SaleController::class, 'reports']);
Route::get('/report', [SaleController::class, 'reports']);
Route::get('/sales/reports', [SaleController::class, 'reports']);
Route::get('/reports/{type}', [SaleController::class, 'reports']);
Route::get('/report/{type}', [SaleController::class, 'reports']);

// 📱 Product Routes
Route::post('/products/full-add', [SupplierController::class, 'storeProductWithSupplier']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products/{id}', [ProductController::class, 'update']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// 🚚 Supplier Routes
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);
Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

// 🛒 Sale Routes
Route::get('/sales', [SaleController::class, 'index']);
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/sales/{id}', [SaleController::class, 'show']);
Route::delete('/sales/{id}', [SaleController::class, 'destroy']);

// 📁 Category Routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

// 💳 Payment Routes
Route::get('/payments', [PaymentController::class, 'index']);
Route::post('/payments', [PaymentController::class, 'store']);
Route::get('/payments/{id}', [PaymentController::class, 'show']);

// 🛡️ Warranties Routes
Route::apiResource('warranties', WarrantyController::class);

// 🔧 Repair Routes System
Route::prefix('repairs')->group(function () {

    // ១. Fetch បញ្ជី Ticket ទាំងអស់ (GET /api/repairs)
    Route::get('/', function () {
        try {
            $repairs = DB::table('repairs')->orderBy('id', 'desc')->get();
            return response()->json($repairs, 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    });

    // ២. Fetch យក Ticket មួយតាម Ticket Code ឬ ID (GET /api/repairs/{ticket_code})
    Route::get('/{ticket_code}', function ($ticket_code) {
        try {
            $repair = DB::table('repairs')
                ->where('ticket_code', $ticket_code)
                ->orWhere('id', $ticket_code)
                ->first();

            if (!$repair) {
                return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
            }
            return response()->json($repair, 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    });

    // ៣. បង្កើត Ticket ជួសជុលថ្មី (POST /api/repairs)
    Route::post('/', function (Request $request) {
        try {
            $ticketCode = $request->ticket_code ?? ('REP-' . rand(100000, 999999));

            // Map keys គាំទ្រទាំង snake_case និង camelCase
            $customerName  = $request->customer_name ?? $request->customerName ?? '';
            $customerPhone = $request->customer_phone ?? $request->customerPhone ?? '';
            $deviceName    = $request->device_name ?? $request->deviceModel ?? '';
            $cost          = $request->estimated_cost ?? $request->estimatedCost ?? 0;
            $desc          = $request->problem_description ?? $request->problemDescription ?? '';
            $photos        = $request->damage_images ?? $request->beforePhotos ?? [];

            $data = [
                'ticket_code'         => $ticketCode,
                'customer_name'       => $customerName,
                'customer_phone'      => $customerPhone,
                'device_name'         => $deviceName,
                'estimated_cost'      => $cost,
                'problem_description' => $desc,
                'damage_images'       => is_array($photos) ? json_encode($photos) : ($photos ?? '[]'),
                'status'              => $request->status ?? 'Pending',
                'created_at'          => now(),
            ];

            if (Schema::hasColumn('repairs', 'technician_name')) {
                $data['technician_name'] = $request->technician_name ?? $request->technicianName ?? 'Admin (Chork)';
            }

            if (Schema::hasColumn('repairs', 'updated_at')) {
                $data['updated_at'] = now();
            }

            $insertedId = DB::table('repairs')->insertGetId($data);

            return response()->json([
                'success'     => true,
                'message'     => 'Saved successfully!',
                'id'          => $insertedId,
                'ticket_code' => $ticketCode
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'DB Error: ' . $e->getMessage()
            ], 500);
        }
    });

    // ៤. Update ស្ថានភាព ឬព័ត៌មាន Ticket (PUT /api/repairs OR PUT /api/repairs/{ticket_code})
    Route::put('/{ticket_code?}', function (Request $request, $ticket_code = null) {
        try {
            $code = $ticket_code ?? $request->ticket_code ?? $request->id;

            if (!$code) {
                return response()->json(['success' => false, 'message' => 'Ticket code or ID is required'], 400);
            }

            $updateData = [];

            if (Schema::hasColumn('repairs', 'updated_at')) {
                $updateData['updated_at'] = now();
            }

            if ($request->has('status')) $updateData['status'] = $request->status;
            if ($request->has('customer_name') || $request->has('customerName')) {
                $updateData['customer_name'] = $request->customer_name ?? $request->customerName;
            }
            if ($request->has('customer_phone') || $request->has('customerPhone')) {
                $updateData['customer_phone'] = $request->customer_phone ?? $request->customerPhone;
            }
            if ($request->has('device_name') || $request->has('deviceModel')) {
                $updateData['device_name'] = $request->device_name ?? $request->deviceModel;
            }
            if ($request->has('estimated_cost') || $request->has('estimatedCost')) {
                $updateData['estimated_cost'] = $request->estimated_cost ?? $request->estimatedCost;
            }
            if ($request->has('problem_description') || $request->has('problemDescription')) {
                $updateData['problem_description'] = $request->problem_description ?? $request->problemDescription;
            }

            DB::table('repairs')
                ->where('ticket_code', $code)
                ->orWhere('id', $code)
                ->update($updateData);

            return response()->json(['success' => true, 'message' => 'Updated successfully!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()], 500);
        }
    });

    // ៥. លុប Ticket ជួសជុល (DELETE /api/repairs/{ticket_code})
    Route::delete('/{ticket_code}', function ($ticket_code) {
        try {
            DB::table('repairs')
                ->where('ticket_code', $ticket_code)
                ->orWhere('id', $ticket_code)
                ->delete();

            return response()->json(['success' => true, 'message' => 'Deleted successfully!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()], 500);
        }
    });
});
