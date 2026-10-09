<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_user_follows_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_follows', function (Blueprint $table) {
            $table->id();

            // follower -> following
            $table->unsignedBigInteger('follower_id');
            $table->unsignedBigInteger('following_id');

            $table->timestamps();

            $table->unique(['follower_id', 'following_id'], 'uniq_follower_following');

            $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('following_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_follows');
    }
};
