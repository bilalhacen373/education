<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            // Remove single teacher_id and subject fields
            $table->dropForeign(['teacher_id']);
            $table->dropColumn(['teacher_id', 'subject', 'subject_ar']);

            // Add main teacher reference (optional)
            $table->foreignId('main_teacher_id')->nullable()->constrained('teachers')->onDelete('set null');

            // Add class code and academic year
            $table->string('class_code')->unique()->nullable();
            $table->string('academic_year')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->string('subject_ar');

            $table->dropForeign(['main_teacher_id']);
            $table->dropColumn(['main_teacher_id', 'class_code', 'academic_year']);
        });
    }
};
