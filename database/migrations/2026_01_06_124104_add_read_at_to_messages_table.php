<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('sent_at');
                $table->index(['conversation_id', 'read_at']);
                $table->index(['receiver_id', 'read_at']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'read_at')) {
                $table->dropIndex(['conversation_id', 'read_at']);
                $table->dropIndex(['receiver_id', 'read_at']);
                $table->dropColumn('read_at');
            }
        });
    }
};
