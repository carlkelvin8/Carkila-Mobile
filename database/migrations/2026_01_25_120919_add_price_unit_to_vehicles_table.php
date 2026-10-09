<?php

// database/migrations/2026_01_25_000000_add_price_unit_to_vehicles_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->enum('price_unit', ['day', 'km', 'hr'])
                ->default('day')
                ->after('price_per_day');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('price_unit');
        });
    }
};
