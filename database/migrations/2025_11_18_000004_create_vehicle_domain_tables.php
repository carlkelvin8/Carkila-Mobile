<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Vehicle brands (e.g. Toyota, Honda)
        Schema::create('vehicle_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->timestamps();
        });

        // Vehicle types (e.g. sedan, suv, motorcycle)
        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->timestamps();
        });

        // Vehicles (actual units owned by vendors)
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            // Owner/vendor
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title', 150);
            $table->text('description');

            $table->foreignId('brand_id')
                ->constrained('vehicle_brands')
                ->restrictOnDelete();

            $table->foreignId('type_id')
                ->constrained('vehicle_types')
                ->restrictOnDelete();

            // Kept from old DB (no table for this yet, so no FK)
            $table->unsignedBigInteger('subcategory_id')->nullable();

            $table->enum('condition', ['new', 'used'])->default('used');
            $table->enum('status', ['available', 'rented', 'sold'])->default('available');

            $table->integer('year')->nullable();
            $table->integer('mileage')->nullable();

            $table->decimal('price_per_day', 10, 2);

            // Available for rental or not
            $table->boolean('availability')->default(true);

            // City/area
            $table->foreignId('location_id')
                ->nullable()
                ->constrained('locations')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['status', 'availability']);
            $table->index('price_per_day');
        });

        // Variants per vehicle (e.g. "1.3 E MT", etc.)
        Schema::create('vehicle_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();
            $table->string('name', 100);
            $table->timestamps();
        });

        // Photos per vehicle
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();
            $table->string('url', 255);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['vehicle_id', 'sort_order']);
        });

        // Listings (visibility for a vehicle for N days)
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            // Improvement: track listing lifecycle
            $table->enum('status', ['draft', 'active', 'expired', 'paused'])
                ->default('active');

            $table->timestamps();

            $table->index(['status', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
        Schema::dropIfExists('photos');
        Schema::dropIfExists('vehicle_variants');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('vehicle_types');
        Schema::dropIfExists('vehicle_brands');
    }
};
