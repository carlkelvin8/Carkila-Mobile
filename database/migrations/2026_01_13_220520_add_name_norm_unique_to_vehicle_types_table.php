<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicle_types', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicle_types', 'name_norm')) {
                $table->string('name_norm', 100)
                    ->storedAs("lower(trim(`name`))");
            }
        });

        Schema::table('vehicle_types', function (Blueprint $table) {
            $table->unique('name_norm', 'vehicle_types_name_norm_unique');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_types', function (Blueprint $table) {
            $table->dropUnique('vehicle_types_name_norm_unique');
            $table->dropColumn('name_norm');
        });
    }
};