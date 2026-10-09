<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Public profile
            $table->string('display_name')->nullable()->after('name');
            $table->text('bio')->nullable()->after('display_name');

            // Public-facing base location text (different from locations FK)
            $table->string('based_location')->nullable()->after('location_id');

            // Account type
            $table->string('user_type', 50)->nullable()->after('based_location'); // operator / individual / company

            // Private user details
            $table->date('birthday')->nullable()->after('user_type');
            $table->string('gender', 20)->nullable()->after('birthday');
            $table->string('mobile_number', 30)->nullable()->after('gender');

            // Review preference
            $table->boolean('show_reviews')->default(true)->after('mobile_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'display_name',
                'bio',
                'based_location',
                'user_type',
                'birthday',
                'gender',
                'mobile_number',
                'show_reviews',
            ]);
        });
    }
};
