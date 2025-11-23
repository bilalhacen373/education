<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('education_category_id')->nullable()->constrained('education_categories')->onDelete('set null');
            $table->foreignId('education_subcategory_id')->nullable()->constrained('education_subcategories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['education_category_id']);
            $table->dropForeign(['education_subcategory_id']);
            $table->dropColumn(['education_category_id', 'education_subcategory_id']);
        });
    }
};
