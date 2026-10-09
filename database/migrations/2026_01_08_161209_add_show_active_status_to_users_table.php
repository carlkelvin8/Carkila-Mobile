<?php

// database/migrations/xxxx_xx_xx_xxxxxx_add_show_active_status_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('users', function (Blueprint $table) {
      $table->boolean('show_active_status')->default(true)->after('remember_token');
    });
  }

  public function down(): void {
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn('show_active_status');
    });
  }
};
