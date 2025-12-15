<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            $table->boolean('show_judge_numbers')->default(false)->after('is_locked');
        });
    }

    public function down(): void
    {
        Schema::table('voting_state', function (Blueprint $table) {
            $table->dropColumn('show_judge_numbers');
        });
    }
};
