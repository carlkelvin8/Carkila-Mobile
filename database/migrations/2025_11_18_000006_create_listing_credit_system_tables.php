<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Credit packages: e.g. 5 credits = 500, 10 credits = 900
        Schema::create('listing_credit_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);              // e.g. "Starter 5 Credits"
            $table->unsignedInteger('credits');       // e.g. 5, 10
            $table->decimal('price', 10, 2);          // e.g. 500.00, 900.00
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Purchases of credit packages (via GCash / PayMongo)
        Schema::create('listing_credit_purchases', function (Blueprint $table) {
            $table->id();

            // Vendor who bought the credits
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('package_id')
                ->constrained('listing_credit_packages')
                ->restrictOnDelete();

            $table->unsignedInteger('credits_purchased');
            $table->unsignedInteger('credits_remaining');

            $table->decimal('amount', 10, 2);

            $table->enum('payment_provider', ['gcash', 'paymongo']);
            $table->string('payment_reference', 191)->nullable(); // ref no / transaction id

            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])
                ->default('pending');

            $table->dateTime('paid_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        // Actual credit usage per listing (1 credit = 1 listing for 30 days)
        Schema::create('listing_credit_usages', function (Blueprint $table) {
            $table->id();

            // Which vendor used the credits
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // From which purchase this credit came (optional for free/bonus credits)
            $table->foreignId('purchase_id')
                ->nullable()
                ->constrained('listing_credit_purchases')
                ->nullOnDelete();

            // Listing that consumed the credit
            $table->foreignId('listing_id')
                ->constrained('listings')
                ->cascadeOnDelete();

            $table->unsignedInteger('credits_used')->default(1);
            $table->dateTime('used_at')->useCurrent();

            // e.g. "new_listing", "listing_renewal", etc.
            $table->string('reason', 100)->default('new_listing');

            $table->timestamps();

            $table->index(['user_id', 'purchase_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_credit_usages');
        Schema::dropIfExists('listing_credit_purchases');
        Schema::dropIfExists('listing_credit_packages');
    }
};
