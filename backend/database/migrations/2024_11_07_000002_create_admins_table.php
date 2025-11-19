<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('pin')->unique(); // Remove length limit for hashed value
            $table->string('name')->nullable();
            $table->timestamps();
        });

        // Insert default admin PIN: 123456
        DB::table('admins')->insert([
            'pin' => Hash::make('123456'),
            'name' => 'Admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
