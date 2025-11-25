<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Removes redundant 'category' column from points table.
     * Category information should be retrieved from candidates table via JOIN.
     * This eliminates data duplication and maintains 3NF normalization.
     */
    public function up(): void
    {
        Schema::table('points', function (Blueprint $table) {
            // Drop the redundant category column
            if (Schema::hasColumn('points', 'category')) {
                $table->dropColumn('category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('points', function (Blueprint $table) {
            // Restore the category column if needed
            if (!Schema::hasColumn('points', 'category')) {
                $table->string('category', 6)->after('judge_id');
            }
        });
    }
};
