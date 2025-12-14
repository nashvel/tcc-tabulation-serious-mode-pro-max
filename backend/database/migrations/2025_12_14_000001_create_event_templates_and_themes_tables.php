<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Event Themes - Visual styling for events
        Schema::create('event_themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->string('primary_color', 20)->default('#4f46e5'); // indigo
            $table->string('secondary_color', 20)->default('#818cf8');
            $table->string('accent_color', 20)->default('#c7d2fe');
            $table->string('background_type', 20)->default('solid'); // solid, gradient, image
            $table->string('background_value')->nullable(); // color, gradient css, or image url
            $table->string('font_family', 100)->default('Inter');
            $table->string('header_style', 20)->default('default'); // default, minimal, festive
            $table->json('custom_css')->nullable(); // Additional custom styles
            $table->boolean('is_system')->default(false); // System themes can't be deleted
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Event Templates - Reusable event configurations
        Schema::create('event_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->text('description')->nullable();
            $table->string('event_type', 50)->default('pageant');
            $table->integer('default_judges')->default(5);
            $table->foreignId('default_theme_id')->nullable()->constrained('event_themes')->nullOnDelete();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Template Participants - Pre-configured participants for templates
        Schema::create('template_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('event_templates')->onDelete('cascade');
            $table->integer('number');
            $table->string('name', 120)->nullable(); // Can be placeholder like "Candidate 1"
            $table->string('gender', 20)->default('Female');
            $table->string('department', 255)->nullable();
            $table->string('participant_type', 20)->default('solo');
            $table->integer('order')->nullable();
            $table->timestamps();
        });

        // Template Rounds - Pre-configured rounds/categories for templates
        Schema::create('template_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('event_templates')->onDelete('cascade');
            $table->integer('spot');
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Template Criteria - Pre-configured criteria for template rounds
        Schema::create('template_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_round_id')->constrained('template_rounds')->onDelete('cascade');
            $table->string('name', 120);
            $table->integer('points');
            $table->timestamps();
        });

        // Add theme_id to events table
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('theme_id')->nullable()->after('status')->constrained('event_themes')->nullOnDelete();
            $table->foreignId('template_id')->nullable()->after('theme_id')->constrained('event_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['theme_id']);
            $table->dropForeign(['template_id']);
            $table->dropColumn(['theme_id', 'template_id']);
        });
        
        Schema::dropIfExists('template_criteria');
        Schema::dropIfExists('template_rounds');
        Schema::dropIfExists('template_participants');
        Schema::dropIfExists('event_templates');
        Schema::dropIfExists('event_themes');
    }
};
