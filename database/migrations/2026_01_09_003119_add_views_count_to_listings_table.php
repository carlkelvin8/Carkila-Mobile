<?php

// database/migrations/2026_01_09_000001_add_views_count_to_listings_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'views_count')) {
                $table->unsignedBigInteger('views_count')->default(0)->after('id');
            }
        });
    }

    public function down(): void {
        Schema::table('listings', function (Blueprint $table) {
            if (Schema::hasColumn('listings', 'views_count')) {
                $table->dropColumn('views_count');
            }
        });
    }
};
