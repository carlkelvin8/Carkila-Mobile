<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('vendor_cleared_at');
            $table->unsignedBigInteger('completed_by_id')->nullable()->after('completed_at');
            $table->foreign('completed_by_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['completed_by_id']);
            $table->dropColumn(['completed_at', 'completed_by_id']);
        });
    }
};
