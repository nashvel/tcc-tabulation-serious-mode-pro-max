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
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->integer('number');
            $table->string('name', 120);
            $table->string('gender', 10);
            $table->string('department', 255)->nullable();
            $table->integer('partner_number')->nullable();
            $table->string('partner_name', 120)->nullable();
            $table->string('partner_gender', 10)->nullable();
            $table->string('participant_type', 20)->default('solo');
            $table->integer('order')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
