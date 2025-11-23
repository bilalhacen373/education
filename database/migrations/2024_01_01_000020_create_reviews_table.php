<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reviewer_id');
            $table->unsignedBigInteger('reviewee_id');
            $table->string('reviewee_type'); // school, teacher, course
            $table->integer('rating'); // 1-5 stars
            $table->text('comment')->nullable();
            $table->text('comment_ar')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            $table->foreign('reviewer_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['reviewee_id', 'reviewee_type']);
            $table->unique(['reviewer_id', 'reviewee_id', 'reviewee_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
