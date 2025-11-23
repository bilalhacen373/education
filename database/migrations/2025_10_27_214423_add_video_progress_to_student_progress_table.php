<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_progress', function (Blueprint $table) {
            if (!Schema::hasColumn('student_progress', 'video_progress')) {
                $table->integer('video_progress')->default(0)->after('progress_percentage');
            }
            if (!Schema::hasColumn('student_progress', 'documents_read')) {
                $table->integer('documents_read')->default(0)->after('video_progress');
            }
            if (!Schema::hasColumn('student_progress', 'total_documents')) {
                $table->integer('total_documents')->default(0)->after('documents_read');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_progress', function (Blueprint $table) {
            $table->dropColumn(['video_progress', 'documents_read', 'total_documents']);
        });
    }
};
