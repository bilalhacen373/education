<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->text('enrollment_conditions')->nullable()->after('prerequisites');
            $table->text('enrollment_conditions_ar')->nullable()->after('enrollment_conditions');
            $table->boolean('requires_approval')->default(true)->after('enrollment_conditions_ar');
            $table->decimal('enrollment_fee', 10, 2)->default(0)->after('requires_approval');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'enrollment_conditions',
                'enrollment_conditions_ar',
                'requires_approval',
                'enrollment_fee',
            ]);
        });
    }
};
