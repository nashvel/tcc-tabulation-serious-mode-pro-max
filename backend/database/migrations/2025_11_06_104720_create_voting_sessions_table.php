<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voting_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->integer('day_number');
            $table->string('day_name');
            $table->foreignId('round_id')->nullable()->constrained()->onDelete('set null');
            $table->string('round_name')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->enum('status', ['pending', 'active', 'completed'])->default('pending');
            $table->json('metadata')->nullable(); // Store additional info like judges, scores summary
            $table->timestamps();
            
            $table->index(['event_id', 'day_number']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voting_sessions');
    }
};
