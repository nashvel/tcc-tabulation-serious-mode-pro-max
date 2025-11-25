<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds event_id FK to rounds table for proper normalization.
     * This allows querying rounds by event and maintains data integrity.
     */
    public function up(): void
    {
        Schema::table('rounds', function (Blueprint $table) {
            // Add event_id as foreign key after id
            $table->foreignId('event_id')
                ->after('id')
                ->constrained('events')
                ->onDelete('cascade');
            
            // Add index for better query performance
            $table->index(['event_id', 'spot']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rounds', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropIndex(['event_id', 'spot']);
            $table->dropColumn('event_id');
        });
    }
};
