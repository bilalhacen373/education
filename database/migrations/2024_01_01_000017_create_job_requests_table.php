<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('requester_id');
            $table->enum('requester_type', ['teacher', 'school_admin']);
            $table->enum('request_type', ['teacher_seeking_school', 'school_seeking_teacher']);
            $table->string('title');
            $table->string('title_ar');
            $table->text('description');
            $table->text('description_ar');
            $table->json('requirements');
            $table->json('subjects')->nullable();
            $table->decimal('offered_salary', 10, 2)->nullable();
            $table->enum('employment_type', ['full_time', 'part_time', 'freelance']);
            $table->string('location')->nullable();
            $table->string('location_ar')->nullable();
            $table->enum('status', ['open', 'closed', 'filled']);
            $table->datetime('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('requester_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_requests');
    }
};
