<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->string('region', 100)->nullable()->after('city');
            $table->string('province', 100)->nullable()->after('region');
            $table->string('barangay', 150)->nullable()->after('province');
            $table->decimal('lat', 10, 7)->nullable()->after('barangay');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['region', 'province', 'barangay', 'lat', 'lng']);
        });
    }
};
