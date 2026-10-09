<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'meta')) {
                $table->json('meta')->nullable()->after('is_read');
            }

            // Drop the overly-strict dedupe unique that blocks
            // multiple mark_complete notifications per user pair.
            try {
                $table->dropUnique('notifications_dedupe_unique');
            } catch (\Throwable $e) {
                // already dropped or never existed — safe to ignore
            }
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'meta')) {
                $table->dropColumn('meta');
            }
        });
    }
};
