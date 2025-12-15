<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add header_logos to events table
        Schema::table('events', function (Blueprint $table) {
            $table->json('header_logos')->nullable()->after('header_image');
        });

        // Add header_logos to event_templates table
        Schema::table('event_templates', function (Blueprint $table) {
            $table->json('header_logos')->nullable()->after('header_image');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('header_logos');
        });

        Schema::table('event_templates', function (Blueprint $table) {
            $table->dropColumn('header_logos');
        });
    }
};
