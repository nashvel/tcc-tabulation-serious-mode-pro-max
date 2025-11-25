<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Removes denormalized partner columns from candidates table.
     * Partner data is now stored in candidate_partnerships table.
     * This achieves 1NF normalization.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Drop partner-related columns
            if (Schema::hasColumn('candidates', 'partner_number')) {
                $table->dropColumn('partner_number');
            }
            if (Schema::hasColumn('candidates', 'partner_name')) {
                $table->dropColumn('partner_name');
            }
            if (Schema::hasColumn('candidates', 'partner_gender')) {
                $table->dropColumn('partner_gender');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Restore partner columns
            if (!Schema::hasColumn('candidates', 'partner_number')) {
                $table->integer('partner_number')->nullable()->after('department');
            }
            if (!Schema::hasColumn('candidates', 'partner_name')) {
                $table->string('partner_name', 120)->nullable()->after('partner_number');
            }
            if (!Schema::hasColumn('candidates', 'partner_gender')) {
                $table->string('partner_gender', 10)->nullable()->after('partner_name');
            }
        });
    }
};
