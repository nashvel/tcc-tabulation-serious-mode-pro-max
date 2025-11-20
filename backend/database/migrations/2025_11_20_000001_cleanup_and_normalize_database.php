<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration:
     * 1. Adds active_round_name to voting_states for real-time display
     * 2. Removes unused columns from voting_states (is_active, is_locked)
     * 3. Cleans up database for new simplified workflow
     */
    public function up(): void
    {
        // 1. Update voting_states table - add active_round_name and remove unused columns
        if (Schema::hasTable('voting_states')) {
            Schema::table('voting_states', function (Blueprint $table) {
                // Add active_round_name for real-time display
                if (!Schema::hasColumn('voting_states', 'active_round_name')) {
                    $table->string('active_round_name')->nullable()->after('active_round_id');
                }
                
                // Drop unused columns if they exist
                if (Schema::hasColumn('voting_states', 'is_active')) {
                    $table->dropColumn('is_active');
                }
                if (Schema::hasColumn('voting_states', 'is_locked')) {
                    $table->dropColumn('is_locked');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Restore voting_states columns
        if (Schema::hasTable('voting_states')) {
            Schema::table('voting_states', function (Blueprint $table) {
                // Re-add is_active and is_locked
                if (!Schema::hasColumn('voting_states', 'is_active')) {
                    $table->boolean('is_active')->default(false)->after('event_id');
                }
                if (!Schema::hasColumn('voting_states', 'is_locked')) {
                    $table->boolean('is_locked')->default(false)->after('is_active');
                }
                
                // Remove active_round_name
                if (Schema::hasColumn('voting_states', 'active_round_name')) {
                    $table->dropColumn('active_round_name');
                }
            });
        }
    }
};
