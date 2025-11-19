<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });

        // Create event results table for storing winners and participants
        Schema::create('event_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_day_id')->constrained()->onDelete('cascade');
            $table->string('category'); // e.g., "Best in Swimsuit", "Best in Talent"
            $table->integer('rank'); // 1st, 2nd, 3rd
            $table->string('participant_name');
            $table->string('college')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamps();
        });

        // Create overall winners table
        Schema::create('event_overall_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('title'); // e.g., "Overall Winner", "Mr. TCC", "Ms. TCC"
            $table->string('winner_name');
            $table->string('college')->nullable();
            $table->string('year_level')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_overall_winners');
        Schema::dropIfExists('event_results');
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['status', 'start_date', 'end_date']);
        });
    }
};
