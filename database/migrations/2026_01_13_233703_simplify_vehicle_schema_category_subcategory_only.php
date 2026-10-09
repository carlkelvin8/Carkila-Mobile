<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Drop brand_id safely
            if (Schema::hasColumn('vehicles', 'brand_id')) {
                try { $table->dropForeign(['brand_id']); } catch (\Throwable $e) {}
                $table->dropColumn('brand_id');
            }

            // Drop type_id safely
            if (Schema::hasColumn('vehicles', 'type_id')) {
                try { $table->dropForeign(['type_id']); } catch (\Throwable $e) {}
                $table->dropColumn('type_id');
            }
        });

        // Drop lookup tables (only if no other table references them)
        Schema::dropIfExists('vehicle_brands');
        Schema::dropIfExists('vehicle_types');
    }

    public function down(): void
    {
        Schema::create('vehicle_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->constrained('vehicle_brands')->nullOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('vehicle_types')->nullOnDelete();
        });
    }
};