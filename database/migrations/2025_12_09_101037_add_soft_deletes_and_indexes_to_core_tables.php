<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Soft deletes
        Schema::table('vehicles', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['location_id', 'status', 'availability'], 'vehicles_location_status_availability_index');
            $table->index(['brand_id', 'type_id'], 'vehicles_brand_type_index');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('admin_logs', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex('vehicles_location_status_availability_index');
            $table->dropIndex('vehicles_brand_type_index');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('admin_logs', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
