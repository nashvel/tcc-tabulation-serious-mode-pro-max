<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_templates', function (Blueprint $table) {
            $table->string('header_image', 255)->nullable()->after('default_theme_id');
            $table->string('lock_screen_image', 255)->nullable()->after('header_image');
        });
    }

    public function down(): void
    {
        Schema::table('event_templates', function (Blueprint $table) {
            $table->dropColumn(['header_image', 'lock_screen_image']);
        });
    }
};
