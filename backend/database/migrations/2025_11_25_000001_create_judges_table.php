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
        Schema::create('judges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->integer('chair_number')->nullable(); // Physical laptop position (1-5)
            $table->string('laptop_ip')->nullable(); // IP address of the laptop
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->json('metadata')->nullable(); // Store additional info
            $table->timestamps();
            
            $table->unique(['event_id', 'chair_number']);
            $table->index(['event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('judges');
    }
};
