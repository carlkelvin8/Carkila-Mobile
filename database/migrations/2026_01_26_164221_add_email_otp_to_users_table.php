<?php

// database/migrations/xxxx_xx_xx_xxxxxx_add_email_otp_fields_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // put after email_verified_at/password area to keep schema tidy
            $table->string('email_otp_hash', 255)->nullable()->after('password');
            $table->timestamp('email_otp_expires_at')->nullable()->after('email_otp_hash');

            // optional helpers
            $table->timestamp('email_otp_sent_at')->nullable()->after('email_otp_expires_at');
            $table->unsignedTinyInteger('email_otp_attempts')->default(0)->after('email_otp_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_otp_hash',
                'email_otp_expires_at',
                'email_otp_sent_at',
                'email_otp_attempts',
            ]);
        });
    }
};
