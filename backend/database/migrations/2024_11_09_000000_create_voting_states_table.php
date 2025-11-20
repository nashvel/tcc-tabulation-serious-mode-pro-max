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
        Schema::create('voting_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedBigInteger('active_session_id')->nullable();
            $table->foreignId('active_round_id')->nullable()->constrained('rounds')->onDelete('set null');
            $table->timestamps();
            
            $table->unique('event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voting_states');
    }
};
