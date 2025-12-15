<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds unique constraint to prevent duplicate scores for the same
     * candidate/round/criteria/judge combination.
     */
    public function up(): void
    {
        // First, clean up any existing duplicates by keeping only the latest entry
        // This uses a subquery to find duplicates and delete older ones
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql') {
            // MySQL: Delete duplicates keeping the one with highest ID (most recent)
            DB::statement("
                DELETE p1 FROM points p1
                INNER JOIN points p2 
                WHERE p1.id < p2.id 
                AND p1.candidate_id = p2.candidate_id 
                AND p1.round_id = p2.round_id 
                AND p1.criteria_id = p2.criteria_id 
                AND p1.judge_id = p2.judge_id
            ");
        } elseif ($driver === 'sqlite') {
            // SQLite: Delete duplicates keeping the one with highest ID
            DB::statement("
                DELETE FROM points 
                WHERE id NOT IN (
                    SELECT MAX(id) 
                    FROM points 
                    GROUP BY candidate_id, round_id, criteria_id, judge_id
                )
            ");
        }
        
        // Now add the unique constraint
        Schema::table('points', function (Blueprint $table) {
            $table->unique(
                ['candidate_id', 'round_id', 'criteria_id', 'judge_id'],
                'points_unique_score'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('points', function (Blueprint $table) {
            $table->dropUnique('points_unique_score');
        });
    }
};
