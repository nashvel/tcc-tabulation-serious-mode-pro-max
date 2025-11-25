<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates candidate_partnerships table to normalize partner data.
     * Instead of storing partner info in candidates table, this separates
     * the relationship into its own table (1NF compliance).
     */
    public function up(): void
    {
        Schema::create('candidate_partnerships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->integer('partner_number');
            $table->string('partner_name', 120);
            $table->string('partner_gender', 10);
            $table->timestamps();
            
            $table->unique(['candidate_id']);
            $table->index('partner_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_partnerships');
    }
};
