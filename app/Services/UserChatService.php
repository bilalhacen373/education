<?php

namespace App\Services;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserChatService
{
    private $chatApiService;
    private $externalApiUrl;

    public function __construct(ChatApiService $chatApiService)
    {
        $this->chatApiService = $chatApiService;
        $this->externalApiUrl = env('CHAT_API_URL', 'http://localhost:5000');
    }

    public function createChatForStudent($userId, $studentName, $studentInfo = [])
    {
        try {
            $conversation = ChatConversation::create([
                'user_id' => $userId,
                'title' => "AI Assistant - {$studentName}",
                'is_active' => true,
            ]);

            $educationLevel = $studentInfo['education_level'] ?? 'غير محدد';
            $categoryName = $studentInfo['category_name'] ?? 'عام';

            $initialMessage = "مرحباً، أنا {$studentName}. مستوى التعليم: {$educationLevel}، التخصص: {$categoryName}.";

            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $initialMessage,
            ]);

            $useWebsite = 'deepseek';
            if (!$this->chatApiService->isWebsiteConnected($useWebsite)) {
                $this->chatApiService->authenticateAI($useWebsite, true);
            }

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
                    'website' => $useWebsite,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success'] ?? false) {
                    ChatMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'assistant',
                        'content' => $data['response'],
                    ]);

                    $syncResponse = Http::timeout(10)
                        ->post("{$this->externalApiUrl}/api/chats/sync-and-get-latest");

                    if ($syncResponse->successful()) {
                        $syncData = $syncResponse->json();

                        if (($syncData['success'] ?? false) && isset($syncData['latest_chat']['id'])) {
                            $externalChatId = $syncData['latest_chat']['id'];
                            $conversation->update(['external_chat_id' => $externalChatId]);

                            Log::info("AI chat created successfully for student with external_chat_id: {$externalChatId} via DeepSeek");
                        }
                    }

                    return $conversation->id;
                }
            }

            $fallbackMessage = "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في الدراسة والإجابة على أسئلتك التعليمية.";
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $fallbackMessage,
            ]);

            return $conversation->id;
        } catch (\Exception $e) {
            Log::error('Failed to create AI chat for student: ' . $e->getMessage());
            return null;
        }
    }

    public function createChatForTeacher($userId, $teacherName, $teacherInfo = [])
    {
        try {
            $conversation = ChatConversation::create([
                'user_id' => $userId,
                'title' => "AI Assistant - {$teacherName}",
                'is_active' => true,
            ]);

            $teacherInfoText = '';
            if (!empty($teacherInfo)) {
                $teacherInfoText = sprintf(
                    " التخصص: %s، سنوات الخبرة: %d",
                    $teacherInfo['specialization_ar'] ?? $teacherInfo['specialization'] ?? 'غير محدد',
                    $teacherInfo['experience_years'] ?? 0
                );
            }

            $initialMessage = "مرحبا انا الاستاذ {$teacherName}.{$teacherInfoText}";

            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $initialMessage,
            ]);

            $useWebsite = 'deepseek';
            if (!$this->chatApiService->isWebsiteConnected($useWebsite)) {
                $this->chatApiService->authenticateAI($useWebsite, true);
            }

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
                    'website' => $useWebsite,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success'] ?? false) {
                    ChatMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'assistant',
                        'content' => $data['response'],
                    ]);

                    $syncResponse = Http::timeout(10)
                        ->post("{$this->externalApiUrl}/api/chats/sync-and-get-latest");

                    if ($syncResponse->successful()) {
                        $syncData = $syncResponse->json();

                        if (($syncData['success'] ?? false) && isset($syncData['latest_chat']['id'])) {
                            $externalChatId = $syncData['latest_chat']['id'];
                            $conversation->update(['external_chat_id' => $externalChatId]);

                            Log::info("AI chat created successfully for teacher with external_chat_id: {$externalChatId} via DeepSeek (UUID: {$syncData['latest_chat']['chat_id']})");
                        }
                    }

                    return $conversation->id;
                }
            }

            $fallbackMessage = "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في إنشاء محتوى الدروس والكورسات.";
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $fallbackMessage,
            ]);

            return $conversation->id;
        } catch (\Exception $e) {
            Log::error('Failed to create AI chat for teacher: ' . $e->getMessage());
            return null;
        }
    }

    public function createChatForSchoolAdmin($userId, $adminName, $schoolInfo = [])
    {
        try {
            $conversation = ChatConversation::create([
                'user_id' => $userId,
                'title' => "AI Assistant - {$adminName}",
                'is_active' => true,
            ]);

            $schoolName = $schoolInfo['school_name'] ?? 'المدرسة';
            $studentCount = $schoolInfo['student_count'] ?? 0;

            $initialMessage = "مرحباً، أنا {$adminName}، مدير مدرسة {$schoolName}. عدد الطلاب: {$studentCount}.";

            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $initialMessage,
            ]);

            $useWebsite = 'deepseek';
            if (!$this->chatApiService->isWebsiteConnected($useWebsite)) {
                $this->chatApiService->authenticateAI($useWebsite, true);
            }

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
                    'website' => $useWebsite,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success'] ?? false) {
                    ChatMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'assistant',
                        'content' => $data['response'],
                    ]);

                    $syncResponse = Http::timeout(10)
                        ->post("{$this->externalApiUrl}/api/chats/sync-and-get-latest");

                    if ($syncResponse->successful()) {
                        $syncData = $syncResponse->json();

                        if (($syncData['success'] ?? false) && isset($syncData['latest_chat']['id'])) {
                            $externalChatId = $syncData['latest_chat']['id'];
                            $conversation->update(['external_chat_id' => $externalChatId]);

                            Log::info("AI chat created successfully for school admin with external_chat_id: {$externalChatId} via DeepSeek");
                        }
                    }

                    return $conversation->id;
                }
            }

            $fallbackMessage = "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في إدارة المدرسة والإجابة على أسئلتك الإدارية.";
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $fallbackMessage,
            ]);

            return $conversation->id;
        } catch (\Exception $e) {
            Log::error('Failed to create AI chat for school admin: ' . $e->getMessage());
            return null;
        }
    }
}
