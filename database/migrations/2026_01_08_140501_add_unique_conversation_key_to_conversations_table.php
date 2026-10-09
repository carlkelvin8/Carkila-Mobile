<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Name it explicitly so rollback is predictable
            $table->unique(
                ['buyer_id', 'vendor_id', 'vehicle_id'],
                'uniq_conversations_buyer_vendor_vehicle'
            );
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('uniq_conversations_buyer_vendor_vehicle');
        });
    }
};