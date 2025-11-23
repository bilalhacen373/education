<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    # Add AI Chat ID to Schools Table

    1. New Columns
       - `admin_ai_chat_id` (bigInteger, nullable) - Reference to the school admin's AI chat conversation

    2. Modified Tables
       - `schools`
         - Added `admin_ai_chat_id` column for storing school admin AI chat conversation reference

    3. Security
       - RLS already enabled on chat_conversations table
       - School admins can only access their own AI conversations through the ChatController

    4. Notes
       - This column stores the AI assistant conversation for school administrators
       - AI chat creation happens during school admin profile completion
       - Allows school admins to get personalized assistance for administrative tasks
       - If AI chat creation fails, column remains NULL and can be retried later
    */

    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (!Schema::hasColumn('schools', 'admin_ai_chat_id')) {
                $table->unsignedBigInteger('admin_ai_chat_id')->nullable()->after('admin_id');
                $table->foreign('admin_ai_chat_id')
                    ->references('id')
                    ->on('chat_conversations')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (Schema::hasColumn('schools', 'admin_ai_chat_id')) {
                $table->dropForeign(['admin_ai_chat_id']);
                $table->dropColumn('admin_ai_chat_id');
            }
        });
    }
};
