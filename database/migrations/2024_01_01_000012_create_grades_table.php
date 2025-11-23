<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('class_id');
            $table->string('subject');
            $table->string('subject_ar');
            $table->enum('grade_type', ['quiz', 'assignment', 'exam', 'participation', 'final']);
            $table->string('title');
            $table->string('title_ar');
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('percentage', 5, 2);
            $table->string('letter_grade')->nullable();
            $table->text('comments')->nullable();
            $table->text('comments_ar')->nullable();
            $table->date('graded_date');
            $table->unsignedBigInteger('graded_by');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('graded_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
