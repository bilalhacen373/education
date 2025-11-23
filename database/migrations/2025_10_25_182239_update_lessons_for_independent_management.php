<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * # Update Lessons for Independent Teacher Management
     *
     * 1. Changes to Lessons Table
     *    - Make `course_id` nullable (lessons can exist without courses)
     *    - Add `teacher_id` to track lesson owner
     *    - Add `sharing_mode` enum: 'private', 'class', 'custom', 'public'
     *    - Add `is_standalone` boolean to mark independent lessons
     *
     * 2. New Tables
     *    - `lesson_class` - Many-to-many relationship between lessons and classes
     *      - `id`, `lesson_id`, `class_id`, `is_active`, `assigned_at`
     *    - `lesson_student_exclusion` - Students excluded from specific lessons
     *      - `id`, `lesson_id`, `student_id`, `reason`, `excluded_at`
     *
     * 3. Security
     *    - Teachers can only manage their own lessons
     *    - Students can access lessons based on class/course enrollment and exclusions
     *    - Sharing mode controls lesson visibility and access
     *
     * 4. Important Notes
     *    - Existing lessons remain attached to courses
     *    - New standalone lessons can be created without courses
     *    - Lessons can be shared with multiple classes simultaneously
     *    - Individual students can be excluded from shared lessons
     */
    public function up(): void
    {
        // Update lessons table
        Schema::table('lessons', function (Blueprint $table) {
            // Make course_id nullable
            $table->unsignedBigInteger('course_id')->nullable()->change();

            // Add teacher_id
            if (!Schema::hasColumn('lessons', 'teacher_id')) {
                $table->unsignedBigInteger('teacher_id')->nullable()->after('course_id');
                $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            }

            // Add sharing mode
            if (!Schema::hasColumn('lessons', 'sharing_mode')) {
                $table->enum('sharing_mode', ['private', 'class', 'custom', 'public'])
                    ->default('private')
                    ->after('teacher_id');
            }

            // Add is_standalone flag
            if (!Schema::hasColumn('lessons', 'is_standalone')) {
                $table->boolean('is_standalone')->default(false)->after('sharing_mode');
            }

            // Add content_type if not exists
            if (!Schema::hasColumn('lessons', 'content_type')) {
                $table->enum('content_type', ['text', 'video', 'document', 'mixed'])
                    ->default('text')
                    ->after('type');
            }

            // Add thumbnail if not exists
            if (!Schema::hasColumn('lessons', 'thumbnail')) {
                $table->string('thumbnail')->nullable()->after('video_path');
            }

            // Add media_files if not exists
            if (!Schema::hasColumn('lessons', 'media_files')) {
                $table->json('media_files')->nullable()->after('documents');
            }
        });

        // Create lesson_class pivot table
        if (!Schema::hasTable('lesson_class')) {
            Schema::create('lesson_class', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('lesson_id');
                $table->unsignedBigInteger('class_id');
                $table->boolean('is_active')->default(true);
                $table->timestamp('assigned_at')->useCurrent();
                $table->timestamps();

                $table->foreign('lesson_id')->references('id')->on('lessons')->onDelete('cascade');
                $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');

                $table->unique(['lesson_id', 'class_id']);
            });
        }

        // Create lesson_student_exclusion table
        if (!Schema::hasTable('lesson_student_exclusion')) {
            Schema::create('lesson_student_exclusion', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('lesson_id');
                $table->unsignedBigInteger('student_id');
                $table->string('reason')->nullable();
                $table->timestamp('excluded_at')->useCurrent();
                $table->timestamps();

                $table->foreign('lesson_id')->references('id')->on('lessons')->onDelete('cascade');
                $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');

                $table->unique(['lesson_id', 'student_id']);
            });
        }

        // Update existing lessons to have teacher_id from their course
        DB::statement('
            UPDATE lessons
            SET teacher_id = (
                SELECT teacher_id FROM courses WHERE courses.id = lessons.course_id
            )
            WHERE course_id IS NOT NULL AND teacher_id IS NULL
        ');

        // Mark existing lessons with courses as class-shared
        DB::statement("
            UPDATE lessons
            SET sharing_mode = 'class', is_standalone = false
            WHERE course_id IS NOT NULL
        ");
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (Schema::hasColumn('lessons', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
                $table->dropColumn('teacher_id');
            }

            if (Schema::hasColumn('lessons', 'sharing_mode')) {
                $table->dropColumn('sharing_mode');
            }

            if (Schema::hasColumn('lessons', 'is_standalone')) {
                $table->dropColumn('is_standalone');
            }

            $table->unsignedBigInteger('course_id')->nullable(false)->change();
        });

        Schema::dropIfExists('lesson_student_exclusion');
        Schema::dropIfExists('lesson_class');
    }
};
