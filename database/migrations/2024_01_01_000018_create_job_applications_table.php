<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_request_id');
            $table->unsignedBigInteger('applicant_id');
            $table->text('cover_letter');
            $table->text('cover_letter_ar');
            $table->string('resume_file')->nullable();
            $table->json('additional_documents')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected']);
            $table->text('admin_notes')->nullable();
            $table->datetime('applied_at');
            $table->datetime('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('job_request_id')->references('id')->on('job_requests')->onDelete('cascade');
            $table->foreign('applicant_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['job_request_id', 'applicant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
