<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicles', 'price_unit')) {
                $table->string('price_unit', 10)->default('day')->after('price_per_day');
            }

            if (!Schema::hasColumn('vehicles', 'fuel_included')) {
                $table->boolean('fuel_included')->default(false)->after('location_id');
            }
            if (!Schema::hasColumn('vehicles', 'parking_fee_included')) {
                $table->boolean('parking_fee_included')->default(false)->after('fuel_included');
            }
            if (!Schema::hasColumn('vehicles', 'toll_fee_included')) {
                $table->boolean('toll_fee_included')->default(false)->after('parking_fee_included');
            }
            if (!Schema::hasColumn('vehicles', 'self_driving_allowed')) {
                $table->boolean('self_driving_allowed')->default(false)->after('toll_fee_included');
            }

            if (!Schema::hasColumn('vehicles', 'seating_capacity')) {
                $table->unsignedTinyInteger('seating_capacity')->nullable()->after('self_driving_allowed');
            }
            if (!Schema::hasColumn('vehicles', 'full_address')) {
                $table->string('full_address', 180)->nullable()->after('seating_capacity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            foreach (
                [
                    'full_address',
                    'seating_capacity',
                    'self_driving_allowed',
                    'toll_fee_included',
                    'parking_fee_included',
                    'fuel_included',
                    'price_unit',
                ] as $col
            ) {
                if (Schema::hasColumn('vehicles', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
