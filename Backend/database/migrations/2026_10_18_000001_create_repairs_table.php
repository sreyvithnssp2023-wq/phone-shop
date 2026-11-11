<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('repairs')) {
            Schema::create('repairs', function (Blueprint $table) {
                $table->id();
                $table->string('ticket_code', 50)->unique();
                $table->string('customer_name', 100);
                $table->string('customer_phone', 20)->nullable();
                $table->string('device_name', 100);
                $table->decimal('estimated_cost', 10, 2)->default(0);
                $table->text('problem_description')->nullable();
                $table->longText('damage_images')->nullable();
                $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Pending');
                $table->string('technician_name', 100)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('repairs');
    }
};

