<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('education_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar');
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('education_subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('education_categories')->onDelete('cascade');
            $table->string('name_ar');
            $table->string('name');
            $table->integer('display_order')->default(0);
            $table->boolean('is_final_exam')->default(false);
            $table->timestamps();
        });

        $this->seedCategories();
    }

    public function down(): void
    {
        Schema::dropIfExists('education_subcategories');
        Schema::dropIfExists('education_categories');
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name_ar' => 'التعليم الابتدائي', 'name' => 'Primary Education', 'display_order' => 1],
            ['name_ar' => 'التعليم المتوسط', 'name' => 'Intermediate Education', 'display_order' => 2],
            ['name_ar' => 'التعليم الثانوي', 'name' => 'Secondary Education', 'display_order' => 3],
            ['name_ar' => 'التعليم العالي', 'name' => 'Higher Education', 'display_order' => 4],
        ];

        foreach ($categories as $category) {
            DB::table('education_categories')->insert($category);
        }

        $primary = DB::table('education_categories')->where('name', 'Primary Education')->first();
        $intermediate = DB::table('education_categories')->where('name', 'Intermediate Education')->first();
        $secondary = DB::table('education_categories')->where('name', 'Secondary Education')->first();
        $higher = DB::table('education_categories')->where('name', 'Higher Education')->first();

        $subcategories = [
            ['category_id' => $primary->id, 'name_ar' => 'السنة الأولى ابتدائي', 'name' => 'First Year Primary', 'display_order' => 1, 'is_final_exam' => false],
            ['category_id' => $primary->id, 'name_ar' => 'السنة الثانية ابتدائي', 'name' => 'Second Year Primary', 'display_order' => 2, 'is_final_exam' => false],
            ['category_id' => $primary->id, 'name_ar' => 'السنة الثالثة ابتدائي', 'name' => 'Third Year Primary', 'display_order' => 3, 'is_final_exam' => false],
            ['category_id' => $primary->id, 'name_ar' => 'السنة الرابعة ابتدائي', 'name' => 'Fourth Year Primary', 'display_order' => 4, 'is_final_exam' => false],
            ['category_id' => $primary->id, 'name_ar' => 'السنة الخامسة ابتدائي', 'name' => 'Fifth Year Primary (Final Exam)', 'display_order' => 5, 'is_final_exam' => true],

            ['category_id' => $intermediate->id, 'name_ar' => 'السنة الأولى متوسط', 'name' => 'First Year Intermediate', 'display_order' => 1, 'is_final_exam' => false],
            ['category_id' => $intermediate->id, 'name_ar' => 'السنة الثانية متوسط', 'name' => 'Second Year Intermediate', 'display_order' => 2, 'is_final_exam' => false],
            ['category_id' => $intermediate->id, 'name_ar' => 'السنة الثالثة متوسط', 'name' => 'Third Year Intermediate', 'display_order' => 3, 'is_final_exam' => false],
            ['category_id' => $intermediate->id, 'name_ar' => 'السنة الرابعة متوسط', 'name' => 'Fourth Year Intermediate (BEM)', 'display_order' => 4, 'is_final_exam' => true],

            ['category_id' => $secondary->id, 'name_ar' => 'السنة الأولى ثانوي', 'name' => 'First Year Secondary', 'display_order' => 1, 'is_final_exam' => false],
            ['category_id' => $secondary->id, 'name_ar' => 'السنة الثانية ثانوي', 'name' => 'Second Year Secondary', 'display_order' => 2, 'is_final_exam' => false],
            ['category_id' => $secondary->id, 'name_ar' => 'السنة الثالثة ثانوي', 'name' => 'Third Year Secondary (BAC)', 'display_order' => 3, 'is_final_exam' => true],

            ['category_id' => $higher->id, 'name_ar' => 'السنة الأولى جامعي', 'name' => 'First Year University', 'display_order' => 1, 'is_final_exam' => false],
            ['category_id' => $higher->id, 'name_ar' => 'السنة الثانية جامعي', 'name' => 'Second Year University', 'display_order' => 2, 'is_final_exam' => false],
            ['category_id' => $higher->id, 'name_ar' => 'السنة الثالثة جامعي (ليسانس)', 'name' => 'Third Year University (License)', 'display_order' => 3, 'is_final_exam' => false],
            ['category_id' => $higher->id, 'name_ar' => 'ماستر 1', 'name' => 'Master 1', 'display_order' => 4, 'is_final_exam' => false],
            ['category_id' => $higher->id, 'name_ar' => 'ماستر 2', 'name' => 'Master 2', 'display_order' => 5, 'is_final_exam' => false],
        ];

        foreach ($subcategories as $subcategory) {
            DB::table('education_subcategories')->insert($subcategory);
        }
    }
};
