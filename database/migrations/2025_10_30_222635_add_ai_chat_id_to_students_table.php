<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    # Add AI Chat ID to Students Table

    1. New Columns
       - `ai_chat_id` (bigInteger, nullable) - Reference to the student's AI chat conversation

    2. Modified Tables
       - `students`
         - Added `ai_chat_id` column for storing AI chat conversation reference

    3. Security
       - RLS already enabled on chat_conversations table
       - Students can only access their own AI conversations through the ChatController

    4. Notes
       - This column allows students to have personalized AI assistant conversations
       - Similar to the ai_chat_id in teachers table
       - AI chat creation happens during student profile completion
       - If AI chat creation fails, column remains NULL and can be retried later
    */

    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'ai_chat_id')) {
                $table->unsignedBigInteger('ai_chat_id')->nullable()->after('is_active');
                $table->foreign('ai_chat_id')
                    ->references('id')
                    ->on('chat_conversations')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'ai_chat_id')) {
                $table->dropForeign(['ai_chat_id']);
                $table->dropColumn('ai_chat_id');
            }
        });
    }
};
