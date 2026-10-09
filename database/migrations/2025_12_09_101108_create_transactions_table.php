<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')
                ->constrained('listings')
                ->cascadeOnDelete();
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])
                ->default('pending');

            // For rentals; can be null for one-time sales
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->decimal('total_amount', 10, 2)->nullable();

            $table->timestamps();

            $table->index(['buyer_id', 'status'], 'transactions_buyer_status_index');
            $table->index(['listing_id', 'status'], 'transactions_listing_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_buyer_status_index');
            $table->dropIndex('transactions_listing_status_index');
        });

        Schema::dropIfExists('transactions');
    }
};
