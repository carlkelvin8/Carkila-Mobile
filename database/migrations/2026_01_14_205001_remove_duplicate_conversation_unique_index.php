<?php

// database/migrations/2026_01_14_XXXXXX_remove_duplicate_conversation_unique_index.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Drop ONE of the duplicate unique keys:
        DB::statement("ALTER TABLE conversations DROP INDEX conversations_unique_room");
        // OR drop uniq_conversations_buyer_vendor_vehicle instead — but keep only one.
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE conversations ADD UNIQUE KEY conversations_unique_room (buyer_id, vendor_id, vehicle_id)");
    }
};