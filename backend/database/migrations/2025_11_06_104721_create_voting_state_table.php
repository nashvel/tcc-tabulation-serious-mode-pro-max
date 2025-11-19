<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voting_state', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_locked')->default(false); // Lock screen state
            $table->foreignId('active_session_id')->nullable()->constrained('voting_sessions')->onDelete('set null');
            $table->foreignId('active_round_id')->nullable()->constrained('rounds')->onDelete('set null');
            $table->string('active_round_name')->nullable();
            $table->json('active_criteria')->nullable(); // Store active criteria for the round
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voting_state');
    }
};
