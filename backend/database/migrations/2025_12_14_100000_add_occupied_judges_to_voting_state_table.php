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
            if (!Schema::hasColumn('voting_state', 'occupied_judges')) {
                $table->json('occupied_judges')->nullable()->after('active_criteria');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            if (Schema::hasColumn('voting_state', 'occupied_judges')) {
                $table->dropColumn('occupied_judges');
            }
        });
    }
};
