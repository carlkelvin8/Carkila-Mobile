<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();
            $table->timestamps();

            $table->unique(['buyer_id', 'vendor_id', 'vehicle_id'], 'conversations_unique_room');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('conversation_id')
                ->nullable()
                ->after('id')
                ->constrained('conversations')
                ->cascadeOnDelete();

            // Optional extra index for retrieval by conversation
            $table->index(['conversation_id', 'sent_at'], 'messages_conversation_sent_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_conversation_sent_at_index');
            $table->dropForeign(['conversation_id']);
            $table->dropColumn('conversation_id');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('conversations_unique_room');
        });

        Schema::dropIfExists('conversations');
    }
};
