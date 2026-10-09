<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_listing_daily_views_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('listing_daily_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('listing_id');
            $table->date('view_date');
            $table->unsignedInteger('views')->default(0);
            $table->timestamps();

            $table->unique(['listing_id', 'view_date']);
            $table->foreign('listing_id')->references('id')->on('listings')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('listing_daily_views');
    }
};
