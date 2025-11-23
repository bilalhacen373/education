<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\ChatApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ChatController extends Controller
{
    private $chatApiService;
    private $externalApiUrl;

    public function __construct(ChatApiService $chatApiService)
    {
        $this->chatApiService = $chatApiService;
        $this->externalApiUrl = env('CHAT_API_URL', 'http://localhost:5000');
    }

    public function index()
    {
        $user = auth()->user();

        $conversations = ChatConversation::where('user_id', $user->id)
            ->with(['messages' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show($id)
    {
        $conversation = ChatConversation::where('user_id', auth()->id())
            ->where('id', $id)
            ->with(['messages' => function($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        $allConversations = ChatConversation::where('user_id', auth()->id())
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'conversations' => $allConversations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $conversation = ChatConversation::create([
            'user_id' => auth()->id(),
            'title' => $request->title ?? 'New Conversation',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'files.*' => 'nullable|file|max:10240',
        ]);

        $conversation = ChatConversation::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $attachments = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $userMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->message,
            'attachments' => !empty($attachments) ? $attachments : null,
        ]);

        try {
            $externalChatId = $conversation->external_chat_id ?? 1;

            if ($request->hasFile('files')) {
                $http = Http::timeout(120)->asMultipart();

                $http = $http->attach('chat_id', $externalChatId);
                $http = $http->attach('message', $request->message);

                foreach ($request->file('files') as $index => $file) {
                    $http = $http->attach(
                        'files',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    );
                }

                $response = $http->post("{$this->externalApiUrl}/api/external/chat");
            } else {
                $response = Http::timeout(120)
                    ->post("{$this->externalApiUrl}/api/external/chat", [
                        'chat_id' => $externalChatId,
                        'message' => $request->message,
                    ]);
            }

            if ($response->successful()) {
                $data = $response->json();

                if ($data['success'] ?? false) {
                    $assistantMessage = ChatMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'assistant',
                        'content' => $data['response'],
                    ]);

                    if (!$conversation->external_chat_id && isset($data['chat_id'])) {
                        $conversation->update(['external_chat_id' => $data['chat_id']]);
                    }

                    if ($conversation->messages()->count() === 2 && $conversation->title === 'New Conversation') {
                        $newTitle = substr($request->message, 0, 50) . (strlen($request->message) > 50 ? '...' : '');
                        $conversation->update(['title' => $newTitle]);
                    }

                    $conversation->touch();

                    return response()->json([
                        'success' => true,
                        'userMessage' => $userMessage,
                        'assistantMessage' => $assistantMessage,
                        'conversation' => $conversation->fresh(),
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'Failed to get AI response',
                    ], 500);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'External API is not responding. Please try again later.',
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error connecting to AI service: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $conversation = ChatConversation::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $conversation->update([
            'title' => $request->title,
        ]);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    public function destroy($id)
    {
        $conversation = ChatConversation::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully',
        ]);
    }

    public function checkApiStatus()
    {
        $isOnline = $this->chatApiService->checkApiStatus();

        return response()->json([
            'success' => $isOnline,
            'status' => $isOnline ? 'online' : 'offline',
            'message' => $isOnline ? 'خدمة الذكاء الاصطناعي متاحة' : 'خدمة الذكاء الاصطناعي غير متاحة',
        ], $isOnline ? 200 : 503);
    }

    public function createAIChatForTeacher($userId, $teacherName, $teacherInfo = [])
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

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
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

                            \Log::info("AI chat created successfully with external_chat_id: {$externalChatId} (UUID: {$syncData['latest_chat']['chat_id']})");
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
            \Log::error('Failed to create AI chat for teacher: ' . $e->getMessage());
            return null;
        }
    }

    public function createAIChatForStudent($userId, $studentName, $studentInfo = [])
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

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
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

                            \Log::info("AI chat created successfully for student with external_chat_id: {$externalChatId}");
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
            \Log::error('Failed to create AI chat for student: ' . $e->getMessage());
            return null;
        }
    }

    public function createAIChatForSchoolAdmin($userId, $adminName, $schoolInfo = [])
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

            $response = Http::timeout(120)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => 1,
                    'message' => $initialMessage,
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

                            \Log::info("AI chat created successfully for school admin with external_chat_id: {$externalChatId}");
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
            \Log::error('Failed to create AI chat for school admin: ' . $e->getMessage());
            return null;
        }
    }

    public function generateCourseInfo(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        try {
            $user = auth()->user();
            $teacher = $user->teacher;

            if (!$teacher) {
                return response()->json([
                    'success' => false,
                    'error' => 'ملف المعلم غير موجود',
                ], 403);
            }

            $conversationId = $teacher->ai_chat_id;

            if (!$conversationId) {
                $teacherInfo = [
                    'specialization' => $teacher->specialization,
                    'specialization_ar' => $teacher->specialization_ar,
                    'experience_years' => $teacher->experience_years,
                ];

                $conversationId = $this->createAIChatForTeacher($user->id, $user->name_ar ?? $user->name, $teacherInfo);

                if ($conversationId) {
                    $teacher->update(['ai_chat_id' => $conversationId]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'فشل في إنشاء محادثة مع الذكاء الاصطناعي',
                    ], 500);
                }
            }

            $conversation = ChatConversation::find($conversationId);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'error' => 'المحادثة غير موجودة',
                ], 404);
            }

            $externalChatId = $conversation->external_chat_id;

            if (!$externalChatId) {
                $latestChat = $this->chatApiService->syncAndGetLatestChat();
                if ($latestChat && isset($latestChat['id'])) {
                    $externalChatId = $latestChat['id'];
                    $conversation->update(['external_chat_id' => $externalChatId]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'لم يتمكن من العثور على معرف محادثة صحيح مع خدمة الذكاء الاصطناعي',
                    ], 503);
                }
            }

            $courseTitle = $request->title;

            $prompt = 'قم بإنشاء معلومات تفصيلية للكورس بصيغة JSON فقط بدون أي نص إضافي للعنوان التالي "'. $courseTitle .'" :
            {"title": "عنوان الدرس بالإنجليزية","title_ar": "عنوان الدرس بالعربية","description": "وصف مختصر للدرس بالإنجليزية","description_ar": "وصف مختصر للدرس بالعربية","difficulty_level": "beginner أو intermediate أو advanced","duration_hours": "رقم تقدير مدة الكورس بالساعات","learning_objectives": "[هدف تعليمي 1, هدف تعليمي 2, هدف تعليمي 3, ....]","prerequisites": "[متطلب 1, متطلب 2, ....]","enrollment_conditions": "شروط التسجيل بالإنجليزية","enrollment_conditions_ar": "شروط التسجيل بالعربية","subjects": "[math, phisics, ....]",}
            يجب أن يكون الرد JSON فقط بدون أي نص قبله أو بعده.';

            $apiResult = $this->chatApiService->sendMessage($externalChatId, $prompt);

            if ($apiResult['success']) {
                $aiResponse = $apiResult['response'];

                $extractedData = $this->chatApiService->extractJsonFromResponse($aiResponse);

                if ($extractedData) {
                    ChatMessage::create([
                        'conversation_id' => $conversationId,
                        'role' => 'user',
                        'content' => $prompt,
                    ]);

                    ChatMessage::create([
                        'conversation_id' => $conversationId,
                        'role' => 'assistant',
                        'content' => $aiResponse,
                    ]);

                    $conversation->touch();

                    return response()->json([
                        'success' => true,
                        'data' => $extractedData,
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'فشل في تحليل استجابة الذكاء الاصطناعي. تأكد من إدخال عنوان صحيح.',
                        'raw_response' => substr($aiResponse, 0, 200),
                    ], 422);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $apiResult['error'] ?? 'فشل في الحصول على استجابة من الذكاء الاصطناعي',
                ], 503);
            }
        } catch (\Exception $e) {
            \Log::error('Generate course info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'خطأ في الاتصال بخدمة الذكاء الاصطناعي: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function extractFromDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|max:10240',
        ]);

        try {
            $user = auth()->user();
            $teacher = $user->teacher;

            if (!$teacher) {
                return response()->json([
                    'success' => false,
                    'error' => 'Teacher profile not found',
                ], 403);
            }

            $file = $request->file('document');

            $conversationId = $teacher->ai_chat_id;

            if (!$conversationId) {
                $teacherInfo = [
                    'specialization' => $teacher->specialization,
                    'specialization_ar' => $teacher->specialization_ar,
                    'experience_years' => $teacher->experience_years,
                ];

                $conversationId = $this->createAIChatForTeacher($user->id, $user->name_ar ?? $user->name, $teacherInfo);

                if ($conversationId) {
                    $teacher->update(['ai_chat_id' => $conversationId]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'فشل في إنشاء محادثة مع الذكاء الاصطناعي',
                    ], 500);
                }
            }

            $conversation = ChatConversation::find($conversationId);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'error' => 'Conversation not found',
                ], 404);
            }

            $externalChatId = $conversation->external_chat_id;

            if (!$externalChatId) {
                $latestChat = $this->chatApiService->syncAndGetLatestChat();
                if ($latestChat && isset($latestChat['id'])) {
                    $externalChatId = $latestChat['id'];
                    $conversation->update(['external_chat_id' => $externalChatId]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'لم يتمكن من العثور على معرف محادثة صحيح مع خدمة الذكاء الاصطناعي',
                    ], 503);
                }
            }

            $prompt = 'قم بتحليل هذا المستند واستخراج المعلومات التالية بصيغة JSON فقط بدون أي نص إضافي:
            {
                "title": "عنوان الدرس بالإنجليزية",
                "title_ar": "عنوان الدرس بالعربية",
                "description": "وصف مختصر للدرس بالإنجليزية",
                "description_ar": "وصف مختصر للدرس بالعربية",
                "content_text": "ملخص محتوى الملف المرفق",
                "duration_minutes": تقدير مدة الدرس بالدقائق (رقم فقط)
            }
            يجب أن يكون الرد JSON فقط بدون أي نص قبله أو بعده.';

            $apiResult = $this->chatApiService->sendMessage($externalChatId, $prompt, [$file]);

            if ($apiResult['success']) {
                $aiResponse = $apiResult['response'];

                $extractedData = $this->chatApiService->extractJsonFromResponse($aiResponse);

                if ($extractedData) {
                    ChatMessage::create([
                        'conversation_id' => $conversationId,
                        'role' => 'user',
                        'content' => $prompt,
                        'attachments' => [
                            [
                                'name' => $file->getClientOriginalName(),
                                'size' => $file->getSize(),
                                'type' => $file->getMimeType(),
                            ]
                        ],
                    ]);

                    ChatMessage::create([
                        'conversation_id' => $conversationId,
                        'role' => 'assistant',
                        'content' => $aiResponse,
                    ]);

                    $conversation->touch();

                    return response()->json([
                        'success' => true,
                        'data' => $extractedData,
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'فشل في تحليل استجابة الذكاء الاصطناعي. تأكد من صيغة الملف صحيحة.',
                        'raw_response' => substr($aiResponse, 0, 200),
                    ], 422);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $apiResult['error'] ?? 'فشل في الحصول على استجابة من الذكاء الاصطناعي',
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'خطأ في الاتصال بخدمة الذكاء الاصطناعي: ' . $e->getMessage(),
            ], 500);
        }
    }
}
