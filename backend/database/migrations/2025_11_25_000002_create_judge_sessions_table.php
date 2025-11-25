<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('judge_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('judge_id')->constrained('judges')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->integer('chair_number'); // Which chair they're sitting in
            $table->string('session_token')->unique(); // Unique session identifier
            $table->string('laptop_ip')->nullable(); // IP of the laptop
            $table->string('user_agent')->nullable(); // Browser/device info
            $table->timestamp('logged_in_at');
            $table->timestamp('logged_out_at')->nullable();
            $table->enum('status', ['active', 'logged_out', 'force_logged_out', 'switched'])->default('active');
            $table->json('metadata')->nullable(); // Store additional info
            $table->timestamps();
            
            $table->index(['event_id', 'judge_id']);
            $table->index(['event_id', 'chair_number']);
            $table->index(['session_token']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('judge_sessions');
    }
};
