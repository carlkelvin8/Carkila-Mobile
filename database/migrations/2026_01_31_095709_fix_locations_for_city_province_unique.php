<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    private function indexExists(string $table, string $index): bool
    {
        return DB::table('information_schema.statistics')
            ->whereRaw('table_schema = DATABASE()')
            ->where('table_name', $table)
            ->where('index_name', $index)
            ->exists();
    }

    public function up(): void
    {
        $table = 'locations';

        // ✅ 1) Drop old UNIQUE(city_norm) if it ever exists
        if ($this->indexExists($table, 'locations_city_norm_unique')) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `locations_city_norm_unique`");
        }

        // ✅ 2) Add province_norm generated column if missing
        if (!Schema::hasColumn($table, 'province_norm')) {
            DB::statement("
                ALTER TABLE `{$table}`
                ADD COLUMN `province_norm` varchar(255)
                GENERATED ALWAYS AS (
                    CASE
                        WHEN `province` IS NULL THEN NULL
                        ELSE LCASE(TRIM(`province`))
                    END
                ) STORED
            ");
        }

        // ✅ 3) Add location_key generated column if missing
        // location_key = city_norm|province_norm
        if (!Schema::hasColumn($table, 'location_key')) {
            DB::statement("
                ALTER TABLE `{$table}`
                ADD COLUMN `location_key` varchar(600)
                GENERATED ALWAYS AS (
                    CONCAT(
                        IFNULL(`city_norm`, ''),
                        '|',
                        IFNULL(`province_norm`, '')
                    )
                ) STORED
            ");
        }

        // ✅ 4) Ensure UNIQUE(location_key)
        if (!$this->indexExists($table, 'locations_location_key_unique')) {
            DB::statement("ALTER TABLE `{$table}` ADD UNIQUE KEY `locations_location_key_unique` (`location_key`)");
        }

        // ✅ 5) Ensure helper indexes for fast dropdown/search
        if (!$this->indexExists($table, 'locations_city_norm_idx')) {
            DB::statement("ALTER TABLE `{$table}` ADD INDEX `locations_city_norm_idx` (`city_norm`)");
        }

        if (!$this->indexExists($table, 'locations_province_norm_idx')) {
            DB::statement("ALTER TABLE `{$table}` ADD INDEX `locations_province_norm_idx` (`province_norm`)");
        }
    }

    public function down(): void
    {
        $table = 'locations';

        // Rollback removes what this migration introduced.
        // NOTE: We intentionally do NOT restore UNIQUE(city_norm) because that
        // will prevent importing all PH cities/municipalities (duplicate city names).

        if ($this->indexExists($table, 'locations_location_key_unique')) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `locations_location_key_unique`");
        }

        if ($this->indexExists($table, 'locations_city_norm_idx')) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `locations_city_norm_idx`");
        }

        if ($this->indexExists($table, 'locations_province_norm_idx')) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `locations_province_norm_idx`");
        }

        if (Schema::hasColumn($table, 'location_key')) {
            DB::statement("ALTER TABLE `{$table}` DROP COLUMN `location_key`");
        }

        if (Schema::hasColumn($table, 'province_norm')) {
            DB::statement("ALTER TABLE `{$table}` DROP COLUMN `province_norm`");
        }
    }
};
