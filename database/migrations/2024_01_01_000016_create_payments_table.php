<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payer_id');
            $table->string('payer_type'); // student, teacher, school
            $table->unsignedBigInteger('payee_id')->nullable();
            $table->string('payee_type')->nullable(); // teacher, school, platform
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('SAR');
            $table->enum('type', ['tuition', 'salary', 'subscription', 'course', 'refund']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded']);
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->unique()->nullable();
            $table->text('description');
            $table->text('description_ar');
            $table->json('metadata')->nullable();
            $table->datetime('due_date')->nullable();
            $table->datetime('paid_at')->nullable();
            $table->timestamps();

            $table->index(['payer_id', 'payer_type']);
            $table->index(['payee_id', 'payee_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
