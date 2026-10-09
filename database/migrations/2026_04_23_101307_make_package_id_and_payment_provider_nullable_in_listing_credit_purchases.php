<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listing_credit_purchases', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')->nullable()->change();
            $table->enum('payment_provider', ['gcash', 'paymongo'])->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('listing_credit_purchases', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')->nullable(false)->change();
            $table->enum('payment_provider', ['gcash', 'paymongo'])->nullable(false)->change();
        });
    }
};
