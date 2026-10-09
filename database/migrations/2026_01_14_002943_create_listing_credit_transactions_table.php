<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('listing_credit_transactions', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->string('type', 30); // purchase | consume | adjustment | refund
            $table->integer('delta');   // +credits or -credits

            $table->unsignedBigInteger('purchase_id')->nullable();
            $table->unsignedBigInteger('listing_id')->nullable();

            $table->decimal('amount', 10, 2)->nullable();
            $table->string('title', 120);
            $table->string('meta', 255)->nullable();

            $table->timestamp('occurred_at')->useCurrent();

            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_credit_transactions');
    }
};
