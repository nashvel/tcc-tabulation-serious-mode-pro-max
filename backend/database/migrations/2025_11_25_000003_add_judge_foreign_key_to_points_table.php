<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds a foreign key relationship from points.judge_id to judges.id
     * allowing proper data integrity and cascading deletes.
     */
    public function up(): void
    {
        Schema::table('points', function (Blueprint $table) {
            // Add foreign key constraint to judge_id
            // This is done after judges table is created to avoid referential integrity issues
            $table->foreign('judge_id')
                ->references('id')
                ->on('judges')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('points', function (Blueprint $table) {
            $table->dropForeign(['points_judge_id_foreign']);
        });
    }
};
