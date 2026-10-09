<?php

// database/migrations/xxxx_xx_xx_xxxxxx_add_chat_actions_to_conversations_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->timestamp('buyer_archived_at')->nullable()->index();
            $table->timestamp('vendor_archived_at')->nullable()->index();

            $table->timestamp('buyer_deleted_at')->nullable()->index();
            $table->timestamp('vendor_deleted_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn([
                'buyer_archived_at',
                'vendor_archived_at',
                'buyer_deleted_at',
                'vendor_deleted_at',
            ]);
        });
    }
};
