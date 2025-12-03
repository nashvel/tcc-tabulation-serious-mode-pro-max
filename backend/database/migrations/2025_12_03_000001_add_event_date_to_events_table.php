<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns to events table
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'event_date')) {
                $table->date('event_date')->nullable()->after('year');
            }
            if (!Schema::hasColumn('events', 'description')) {
                $table->text('description')->nullable()->after('event_date');
            }
            if (!Schema::hasColumn('events', 'event_type')) {
                $table->string('event_type')->default('pageant')->after('description');
            }
            if (!Schema::hasColumn('events', 'number_of_judges')) {
                $table->integer('number_of_judges')->nullable()->after('event_type');
            }
            if (!Schema::hasColumn('events', 'unique_id')) {
                $table->string('unique_id')->nullable()->after('id');
            }
        });

        // Add missing columns to event_days table
        Schema::table('event_days', function (Blueprint $table) {
            if (!Schema::hasColumn('event_days', 'event_type')) {
                $table->string('event_type')->default('pageant')->after('title');
            }
            if (!Schema::hasColumn('event_days', 'participant_type')) {
                $table->string('participant_type')->default('solo')->after('event_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $columns = ['event_date', 'description', 'event_type', 'number_of_judges', 'unique_id'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('events', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('event_days', function (Blueprint $table) {
            $columns = ['event_type', 'participant_type'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('event_days', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
