<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("
            ALTER TABLE listings
            MODIFY status ENUM('draft','active','paused','inactive','expired')
            NOT NULL DEFAULT 'draft'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE listings
            MODIFY status ENUM('draft','active','expired','paused')
            NOT NULL DEFAULT 'active'
        ");
    }
};
