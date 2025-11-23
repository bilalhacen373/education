<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('logo')->nullable();
            $table->string('background_image')->nullable();
            $table->string('address');
            $table->string('address_ar');
            $table->string('phone');
            $table->string('email');
            $table->string('website')->nullable();
            $table->unsignedBigInteger('admin_id');
            $table->json('settings')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('terms_conditions_ar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
