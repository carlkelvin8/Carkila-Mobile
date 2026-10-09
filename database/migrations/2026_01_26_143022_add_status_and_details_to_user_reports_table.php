<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('user_reports', 'details')) {
                $table->text('details')->nullable()->after('reason');
            }

            if (!Schema::hasColumn('user_reports', 'status')) {
                $table->string('status', 20)->default('pending')->after('details');
                // optional index for your exists() query
                $table->index(['reporter_id', 'reported_user_id', 'status'], 'user_reports_lookup_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_reports', function (Blueprint $table) {
            if (Schema::hasColumn('user_reports', 'status')) {
                $table->dropIndex('user_reports_lookup_idx');
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('user_reports', 'details')) {
                $table->dropColumn('details');
            }
        });
    }
};
