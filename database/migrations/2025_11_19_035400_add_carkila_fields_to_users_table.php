<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // role: guest / vendor / admin
            $table->enum('role', ['guest', 'vendor', 'admin'])
                ->default('guest')
                ->after('password');

            $table->boolean('is_verified')
                ->default(false)
                ->after('role');

            $table->boolean('is_banned')
                ->default(false)
                ->after('is_verified');

            // location (optional, if you already have a locations table)
            $table->foreignId('location_id')
                ->nullable()
                ->after('is_banned')
                ->constrained('locations')
                ->nullOnDelete();

            // listing credits balance
            $table->integer('credits_balance')
                ->default(0)
                ->after('location_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn([
                'role',
                'is_verified',
                'is_banned',
                'location_id',
                'credits_balance',
            ]);
        });
    }
};
