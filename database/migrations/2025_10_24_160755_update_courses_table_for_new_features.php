<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'image')) {
                $table->string('image')->nullable()->after('thumbnail');
            }

            if (Schema::hasColumn('courses', 'subject')) {
                $table->dropColumn('subject');
            }

            if (Schema::hasColumn('courses', 'subject_ar')) {
                $table->dropColumn('subject_ar');
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'image')) {
                $table->dropColumn('image');
            }

            if (!Schema::hasColumn('courses', 'subject')) {
                $table->string('subject')->after('class_id');
            }

            if (!Schema::hasColumn('courses', 'subject_ar')) {
                $table->string('subject_ar')->after('subject');
            }
        });
    }
};
