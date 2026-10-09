<?php

// database/migrations/2026_01_14_XXXXXX_upgrade_notifications_for_follow_like_publish.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'type')) {
                $table->string('type', 50)->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'actor_id')) {
                $table->unsignedBigInteger('actor_id')->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'listing_id')) {
                $table->unsignedBigInteger('listing_id')->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'url')) {
                $table->string('url')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->nullable();
            }

            // Faster latest() per user
            $table->index(['user_id', 'created_at'], 'notifications_user_created_at_index');

            // Prevent spam duplicates
            $table->unique(['user_id','type','actor_id','listing_id'], 'notifications_dedupe_unique');
        });

        Schema::table('notifications', function (Blueprint $table) {
            // optional but recommended foreign keys:
            // if you already have users/listings tables consistent
            $table->foreign('actor_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('listing_id')->references('id')->on('listings')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // drop FKs safely if they exist
            try { $table->dropForeign(['actor_id']); } catch (\Throwable $e) {}
            try { $table->dropForeign(['listing_id']); } catch (\Throwable $e) {}

            try { $table->dropUnique('notifications_dedupe_unique'); } catch (\Throwable $e) {}
            try { $table->dropIndex('notifications_user_created_at_index'); } catch (\Throwable $e) {}

            foreach (['type','actor_id','listing_id','url','data'] as $col) {
                if (Schema::hasColumn('notifications', $col)) $table->dropColumn($col);
            }
        });
    }
};