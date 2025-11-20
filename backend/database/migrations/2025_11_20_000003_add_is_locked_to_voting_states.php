<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voting_states', function (Blueprint $table) {
            if (!Schema::hasColumn('voting_states', 'is_locked')) {
                $table->boolean('is_locked')->default(false)->after('active_round_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('voting_states', function (Blueprint $table) {
            if (Schema::hasColumn('voting_states', 'is_locked')) {
                $table->dropColumn('is_locked');
            }
        });
    }
};
