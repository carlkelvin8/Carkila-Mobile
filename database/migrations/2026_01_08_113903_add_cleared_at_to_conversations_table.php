<?php

// database/migrations/2026_01_08_000001_add_cleared_at_to_conversations_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->timestamp('buyer_cleared_at')->nullable()->after('buyer_deleted_at');
            $table->timestamp('vendor_cleared_at')->nullable()->after('vendor_deleted_at');

            $table->index(['buyer_cleared_at']);
            $table->index(['vendor_cleared_at']);
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['buyer_cleared_at']);
            $table->dropIndex(['vendor_cleared_at']);
            $table->dropColumn(['buyer_cleared_at', 'vendor_cleared_at']);
        });
    }
};
