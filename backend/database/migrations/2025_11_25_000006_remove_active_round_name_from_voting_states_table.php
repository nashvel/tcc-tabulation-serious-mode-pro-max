<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Removes redundant 'active_round_name' column from voting_states table.
     * Round name should be retrieved from rounds table via FK relationship.
     * This eliminates data duplication and maintains 3NF normalization.
     */
    public function up(): void
    {
        Schema::table('voting_states', function (Blueprint $table) {
            // Drop the redundant active_round_name column
            if (Schema::hasColumn('voting_states', 'active_round_name')) {
                $table->dropColumn('active_round_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voting_states', function (Blueprint $table) {
            // Restore the active_round_name column if needed
            if (!Schema::hasColumn('voting_states', 'active_round_name')) {
                $table->string('active_round_name')->nullable()->after('active_round_id');
            }
        });
    }
};
