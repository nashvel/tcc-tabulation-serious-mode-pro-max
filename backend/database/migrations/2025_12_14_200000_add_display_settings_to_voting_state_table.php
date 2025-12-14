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
        Schema::table('voting_state', function (Blueprint $table) {
            $table->json('display_settings')->nullable()->after('occupied_judges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            $table->dropColumn('display_settings');
        });
    }
};
