<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // auto | manual | none
            $table->string('renewal_preference', 20)->default('none')->after('end_date');
            $table->timestamp('renewed_at')->nullable()->after('renewal_preference');
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['renewal_preference', 'renewed_at']);
        });
    }
};