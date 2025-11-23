<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_systems', function (Blueprint $table) {
            $table->id('time_system_id');
            $table->time('time_system_time');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_systems');
    }
};
