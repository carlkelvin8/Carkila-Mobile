<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'city_norm')) {
                $table->string('city_norm', 255)
                    ->nullable()
                    ->storedAs("case when `city` is null then null else lower(trim(`city`)) end");
            }
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->unique('city_norm', 'locations_city_norm_unique');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique('locations_city_norm_unique');
            $table->dropColumn('city_norm');
        });
    }
};