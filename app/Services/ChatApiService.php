<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatApiService
{
    private $externalApiUrl = 'http://localhost:5000';
    private $timeout = 160;

    private const DEEPSEEK = 'deepseek';
    private const GEMINI = 'gemini';
    private const DEFAULT_PROVIDER = 'deepseek';

    // Task-specific provider preferences
    private const PROVIDER_PREFERENCES = [
        'file_analysis' => 'gemini',
        'document_extraction' => 'gemini',
        'image_generation' => 'gemini',
        'timetable_generation' => 'deepseek',
        'reasoning_tasks' => 'deepseek',
        'course_generation' => 'deepseek',
        'text_chat' => 'deepseek',
    ];

    public function __construct()
    {
        $this->externalApiUrl = env('CHAT_API_URL', 'http://localhost:5000');
        $this->timeout = (int) env('CHAT_API_TIMEOUT', 160);
    }

    /**
     * Authenticate and connect to an AI website
     *
     * @param string $website AI website to connect to ('deepseek' or 'gemini')
     * @param bool $headless Run browser in headless mode
     * @return array Response from authentication endpoint
     */
    public function authenticateAI($website = self::DEEPSEEK, $headless = true)
    {
        try {
            $response = Http::timeout(30)
                ->post("{$this->externalApiUrl}/api/authenticate", [
                    'website' => $website,
                    'headless' => $headless,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] ?? false) {
                    Log::info("Successfully authenticated with {$website}");
                    return [
                        'success' => true,
                        'website' => $website,
                        'message' => $data['message'] ?? 'Authentication successful',
                    ];
                }
            }

            return [
                'success' => false,
                'website' => $website,
                'message' => $data['message'] ?? 'Authentication failed',
            ];
        } catch (\Exception $e) {
            Log::error("Authentication failed for {$website}: " . $e->getMessage());
            return [
                'success' => false,
                'website' => $website,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Disconnect from an AI website or all if not specified
     *
     * @param string|null $website Specific website to disconnect from, or null for all
     * @return array Response from disconnect endpoint
     */
    public function disconnectAI($website = null)
    {
        try {
            $payload = [];
            if ($website) {
                $payload['website'] = $website;
            }

            $response = Http::timeout(10)
                ->post("{$this->externalApiUrl}/api/disconnect", $payload);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] ?? false) {
                    Log::info("Disconnected" . ($website ? " from {$website}" : " from all AI websites"));
                    return [
                        'success' => true,
                        'message' => $data['message'] ?? 'Disconnection successful',
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Disconnection failed',
            ];
        } catch (\Exception $e) {
            Log::error('Disconnection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get status of connected AI websites
     *
     * @return array Connection status and list of active AI websites
     */
    public function getConnectionStatus()
    {
        try {
            $response = Http::timeout(5)->get("{$this->externalApiUrl}/api/status");

            if ($response->successful()) {
                $data = $response->json();
                return $data;
            }

            return [
                'authenticated' => false,
                'connected_websites' => [],
                'error' => 'Failed to fetch status',
            ];
        } catch (\Exception $e) {
            Log::warning('Failed to get connection status: ' . $e->getMessage());
            return [
                'authenticated' => false,
                'connected_websites' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if a specific AI website is connected
     *
     * @param string $website
     * @return bool
     */
    public function isWebsiteConnected($website)
    {
        $status = $this->getConnectionStatus();

        if ($status['authenticated'] ?? false) {
            $connectedWebsites = $status['connected_websites'] ?? [];
            foreach ($connectedWebsites as $connected) {
                if (($connected['name'] ?? null) === $website && ($connected['session_active'] ?? false)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Automatically select the best AI provider based on task type
     *
     * @param string $taskType Type of task to determine best provider
     * @param bool $hasFiles Whether the task involves file uploads
     * @return string Selected AI provider
     */
    public function selectBestAI($taskType = 'text_chat', $hasFiles = false)
    {
        if ($hasFiles) {
            return self::GEMINI;
        }

        return self::PROVIDER_PREFERENCES[$taskType] ?? self::DEFAULT_PROVIDER;
    }

    /**
     * Ensure authentication with specified or default AI provider
     *
     * @param string $website AI website to ensure connection for
     * @return bool True if connected, false otherwise
     */
    public function ensureAuthenticated($website = self::DEEPSEEK)
    {
        if ($this->isWebsiteConnected($website)) {
            return true;
        }

        $result = $this->authenticateAI($website);
        return $result['success'] ?? false;
    }

    public function checkApiStatus()
    {
        try {
            $response = Http::timeout(5)->get("{$this->externalApiUrl}/api/chats");
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Chat API status check failed: ' . $e->getMessage());
            return false;
        }
    }

    public function syncAndGetLatestChat()
    {
        try {
            $response = Http::timeout(10)
                ->post("{$this->externalApiUrl}/api/chats/sync-and-get-latest");

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] ?? false) {
                    return $data['latest_chat'] ?? null;
                }
            }
            return null;
        } catch (\Exception $e) {
            Log::error('Failed to sync and get latest chat: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send a message to the AI chat with intelligent provider selection
     *
     * @param int $chatId Chat ID from database
     * @param string $message Message text to send
     * @param array $files Optional files to attach
     * @param string|null $website AI website to use ('deepseek' or 'gemini'). If null, automatically selects based on task type
     * @param bool $autoAuthenticate Whether to auto-authenticate if not connected
     * @return array Response with success status and AI response
     */
    public function sendMessage($chatId, $message, $files = [], $website = null, $autoAuthenticate = true)
    {
        try {
            if (!$this->checkApiStatus()) {
                throw new \Exception('خدمة الذكاء الاصطناعي غير متاحة حالياً');
            }

            $website = $website ?? $this->selectBestAI(
                !empty($files) ? 'document_extraction' : 'text_chat',
                !empty($files)
            );

            if ($autoAuthenticate && !$this->isWebsiteConnected($website)) {
                $authResult = $this->authenticateAI($website, true);
                if (!($authResult['success'] ?? false)) {
                    Log::warning("Failed to authenticate with {$website}, continuing anyway");
                }
            }

            if (!empty($files)) {
                return $this->sendMessageWithFiles($chatId, $message, $files, $website);
            }

            $response = Http::timeout($this->timeout)
                ->post("{$this->externalApiUrl}/api/external/chat", [
                    'chat_id' => $chatId,
                    'message' => $message,
                    'website' => $website,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] ?? false) {
                    Log::info("Message sent successfully via {$website}");
                    return [
                        'success' => true,
                        'response' => $data['response'],
                        'chat_id' => $data['chat_id'] ?? $chatId,
                        'website' => $data['website'] ?? $website,
                    ];
                } else {
                    Log::warning("AI response failed: " . ($data['message'] ?? 'Unknown error'));
                    return [
                        'success' => false,
                        'error' => $data['message'] ?? 'فشل في الحصول على استجابة من الذكاء الاصطناعي',
                        'website' => $website,
                    ];
                }
            }

            Log::error("External API response unsuccessful: " . $response->status());
            return [
                'success' => false,
                'error' => 'الخدمة الخارجية لا تستجيب. الرجاء المحاولة لاحقاً.',
                'website' => $website,
            ];
        } catch (\Exception $e) {
            Log::error('Chat API message error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'خطأ في الاتصال بخدمة الذكاء الاصطناعي: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send a message with file attachments to the AI chat
     *
     * @param int $chatId Chat ID from database
     * @param string $message Message text to send
     * @param array $files Files to attach
     * @param string $website AI website to use (defaults to Gemini for file analysis)
     * @return array Response with success status and AI response
     */
    private function sendMessageWithFiles($chatId, $message, $files, $website = self::GEMINI)
    {
        try {
            $http = Http::timeout($this->timeout)->asMultipart();
            $http = $http->attach('chat_id', $chatId);
            $http = $http->attach('message', $message);
            $http = $http->attach('website', $website);

            foreach ($files as $file) {
                $http = $http->attach(
                    'files',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                );
            }

            $response = $http->post("{$this->externalApiUrl}/api/external/chat");

            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] ?? false) {
                    return [
                        'success' => true,
                        'response' => $data['response'],
                        'chat_id' => $data['chat_id'] ?? $chatId,
                        'website' => $data['website'] ?? $website,
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => $data['message'] ?? 'فشل في الحصول على استجابة من الذكاء الاصطناعي',
                        'website' => $website,
                    ];
                }
            }

            return [
                'success' => false,
                'error' => 'الخدمة الخارجية لا تستجيب. الرجاء المحاولة لاحقاً.',
                'website' => $website,
            ];
        } catch (\Exception $e) {
            Log::error('Chat API file upload error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'خطأ في الاتصال بخدمة الذكاء الاصطناعي: ' . $e->getMessage(),
            ];
        }
    }

    public function extractJsonFromResponse($aiResponse)
    {
        $jsonStart = strpos($aiResponse, '{');
        $jsonEnd = strrpos($aiResponse, '}');

        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonString = substr($aiResponse, $jsonStart, $jsonEnd - $jsonStart + 1);
            $extractedData = json_decode($jsonString, true);

            if (json_last_error() === JSON_ERROR_NONE && $extractedData) {
                return $extractedData;
            }
        }

        return null;
    }

    public function generateTimetable($chatId, $timetableData)
    {
        try {
            $classInfo = $timetableData['class_info'] ?? [];
            $teacherInfo = $timetableData['teacher_info'] ?? [];
            $subjectsInfo = $timetableData['subjects_info'] ?? [];
            $preferences = $timetableData['preferences'] ?? [];

            $classDescription = $classInfo['name_ar'] ?? $classInfo['name'] ?? 'Unknown Class';
            $classDescText = $classInfo['description_ar'] ?? $classInfo['description'] ?? '';

            $teacherSpecialization = $teacherInfo['specialization_ar'] ?? $teacherInfo['specialization'] ?? '';
            $teacherExperience = $teacherInfo['experience_years'] ?? 0;

            $subjectsList = [];
            if (!empty($subjectsInfo)) {
                foreach ($subjectsInfo as $subject) {
                    $subjectsList[] = ($subject['name_ar'] ?? $subject['name']) . ' (' . ($subject['code'] ?? '') . ')';
                }
            }
            $subjectsText = implode(', ', $subjectsList);

            $educationCategory = $timetableData['education_category'] ?? 'عام';
            $startTime = $preferences['start_time'] ?? '08:00';
            $endTime = $preferences['end_time'] ?? '16:00';
            $sessionDuration = $preferences['session_duration'] ?? 50;
            $daysOfWeek = $preferences['days_of_week'] ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            $daysText = implode(', ', $daysOfWeek);

            $prompt = sprintf(
                'أنا أقوم بإنشاء جدول دراسي ذكي لفصل دراسي. أرجو منك تحليل المعلومات التالية وإرسال مقترح جدول زمني بصيغة JSON فقط، بدون أي نص إضافي:

معلومات الفصل:
- الاسم: %s
- الوصف: %s
- الفئة التعليمية: %s
- المستوى: %s

معلومات المعلم:
- التخصص: %s
- سنوات الخبرة: %d

المواد المتاحة:
%s

تفضيلات الجدول الزمني:
- وقت البداية: %s
- وقت النهاية: %s
- مدة الحصة: %d دقيقة
- أيام الدراسة: %s
- عدد الفصول المراد جدولتها: %d

الرجاء إنشاء جدول دراسي منطقي يتضمن:
1. توزيع المواد على أيام الأسبوع
2. توزيع متوازن للحصص
3. مراعاة تخصص المعلم وخبرته في توزيع المواد
4. تجنب التعارضات الزمنية

يجب أن يكون الرد بصيغة JSON فقط، بهذا التنسيق بدون أي نص قبله أو بعده:
{
  "timetable": [
    {"day": "Monday", "time_start": "08:00", "time_end": "08:50", "subject_name": "Mathematics", "subject_name_ar": "الرياضيات", "subject_code": "MATH", "room_number": "101", "notes": ""}
  ],
  "logic_explanation": "شرح عن المنطق المستخدم في توزيع المواد",
  "suggestions": ["اقتراح 1", "اقتراح 2"]
}',
                $classDescription,
                $classDescText,
                $educationCategory,
                $timetableData['class_level'] ?? 'Primary',
                $teacherSpecialization,
                $teacherExperience,
                implode("\n", array_map(fn($s) => '- ' . $s, $subjectsList)),
                $startTime,
                $endTime,
                $sessionDuration,
                $daysText,
                count($subjectsInfo)
            );

            return $this->sendMessage($chatId, $prompt, [], self::DEEPSEEK);
        } catch (\Exception $e) {
            Log::error('Timetable generation error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'خطأ في إنشاء الجدول الزمني: ' . $e->getMessage(),
            ];
        }
    }
}
