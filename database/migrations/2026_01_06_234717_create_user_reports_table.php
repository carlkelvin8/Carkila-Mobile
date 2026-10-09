<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_user_reports_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained('conversations')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['reporter_id', 'reported_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reports');
    }
};
