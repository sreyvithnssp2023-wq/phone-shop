<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ProductController extends Controller
{
    // ១. ទាញយកបញ្ជីទំនិញទាំងអស់ (សម្រាប់ React បង្ហាញក្នុង Table)
    public function index()
    {
        try {
            if (!Schema::hasTable('products')) {
                return response()->json([]);
            }

            $cols  = Schema::getColumnListing('products');
            $idCol = in_array('id', $cols) ? 'id' : $cols[0];

            $products = DB::table('products')
                ->orderBy($idCol, 'desc')
                ->get()
                ->map(function ($p) use ($idCol) {
                    $pName      = $p->name ?? $p->product_name ?? '';
                    $rawStock   = (int) ($p->stock ?? $p->stock_qty ?? 0);
                    // 🟢 ចំនួនស្តុក Full Stock អតិបរមាត្រឹមតែ 30 គ្រឿង
                    $stockQty   = min(30, max(0, $rawStock));
                    $barcodeVal = $p->barcode ?? $p->sku ?? 'N/A';
                    $catVal     = $p->category ?? $p->category_id ?? 'General';
                    $warranty   = (int) ($p->warranty_months ?? $p->warranty ?? 0);

                    return [
                        'id'              => $p->$idCol ?? $p->id ?? 0,
                        'name'            => $pName,
                        'product_name'    => $pName,
                        'title'           => $pName,
                        'category'        => $catVal,
                        'category_name'   => $catVal,
                        'sku'             => $barcodeVal,
                        'barcode'         => $barcodeVal,
                        'price'           => (float) ($p->price ?? 0),
                        'cost'            => (float) ($p->cost ?? 0),
                        'stock'           => (int) $stockQty,
                        'stock_qty'       => (int) $stockQty,
                        'max_stock'       => 30,
                        'is_full_stock'   => $stockQty >= 30,
                        'warranty_months' => $warranty,
                        'status'          => $stockQty >= 30 ? 'Full Stock' : ($stockQty > 0 ? 'In Stock' : 'Out of Stock'),
                        'image'           => $p->image ?? null,
                        'created_at'      => $p->created_at ?? null,
                        'updated_at'      => $p->updated_at ?? null,
                    ];
                });

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ២. បន្ថែមទំនិញថ្មី + រូបភាព + បង្កើតប័ណ្ណធានាស្វ័យប្រវត្តិ (Auto-Warranty Record)
    public function store(Request $request)
    {
        $request->validate([
            'price' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            $cols = Schema::getColumnListing('products');
            $data = [];

            // ឈ្មោះទំនិញ
            $pName = $request->product_name ?? $request->name ?? 'ទំនិញថ្មី';
            if (in_array('name', $cols)) {
                $data['name'] = $pName;
            } elseif (in_array('product_name', $cols)) {
                $data['product_name'] = $pName;
            }

            // ប្រភេទទំនិញ
            if (in_array('category', $cols)) {
                $data['category'] = $request->category ?? 'General';
            } elseif (in_array('category_id', $cols)) {
                $data['category_id'] = $request->category_id ?? $request->category;
            }

            // SKU / Barcode
            $barcodeVal = $request->barcode ?? $request->sku;
            if (in_array('barcode', $cols)) {
                $data['barcode'] = $barcodeVal;
            } elseif (in_array('sku', $cols)) {
                $data['sku'] = $barcodeVal;
            }

            // តម្លៃដើម និង តម្លៃលក់
            if (in_array('cost', $cols)) {
                $data['cost'] = $request->cost ?? 0;
            }
            if (in_array('price', $cols)) {
                $data['price'] = $request->price ?? 0;
            }

            // ចំនួនស្តុក (Full Stock អតិបរមាត្រឹម 30 គ្រឿង)
            $stockVal = min(30, max(0, (int) ($request->stock_qty ?? $request->stock ?? 0)));
            if (in_array('stock', $cols)) {
                $data['stock'] = $stockVal;
            } elseif (in_array('stock_qty', $cols)) {
                $data['stock_qty'] = $stockVal;
            }

            // រយៈពេលធានា (គិតជាខែ)
            $warrantyMonths = (int) ($request->warranty_months ?? $request->warranty ?? 0);
            if (in_array('warranty_months', $cols)) {
                $data['warranty_months'] = $warrantyMonths;
            } elseif (in_array('warranty', $cols)) {
                $data['warranty'] = $warrantyMonths;
            }

            // រូបភាព
            if ($request->hasFile('image') && in_array('image', $cols)) {
                $imageDir = public_path('uploads/products');
                if (!file_exists($imageDir)) {
                    @mkdir($imageDir, 0777, true);
                }
                $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
                $request->file('image')->move($imageDir, $imageName);
                $data['image'] = 'uploads/products/' . $imageName;
            }

            if (in_array('created_at', $cols)) $data['created_at'] = now();
            if (in_array('updated_at', $cols)) $data['updated_at'] = now();

            $id = DB::table('products')->insertGetId($data);

            // 🛡️ បង្កើតទិន្នន័យការធានាចូល Table warranties ដោយស្វ័យប្រវត្តិ
            if ($warrantyMonths > 0 && Schema::hasTable('warranties')) {
                try {
                    $wCols = Schema::getColumnListing('warranties');
                    $warrantyData = [];
                    $serial = $barcodeVal ?: ('SN-' . sprintf('%04d', $id));

                    if (in_array('product_id', $wCols))        $warrantyData['product_id']        = $id;
                    if (in_array('product_name', $wCols))      $warrantyData['product_name']      = $pName;
                    if (in_array('customer_name', $wCols))      $warrantyData['customer_name']      = $request->customer_name ?? 'អតិថិជនទូទៅ';
                    if (in_array('customer_phone', $wCols))     $warrantyData['customer_phone']     = $request->customer_phone ?? 'N/A';
                    if (in_array('imei_serial', $wCols))       $warrantyData['imei_serial']       = $serial;
                    if (in_array('serial_number', $wCols))     $warrantyData['serial_number']     = $serial;
                    if (in_array('invoice_number', $wCols))    $warrantyData['invoice_number']    = 'INV-' . time() . '-' . $id;
                    if (in_array('purchase_date', $wCols))     $warrantyData['purchase_date']     = now()->toDateString();
                    if (in_array('start_date', $wCols))        $warrantyData['start_date']        = now()->toDateString();
                    if (in_array('expiry_date', $wCols))       $warrantyData['expiry_date']       = now()->addMonths($warrantyMonths)->toDateString();
                    if (in_array('end_date', $wCols))          $warrantyData['end_date']          = now()->addMonths($warrantyMonths)->toDateString();
                    if (in_array('warranty_months', $wCols))   $warrantyData['warranty_months']   = $warrantyMonths;
                    if (in_array('warranty_type', $wCols))     $warrantyData['warranty_type']     = 'Store';
                    if (in_array('issue_description', $wCols)) $warrantyData['issue_description'] = 'ទំនិញក្នុងស្តុក (Auto Created)';
                    if (in_array('status', $wCols))            $warrantyData['status']            = 'Pending';
                    if (in_array('created_at', $wCols))        $warrantyData['created_at']        = now();
                    if (in_array('updated_at', $wCols))        $warrantyData['updated_at']        = now();

                    DB::table('warranties')->insert($warrantyData);
                } catch (\Throwable $we) {
                    Log::warning('Warranty auto-creation skipped: ' . $we->getMessage());
                }
            }

            DB::commit();

            return response()->json(array_merge(['id' => $id], $data), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៣. ទាញយកទំនិញមួយតាម ID
    public function show($id)
    {
        try {
            $cols  = Schema::getColumnListing('products');
            $idCol = in_array('id', $cols) ? 'id' : $cols[0];

            $p = DB::table('products')->where($idCol, $id)->first();
            if (!$p) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $pName      = $p->name ?? $p->product_name ?? '';
            $stockQty   = $p->stock ?? $p->stock_qty ?? 0;
            $barcodeVal = $p->barcode ?? $p->sku ?? 'N/A';
            $warranty   = (int) ($p->warranty_months ?? $p->warranty ?? 0);

            $result = [
                'id'              => $p->$idCol ?? $p->id ?? 0,
                'name'            => $pName,
                'product_name'    => $pName,
                'category'        => $p->category ?? 'General',
                'sku'             => $barcodeVal,
                'barcode'         => $barcodeVal,
                'price'           => (float) ($p->price ?? 0),
                'cost'            => (float) ($p->cost ?? 0),
                'stock'           => (int) $stockQty,
                'stock_qty'       => (int) $stockQty,
                'warranty_months' => $warranty,
                'status'          => $stockQty > 0 ? 'In Stock' : 'Out of Stock',
                'image'           => $p->image ?? null,
            ];

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៤. កែប្រែទំនិញ + រូបភាព
    public function update(Request $request, $id)
    {
        try {
            $cols  = Schema::getColumnListing('products');
            $idCol = in_array('id', $cols) ? 'id' : $cols[0];

            $product = DB::table('products')->where($idCol, $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $data = [];

            $pName = $request->product_name ?? $request->name;
            if ($pName !== null) {
                if (in_array('name', $cols))         $data['name']         = $pName;
                if (in_array('product_name', $cols)) $data['product_name'] = $pName;
            }

            $barcodeVal = $request->barcode ?? $request->sku;
            if ($barcodeVal !== null) {
                if (in_array('barcode', $cols)) $data['barcode'] = $barcodeVal;
                if (in_array('sku', $cols))     $data['sku']     = $barcodeVal;
            }

            if ($request->has('price') && in_array('price', $cols)) {
                $data['price'] = $request->price;
            }
            if ($request->has('cost') && in_array('cost', $cols)) {
                $data['cost'] = $request->cost;
            }

            $stockVal = $request->stock_qty ?? $request->stock;
            if ($stockVal !== null) {
                $cappedStock = min(30, max(0, (int) $stockVal));
                if (in_array('stock', $cols))     $data['stock']     = $cappedStock;
                if (in_array('stock_qty', $cols)) $data['stock_qty'] = $cappedStock;
            }

            $warrantyVal = $request->warranty_months ?? $request->warranty;
            if ($warrantyVal !== null) {
                if (in_array('warranty_months', $cols)) $data['warranty_months'] = (int) $warrantyVal;
                if (in_array('warranty', $cols))        $data['warranty']        = (int) $warrantyVal;
            }

            if ($request->has('category') && in_array('category', $cols)) {
                $data['category'] = $request->category;
            } elseif ($request->has('category_id') && in_array('category_id', $cols)) {
                $data['category_id'] = $request->category_id;
            }

            if ($request->hasFile('image') && in_array('image', $cols)) {
                if (!empty($product->image) && file_exists(public_path($product->image))) {
                    @unlink(public_path($product->image));
                }
                $imageDir = public_path('uploads/products');
                if (!file_exists($imageDir)) {
                    @mkdir($imageDir, 0777, true);
                }
                $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
                $request->file('image')->move($imageDir, $imageName);
                $data['image'] = 'uploads/products/' . $imageName;
            }

            if (in_array('updated_at', $cols)) $data['updated_at'] = now();

            if (!empty($data)) {
                DB::table('products')->where($idCol, $id)->update($data);
            }

            return response()->json(['message' => 'Product updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ៥. លុបទំនិញ + លុបរូបភាព និងលុបការធានាក្រោមទំនិញនេះ
    public function destroy($id)
    {
        try {
            $cols  = Schema::getColumnListing('products');
            $idCol = in_array('id', $cols) ? 'id' : $cols[0];

            $product = DB::table('products')->where($idCol, $id)->first();
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            if (!empty($product->image) && file_exists(public_path($product->image))) {
                @unlink(public_path($product->image));
            }

            DB::table('products')->where($idCol, $id)->delete();

            // លុបការធានាចាស់ពាក់ព័ន្ធនឹងទំនិញនេះចេញពី Table warranties (ដោយសុវត្ថិភាព)
            if (Schema::hasTable('warranties')) {
                try {
                    if (Schema::hasColumn('warranties', 'product_id')) {
                        DB::table('warranties')->where('product_id', $id)->delete();
                    } elseif (!empty($product->name) && Schema::hasColumn('warranties', 'product_name')) {
                        DB::table('warranties')->where('product_name', $product->name)->delete();
                    }
                } catch (\Throwable $we) {
                    // Ignore warranty delete errors
                }
            }

            return response()->json(['message' => 'Product deleted successfully!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
