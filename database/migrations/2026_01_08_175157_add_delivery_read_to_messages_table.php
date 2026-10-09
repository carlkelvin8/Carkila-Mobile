<?php

// php artisan make:migration add_delivery_read_to_messages_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      if (!Schema::hasColumn('messages', 'delivered_at')) {
        $table->timestamp('delivered_at')->nullable()->index()->after('sent_at');
      }
      if (!Schema::hasColumn('messages', 'read_at')) {
        $table->timestamp('read_at')->nullable()->index()->after('delivered_at');
      }
    });
  }

  public function down(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      if (Schema::hasColumn('messages', 'read_at')) $table->dropColumn('read_at');
      if (Schema::hasColumn('messages', 'delivered_at')) $table->dropColumn('delivered_at');
    });
  }
};
