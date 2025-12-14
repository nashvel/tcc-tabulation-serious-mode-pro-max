<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * registered_screens stores: [
     *   { screen_number: 1, device_id: "abc123", judge_id: 1, ip_address: "192.168.1.10", connected_at: "..." },
     *   { screen_number: 2, device_id: "def456", judge_id: 2, ip_address: "192.168.1.11", connected_at: "..." },
     * ]
     */
    public function up(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            $table->json('registered_screens')->nullable()->after('display_settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            $table->dropColumn('registered_screens');
        });
    }
};
