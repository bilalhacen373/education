<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Timetable;
use App\Models\ClassModel;
use App\Models\Teacher;
use App\Models\Subject;
use App\Services\ChatApiService;
use App\Models\ChatConversation;
use App\Models\ChatMessage;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Timetable::with(['class.school', 'subject', 'teacher.user']);

        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classIds = $teacher->classes()->pluck('classes.id');
                $query->whereIn('class_id', $classIds)
                    ->orWhere('teacher_id', $teacher->id);
            }
        } elseif ($user->isStudent()) {
            $student = $user->student;
            if ($student && $student->class_id) {
                $query->where('class_id', $student->class_id);
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->whereHas('class', function($q) use ($school) {
                    $q->where('school_id', $school->id);
                });
            }
        }

        if ($request->has('day')) {
            $query->where('day_of_week', $request->day);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $timetables = $query->orderBy('day_of_week')->orderBy('start_time')->get();

        $groupedByDay = $timetables->groupBy('day_of_week');

        return Inertia::render('Timetable/Index', [
            'timetables' => $timetables,
            'groupedByDay' => $groupedByDay,
            'filters' => $request->only(['day', 'class_id']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $classes = [];
        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classes = $teacher->classes()->with('school')->get();
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $classes = $school->classes()->with('teachers')->get();
            }
        }

        return Inertia::render('Timetable/Create', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_number' => 'nullable|string|max:100',
        ]);

        $existingSlot = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($existingSlot) {
            return back()->withErrors(['time' => 'يوجد تعارض في الوقت مع حصة أخرى']);
        }

        Timetable::create($validated);

        return redirect()->route('timetable.index')
            ->with('success', 'تم إضافة الحصة للجدول بنجاح');
    }

    public function show(Timetable $timetable)
    {
        $timetable->load(['class.school', 'subject', 'teacher.user']);

        return Inertia::render('Timetable/Show', [
            'timetable' => $timetable,
        ]);
    }

    public function edit(Timetable $timetable)
    {
        $user = auth()->user();

        $classes = [];
        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classes = $teacher->classes()->with('school')->get();
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $classes = $school->classes()->with('teachers')->get();
            }
        }

        return Inertia::render('Timetable/Edit', [
            'timetable' => $timetable,
            'classes' => $classes,
        ]);
    }

    public function update(Request $request, Timetable $timetable)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day_of_week' => 'required|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_number' => 'nullable|string|max:100',
        ]);

        $existingSlot = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $timetable->id)
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($existingSlot) {
            return back()->withErrors(['time' => 'يوجد تعارض في الوقت مع حصة أخرى']);
        }

        $timetable->update($validated);

        return redirect()->route('timetable.show', $timetable)
            ->with('success', 'تم تحديث الحصة بنجاح');
    }

    public function destroy(Timetable $timetable)
    {
        $timetable->delete();

        return redirect()->route('timetable.index')
            ->with('success', 'تم حذف الحصة من الجدول بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return redirect()->route('dashboard');
        }

        $query = Timetable::with(['class.teachers', 'subject', 'teacher.user'])
            ->whereHas('class', function($q) use ($school) {
                $q->where('school_id', $school->id);
            });

        if ($request->has('day')) {
            $query->where('day_of_week', $request->day);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $timetables = $query->orderBy('day_of_week')->orderBy('start_time')->get();
        $groupedByDay = $timetables->groupBy('day_of_week');
        $classes = $school->classes()->with(['teachers.user', 'subjects'])->get();
        $subjects = Subject::active()->orderBy('order')->get();
        $teachers = Teacher::where('school_id', $school->id)->with('user')->active()->get();

        return Inertia::render('SchoolAdmin/Timetable', [
            'timetables' => $timetables,
            'groupedByDay' => $groupedByDay,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    public function adminStore(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_number' => 'nullable|string|max:100',
        ]);

        $class = ClassModel::findOrFail($validated['class_id']);
        if ($class->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $teacher = Teacher::findOrFail($validated['teacher_id']);
        if ($teacher->school_id !== $school->id) {
            return back()->withErrors(['error' => 'المعلم غير تابع لهذه المدرسة']);
        }

        $classTeacherExists = $class->teachers()->where('teachers.id', $validated['teacher_id'])->exists();
        if (!$classTeacherExists) {
            return back()->withErrors(['error' => 'المعلم غير مسجل في هذا الفصل']);
        }

        $classSubjectExists = $class->subjects()->where('subject_id', $validated['subject_id'])->exists();
        if (!$classSubjectExists) {
            return back()->withErrors(['error' => 'المادة غير مسجلة في هذا الفصل']);
        }

        $existingSlot = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($existingSlot) {
            return back()->withErrors(['time' => 'يوجد تعارض في الوقت مع حصة أخرى']);
        }

        Timetable::create($validated);

        return back()->with('success', 'تم إضافة الحصة للجدول بنجاح');
    }

    public function adminUpdate(Request $request, Timetable $timetable)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_number' => 'nullable|string|max:100',
        ]);

        $class = ClassModel::findOrFail($validated['class_id']);
        if ($class->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $existingSlot = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $timetable->id)
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($existingSlot) {
            return back()->withErrors(['time' => 'يوجد تعارض في الوقت مع حصة أخرى']);
        }

        $timetable->update($validated);

        return back()->with('success', 'تم تحديث الحصة بنجاح');
    }

    public function adminDestroy(Timetable $timetable)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school || $timetable->class->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $timetable->delete();

        return back()->with('success', 'تم حذف الحصة من الجدول بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $classIds = $teacher->classes()->pluck('classes.id');

        $query = Timetable::with(['class', 'subject', 'teacher.user', 'lesson'])
            ->where(function($q) use ($classIds, $teacher) {
                $q->whereIn('class_id', $classIds)
                    ->orWhere('teacher_id', $teacher->id);
            });

        if ($request->has('day')) {
            $query->where('day_of_week', $request->day);
        }

        $timetables = $query->orderBy('day_of_week')->orderBy('start_time')->get();
        $groupedByDay = $timetables->groupBy('day_of_week');
        $classes = $teacher->classes()->get();

        $subjects = \App\Models\Subject::active()->orderBy('name_ar')->get();

        $lessons = \App\Models\Lesson::where('teacher_id', $teacher->id)
            ->with('subject')
            ->whereNotNull('subject_id')
            ->published()
            ->orderBy('title_ar')
            ->get();

        return Inertia::render('Teacher/Timetable', [
            'timetables' => $timetables,
            'groupedByDay' => $groupedByDay,
            'classes' => $classes,
            'subjects' => $subjects,
            'lessons' => $lessons,
        ]);
    }

    public function teacherStore(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_number' => 'nullable|string|max:100',
        ]);

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك إضافة جدول لهذا الفصل']);
        }

        $validated['teacher_id'] = $teacher->id;

        $existingSlot = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($existingSlot) {
            return back()->withErrors(['time' => 'يوجد تعارض في الوقت مع حصة أخرى']);
        }

        Timetable::create($validated);

        return back()->with('success', 'تم إضافة الحصة للجدول بنجاح');
    }

    public function generateWithAI(Request $request, ChatApiService $chatApiService)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'error' => 'ملف المعلم غير موجود',
            ], 403);
        }

        $validated = $request->validate([
            'class_ids' => 'required|array',
            'class_ids.*' => 'exists:classes,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'session_duration' => 'required|integer|min:30|max:120',
            'days_of_week' => 'required|array',
            'days_of_week.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        ]);

        try {
            $results = [];

            foreach ($validated['class_ids'] as $classId) {
                $class = ClassModel::with(['educationCategory', 'subjects'])->find($classId);

                if (!$class || $class->school_id !== $teacher->school_id && !$teacher->classes()->where('id', $classId)->exists()) {
                    continue;
                }

                $conversationId = $teacher->ai_chat_id;

                if (!$conversationId) {
                    $conversation = ChatConversation::create([
                        'user_id' => $user->id,
                        'title' => "AI Timetable Generator - {$teacher->user->name}",
                        'is_active' => true,
                    ]);
                    $conversationId = $conversation->id;
                    $teacher->update(['ai_chat_id' => $conversationId]);
                }

                $conversation = ChatConversation::find($conversationId);
                if (!$conversation) {
                    continue;
                }

                $externalChatId = $conversation->external_chat_id ?? 1;

                if (!$externalChatId) {
                    $latestChat = $chatApiService->syncAndGetLatestChat();
                    if ($latestChat && isset($latestChat['id'])) {
                        $externalChatId = $latestChat['id'];
                        $conversation->update(['external_chat_id' => $externalChatId]);
                    }
                }

                $timetableData = [
                    'class_info' => [
                        'id' => $class->id,
                        'name' => $class->name,
                        'name_ar' => $class->name_ar,
                        'description' => $class->description,
                        'description_ar' => $class->description_ar,
                    ],
                    'teacher_info' => [
                        'specialization' => $teacher->specialization,
                        'specialization_ar' => $teacher->specialization_ar,
                        'experience_years' => $teacher->experience_years,
                    ],
                    'subjects_info' => $class->subjects->map(function($subject) {
                        return [
                            'id' => $subject->id,
                            'name' => $subject->name,
                            'name_ar' => $subject->name_ar,
                            'code' => $subject->code,
                        ];
                    })->toArray(),
                    'education_category' => $class->educationCategory->name_ar ?? 'عام',
                    'class_level' => ucfirst($class->name),
                    'preferences' => [
                        'start_time' => $validated['start_time'],
                        'end_time' => $validated['end_time'],
                        'session_duration' => $validated['session_duration'],
                        'days_of_week' => $validated['days_of_week'],
                    ],
                ];

                $aiResult = $chatApiService->generateTimetable($externalChatId, $timetableData);

                if ($aiResult['success']) {
                    $aiResponse = $aiResult['response'];
                    $extractedData = $chatApiService->extractJsonFromResponse($aiResponse);

                    if ($extractedData && isset($extractedData['timetable'])) {
                        $createdCount = 0;

                        foreach ($extractedData['timetable'] as $slot) {
                            $dayMap = [
                                'Monday' => 'monday',
                                'Tuesday' => 'tuesday',
                                'Wednesday' => 'wednesday',
                                'Thursday' => 'thursday',
                                'Friday' => 'friday',
                                'Saturday' => 'saturday',
                                'Sunday' => 'sunday',
                            ];

                            $subject = Subject::where('code', $slot['subject_code'] ?? null)->first();

                            if (!$subject) {
                                $subject = Subject::where('name_ar', $slot['subject_name_ar'] ?? null)->first();
                            }

                            if (!$subject) {
                                continue;
                            }

                            $dayOfWeek = $dayMap[ucfirst($slot['day'])] ?? 'monday';

                            $existingSlot = Timetable::where('class_id', $class->id)
                                ->where('day_of_week', $dayOfWeek)
                                ->where(function($query) use ($slot) {
                                    $query->whereBetween('start_time', [$slot['time_start'], $slot['time_end']])
                                        ->orWhereBetween('end_time', [$slot['time_start'], $slot['time_end']])
                                        ->orWhere(function($q) use ($slot) {
                                            $q->where('start_time', '<=', $slot['time_start'])
                                                ->where('end_time', '>=', $slot['time_end']);
                                        });
                                })
                                ->exists();

                            if (!$existingSlot) {
                                Timetable::create([
                                    'class_id' => $class->id,
                                    'subject_id' => $subject->id,
                                    'teacher_id' => $teacher->id,
                                    'day_of_week' => $dayOfWeek,
                                    'start_time' => $slot['time_start'],
                                    'end_time' => $slot['time_end'],
                                    'room_number' => $slot['room_number'] ?? null,
                                    'is_active' => true,
                                ]);
                                $createdCount++;
                            }
                        }

                        ChatMessage::create([
                            'conversation_id' => $conversationId,
                            'role' => 'user',
                            'content' => "إنشاء جدول دراسي للفصل: {$class->name_ar}",
                        ]);

                        ChatMessage::create([
                            'conversation_id' => $conversationId,
                            'role' => 'assistant',
                            'content' => $aiResponse,
                        ]);

                        $conversation->touch();

                        $results[] = [
                            'class_id' => $class->id,
                            'class_name' => $class->name_ar,
                            'success' => true,
                            'created_slots' => $createdCount,
                            'explanation' => $extractedData['logic_explanation'] ?? '',
                            'suggestions' => $extractedData['suggestions'] ?? [],
                        ];
                    } else {
                        $results[] = [
                            'class_id' => $class->id,
                            'class_name' => $class->name_ar,
                            'success' => false,
                            'error' => 'فشل في تحليل استجابة الذكاء الاصطناعي',
                        ];
                    }
                } else {
                    $results[] = [
                        'class_id' => $class->id,
                        'class_name' => $class->name_ar,
                        'success' => false,
                        'error' => $aiResult['error'] ?? 'فشل في الحصول على استجابة من الذكاء الاصطناعي',
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'results' => $results,
                'message' => 'تم إنشاء الجداول الدراسية بنجاح',
            ]);
        } catch (\Exception $e) {
            \Log::error('Timetable AI generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'خطأ في إنشاء الجداول الدراسية: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generateForSchoolWithAI(Request $request, ChatApiService $chatApiService)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return response()->json([
                'success' => false,
                'error' => 'المدرسة غير موجودة',
            ], 403);
        }

        $validated = $request->validate([
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'exists:classes,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'session_duration' => 'required|integer|min:30|max:120',
            'days_of_week' => 'required|array',
            'days_of_week.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        ]);

        try {
            $query = ClassModel::with(['educationCategory', 'subjects', 'teachers'])->where('school_id', $school->id);

            if (!empty($validated['class_ids'])) {
                $query->whereIn('id', $validated['class_ids']);
            }

            $classes = $query->get();

            $results = [];

            foreach ($classes as $class) {
                $classTeachers = !empty($validated['teacher_ids'])
                    ? $class->teachers()->whereIn('id', $validated['teacher_ids'])->get()
                    : $class->teachers;

                foreach ($classTeachers as $teacher) {
                    if (!$teacher->is_active) {
                        continue;
                    }

                    $conversationId = $teacher->ai_chat_id;

                    if (!$conversationId) {
                        $conversation = ChatConversation::create([
                            'user_id' => $teacher->user_id,
                            'title' => "AI Timetable Generator - {$teacher->user->name}",
                            'is_active' => true,
                        ]);
                        $conversationId = $conversation->id;
                        $teacher->update(['ai_chat_id' => $conversationId]);
                    }

                    $conversation = ChatConversation::find($conversationId);
                    if (!$conversation) {
                        continue;
                    }

                    $externalChatId = $conversation->external_chat_id ?? 1;

                    if (!$externalChatId) {
                        $latestChat = $chatApiService->syncAndGetLatestChat();
                        if ($latestChat && isset($latestChat['id'])) {
                            $externalChatId = $latestChat['id'];
                            $conversation->update(['external_chat_id' => $externalChatId]);
                        }
                    }

                    $timetableData = [
                        'class_info' => [
                            'id' => $class->id,
                            'name' => $class->name,
                            'name_ar' => $class->name_ar,
                            'description' => $class->description,
                            'description_ar' => $class->description_ar,
                        ],
                        'teacher_info' => [
                            'specialization' => $teacher->specialization,
                            'specialization_ar' => $teacher->specialization_ar,
                            'experience_years' => $teacher->experience_years,
                        ],
                        'subjects_info' => $class->subjects->map(function($subject) {
                            return [
                                'id' => $subject->id,
                                'name' => $subject->name,
                                'name_ar' => $subject->name_ar,
                                'code' => $subject->code,
                            ];
                        })->toArray(),
                        'education_category' => $class->educationCategory->name_ar ?? 'عام',
                        'class_level' => ucfirst($class->name),
                        'preferences' => [
                            'start_time' => $validated['start_time'],
                            'end_time' => $validated['end_time'],
                            'session_duration' => $validated['session_duration'],
                            'days_of_week' => $validated['days_of_week'],
                        ],
                    ];

                    $aiResult = $chatApiService->generateTimetable($externalChatId, $timetableData);

                    if ($aiResult['success']) {
                        $aiResponse = $aiResult['response'];
                        $extractedData = $chatApiService->extractJsonFromResponse($aiResponse);

                        if ($extractedData && isset($extractedData['timetable'])) {
                            $createdCount = 0;

                            foreach ($extractedData['timetable'] as $slot) {
                                $dayMap = [
                                    'Monday' => 'monday', 'Tuesday' => 'tuesday', 'Wednesday' => 'wednesday',
                                    'Thursday' => 'thursday', 'Friday' => 'friday', 'Saturday' => 'saturday',
                                    'Sunday' => 'sunday',
                                ];

                                $subject = Subject::where('code', $slot['subject_code'] ?? null)->first();
                                if (!$subject) {
                                    $subject = Subject::where('name_ar', $slot['subject_name_ar'] ?? null)->first();
                                }

                                if (!$subject) {
                                    continue;
                                }

                                $dayOfWeek = $dayMap[ucfirst($slot['day'])] ?? 'monday';

                                $existingSlot = Timetable::where('class_id', $class->id)
                                    ->where('day_of_week', $dayOfWeek)
                                    ->where(function($query) use ($slot) {
                                        $query->whereBetween('start_time', [$slot['time_start'], $slot['time_end']])
                                            ->orWhereBetween('end_time', [$slot['time_start'], $slot['time_end']])
                                            ->orWhere(function($q) use ($slot) {
                                                $q->where('start_time', '<=', $slot['time_start'])
                                                    ->where('end_time', '>=', $slot['time_end']);
                                            });
                                    })
                                    ->exists();

                                if (!$existingSlot) {
                                    Timetable::create([
                                        'class_id' => $class->id,
                                        'subject_id' => $subject->id,
                                        'teacher_id' => $teacher->id,
                                        'day_of_week' => $dayOfWeek,
                                        'start_time' => $slot['time_start'],
                                        'end_time' => $slot['time_end'],
                                        'room_number' => $slot['room_number'] ?? null,
                                        'is_active' => true,
                                    ]);
                                    $createdCount++;
                                }
                            }

                            ChatMessage::create([
                                'conversation_id' => $conversationId,
                                'role' => 'user',
                                'content' => "إنشاء جدول دراسي للفصل: {$class->name_ar}",
                            ]);

                            ChatMessage::create([
                                'conversation_id' => $conversationId,
                                'role' => 'assistant',
                                'content' => $aiResponse,
                            ]);

                            $conversation->touch();

                            $results[] = [
                                'class_id' => $class->id,
                                'class_name' => $class->name_ar,
                                'teacher_id' => $teacher->id,
                                'teacher_name' => $teacher->user->name,
                                'success' => true,
                                'created_slots' => $createdCount,
                                'explanation' => $extractedData['logic_explanation'] ?? '',
                            ];
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'results' => $results,
                'message' => 'تم إنشاء الجداول الدراسية بنجاح للمدرسة',
            ]);
        } catch (\Exception $e) {
            \Log::error('School timetable AI generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'خطأ في إنشاء الجداول الدراسية: ' . $e->getMessage(),
            ], 500);
        }
    }
}
