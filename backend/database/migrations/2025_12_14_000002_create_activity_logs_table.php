<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('judge_id')->nullable()->constrained('judges')->onDelete('cascade');
            $table->string('action', 50); // score_entered, score_updated, judge_login, judge_logout, round_started, etc.
            $table->string('entity_type', 50)->nullable(); // candidate, round, criteria
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('details')->nullable(); // Additional context (old_value, new_value, candidate_name, etc.)
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['event_id', 'created_at']);
            $table->index(['judge_id', 'created_at']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
