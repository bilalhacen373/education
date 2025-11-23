<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (!Schema::hasColumn('lessons', 'video_path')) {
                $table->string('video_path')->nullable()->after('content_url');
            }

            if (!Schema::hasColumn('lessons', 'order')) {
                $table->integer('order')->default(0)->after('order_index');
            }

            if (!Schema::hasColumn('lessons', 'notes')) {
                $table->text('notes')->nullable()->after('content_text');
            }

            if (!Schema::hasColumn('lessons', 'documents')) {
                $table->json('documents')->nullable()->after('resources');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (Schema::hasColumn('lessons', 'video_path')) {
                $table->dropColumn('video_path');
            }

            if (Schema::hasColumn('lessons', 'order')) {
                $table->dropColumn('order');
            }

            if (Schema::hasColumn('lessons', 'notes')) {
                $table->dropColumn('notes');
            }

            if (Schema::hasColumn('lessons', 'documents')) {
                $table->dropColumn('documents');
            }
        });
    }
};
