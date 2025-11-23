<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Course;
use App\Models\StudentProgress;
use App\Models\Student;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Smalot\PdfParser\Parser as PdfParser;
use Exception;

class LessonController extends Controller
{
    public function index(Request $request, Course $course)
    {
        $lessons = $course->lessons()->orderBy('order')->get();

        $user = auth()->user();
        $progress = null;

        if ($user->isStudent() && $user->student) {
            $progress = $user->student->progress()
                ->whereIn('lesson_id', $lessons->pluck('id'))
                ->get()
                ->keyBy('lesson_id');
        }

        return Inertia::render('Lessons/Index', [
            'course' => $course,
            'lessons' => $lessons,
            'progress' => $progress,
        ]);
    }

    public function create(Course $course = null)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')
                ->with('error', 'غير مصرح');
        }

        $classes = $teacher->classes()->with('students')->get();

        return Inertia::render('Teacher/Lessons/Create', [
            'course' => $course,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request, Course $course = null)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->merge([
            'is_standalone' => (bool) $request->get('is_standalone'),
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'content_text' => 'nullable|string',
            'notes' => 'nullable|string',
            'content_type' => 'required|in:text,video,document,mixed',
            'video_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimes:mp4,mpeg,mov,avi,webm|max:102400',
            'duration_minutes' => 'required|integer|min:1',
            'order' => 'required|integer|min:0',
            'documents' => 'nullable|array',
            'documents.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt|max:10240',
            'media_files' => 'nullable|array',
            'thumbnail' => 'nullable|image|max:2048',
            'is_standalone' => 'boolean',
            'sharing_mode' => 'required|in:private,class,custom,public',
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'exists:classes,id',
            'excluded_student_ids' => 'nullable|array',
            'excluded_student_ids.*' => 'exists:students,id',
        ]);

        $documents = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $document) {
                $path = $document->store('lessons/documents', 'public');
                $documents[] = [
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'name' => $document->getClientOriginalName(),
                    'size' => $document->getSize(),
                    'mime_type' => $document->getMimeType(),
                ];
            }
        }

        if ($request->hasFile('video_file')) {
            $videoPath = $request->file('video_file')->store('lessons/videos', 'public');
            $validated['video_url'] = Storage::disk('public')->url($videoPath);
            $validated['video_path'] = $videoPath;
        }

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('lessons/thumbnails', 'public');
        }

        if ($request->has('media_files') && is_array($request->media_files)) {
            $validated['media_files'] = $request->media_files;
        }

        $validated['order_index'] = 0;
        $validated['teacher_id'] = $teacher->id;
        $validated['course_id'] = $course ? $course->id : null;
        $validated['documents'] = $documents;
        $validated['is_published'] = $request->boolean('is_published', true);
        $validated['is_standalone'] = $request->boolean('is_standalone', $course === null);

        $lesson = Lesson::create($validated);

        if ($request->has('class_ids') && $validated['sharing_mode'] === 'class') {
            $lesson->classes()->attach($request->class_ids, [
                'is_active' => true,
                'assigned_at' => now(),
            ]);
        }

        if ($request->has('excluded_student_ids') && $validated['sharing_mode'] === 'custom') {
            foreach ($request->excluded_student_ids as $studentId) {
                $lesson->excludedStudents()->attach($studentId, [
                    'reason' => $request->input("exclusion_reason_{$studentId}"),
                    'excluded_at' => now(),
                ]);
            }
        }

        if ($course) {
            return redirect()->route('courses.show', $course)
                ->with('success', 'تم إضافة الدرس بنجاح');
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'تم إضافة الدرس بنجاح');
    }

    public function show(Lesson $lesson)
    {
        $user = auth()->user();

        if ($user->hasRole('teacher') && $user->teacher) {
            if ($lesson->teacher_id !== $user->teacher->id) {
                return redirect()->route('dashboard')
                    ->with('error', 'غير مصرح');
            }

            $lesson->load(['course', 'classes', 'excludedStudents', 'progress']);
            $students = $this->getLessonStudentsData($lesson);

            return Inertia::render('Teacher/Lessons/Show', [
                'lesson' => $lesson,
                'students' => $students,
            ]);
        }

        $lesson->load(['course.teacher.user', 'course.class', 'teacher.user']);
        $progress = null;

        if ($user->isStudent() && $user->student) {
            $progress = $user->student->progress()
                ->where('lesson_id', $lesson->id)
                ->first();

            if (!$progress) {
                $progress = StudentProgress::create([
                    'student_id' => $user->student->id,
                    'lesson_id' => $lesson->id,
                    'status' => 'in_progress',
                    'progress_percentage' => 0,
                ]);
            }
        }

        return Inertia::render('Student/LessonPlayer', [
            'lesson' => $lesson,
            'progress' => $progress,
        ]);
    }

    private function getLessonStudentsData($lesson)
    {
        $students = collect();

        if ($lesson->sharing_mode === 'class') {
            $students = Student::whereHas('class', function($q) use ($lesson) {
                $q->whereIn('classes.id', $lesson->classes->pluck('id'));
            })
                ->with(['user', 'class'])
                ->get();
        } elseif ($lesson->sharing_mode === 'custom') {
            $students = Student::with(['user', 'class'])->get();
        } elseif ($lesson->sharing_mode === 'public') {
            $students = Student::with(['user', 'class'])->get();
        }

        $excludedIds = $lesson->excludedStudents->pluck('id')->toArray();
        $progressData = $lesson->progress()
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        return $students->map(function($student) use ($excludedIds, $progressData) {
            return [
                'id' => $student->id,
                'name' => $student->user->name,
                'class' => $student->class->name ?? '',
                'is_excluded' => in_array($student->id, $excludedIds),
                'progress' => $progressData->get($student->id),
            ];
        })->toArray();
    }

    public function edit(Lesson $lesson)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $lesson->teacher_id !== $teacher->id) {
            return redirect()->route('dashboard')
                ->with('error', 'غير مصرح');
        }

        $lesson->load(['course', 'classes', 'excludedStudents']);
        $classes = $teacher->classes()->with('students')->get();
        $subjects = Subject::active()->orderBy('order')->get();

        return Inertia::render('Teacher/Lessons/Edit', [
            'lesson' => $lesson,
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    public function update(Request $request, Lesson $lesson)
    {

        $request->merge([
            'is_published' => $request->is_published === 'true' ? true : false,
        ]);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'content_text' => 'nullable|string',
            'notes' => 'nullable|string',
            'content_type' => 'required|in:text,video,document,mixed',
            'video_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimes:mp4,mpeg,mov,avi,webm|max:102400',
            'duration_minutes' => 'required|integer|min:1',
            'order' => 'required|integer|min:1',
            'documents' => 'nullable|array',
            'documents.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt|max:10240',
            'media_files' => 'nullable|array',
            'thumbnail' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'remove_documents' => 'nullable|array',
            'subject_id' => 'nullable|exists:subjects,id',
            'sharing_mode' => 'required|in:private,class,custom,public',
        ]);

        $documents = $lesson->documents ?? [];

        if ($request->has('remove_documents') && is_array($request->remove_documents)) {
            foreach ($request->remove_documents as $docPath) {
                $documents = array_filter($documents, function($doc) use ($docPath) {
                    if ($doc['path'] === $docPath) {
                        Storage::disk('public')->delete($docPath);
                        return false;
                    }
                    return true;
                });
            }
            $documents = array_values($documents);
        }

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $document) {
                $path = $document->store('lessons/documents', 'public');
                $documents[] = [
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'name' => $document->getClientOriginalName(),
                    'size' => $document->getSize(),
                    'mime_type' => $document->getMimeType(),
                ];
            }
        }

        if ($request->hasFile('video_file')) {
            if ($lesson->video_path) {
                Storage::disk('public')->delete($lesson->video_path);
            }
            $videoPath = $request->file('video_file')->store('lessons/videos', 'public');
            $validated['video_url'] = Storage::disk('public')->url($videoPath);
            $validated['video_path'] = $videoPath;
        }

        if ($request->hasFile('thumbnail')) {
            if ($lesson->thumbnail) {
                Storage::disk('public')->delete($lesson->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('lessons/thumbnails', 'public');
        }

        if ($request->has('media_files') && is_array($request->media_files)) {
            $validated['media_files'] = $request->media_files;
        }

        $validated['documents'] = $documents;

        $lesson->update($validated);

        if ($request->has('class_ids') && $lesson->sharing_mode === 'class') {
            $lesson->classes()->sync(
                collect($request->class_ids)->mapWithKeys(fn($classId) => [
                    $classId => [
                        'is_active' => true,
                        'assigned_at' => now(),
                    ]
                ])->toArray()
            );
        } else if ($lesson->sharing_mode !== 'class') {
            $lesson->classes()->detach();
        }

        if ($request->has('excluded_student_ids') && $lesson->sharing_mode === 'custom') {
            $excludedData = collect($request->excluded_student_ids)->mapWithKeys(function($studentId) use ($request) {
                return [
                    $studentId => [
                        'reason' => $request->input("exclusion_reason_{$studentId}"),
                        'excluded_at' => now(),
                    ]
                ];
            })->toArray();

            $lesson->excludedStudents()->sync($excludedData);
        } else if ($lesson->sharing_mode !== 'custom') {
            $lesson->excludedStudents()->detach();
        }

        return redirect()->route('teacher.lessons.show', $lesson)
            ->with('success', 'تم تحديث الدرس بنجاح');
    }

    public function destroy(Lesson $lesson)
    {
        if ($lesson->documents) {
            foreach ($lesson->documents as $document) {
                if (isset($document['path'])) {
                    Storage::disk('public')->delete($document['path']);
                }
            }
        }

        if ($lesson->video_path) {
            Storage::disk('public')->delete($lesson->video_path);
        }

        if ($lesson->thumbnail) {
            Storage::disk('public')->delete($lesson->thumbnail);
        }

        $courseId = $lesson->course_id;
        $lesson->delete();

        if ($courseId) {
            return redirect()->route('courses.show', $courseId)
                ->with('success', 'تم حذف الدرس بنجاح');
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'تم حذف الدرس بنجاح');
    }

    public function updateProgress(Request $request, Lesson $lesson)
    {
        $user = auth()->user();

        if (!$user->isStudent() || !$user->student) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'video_progress' => 'nullable|integer|min:0|max:100',
            'documents_read' => 'nullable|integer|min:0',
            'total_documents' => 'nullable|integer|min:0',
            'time_spent_minutes' => 'nullable|integer|min:0',
        ]);

        $progress = StudentProgress::firstOrCreate(
            [
                'student_id' => $user->student->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'status' => 'in_progress',
                'progress_percentage' => 0,
                'video_progress' => 0,
                'documents_read' => 0,
                'total_documents' => 0,
            ]
        );

        $updateData = [];

        if (isset($validated['video_progress'])) {
            $updateData['video_progress'] = $validated['video_progress'];
        }

        if (isset($validated['documents_read'])) {
            $updateData['documents_read'] = $validated['documents_read'];
        }

        if (isset($validated['total_documents'])) {
            $updateData['total_documents'] = $validated['total_documents'];
        }

        if (isset($validated['time_spent_minutes'])) {
            $updateData['time_spent_minutes'] = $validated['time_spent_minutes'];
        }

        $calculatedProgress = $this->calculateGlobalProgress($lesson, $progress, $updateData);
        $updateData['progress_percentage'] = $calculatedProgress;

        if ($calculatedProgress >= 100) {
            $updateData['status'] = 'completed';
            $updateData['completed_at'] = now();
        } else {
            $updateData['status'] = 'in_progress';
        }

        if (!$progress->started_at) {
            $updateData['started_at'] = now();
        }

        $progress->update($updateData);

        return response()->json([
            'message' => 'تم تحديث التقدم بنجاح',
            'progress' => $progress->fresh(),
        ]);
    }

    private function calculateGlobalProgress($lesson, $progress, $updateData)
    {
        $videoProgress = $updateData['video_progress'] ?? $progress->video_progress ?? 0;
        $documentsRead = $updateData['documents_read'] ?? $progress->documents_read ?? 0;
        $totalDocuments = $updateData['total_documents'] ?? $progress->total_documents ?? 0;

        if ($lesson->content_type === 'video' || $lesson->type === 'video') {
            return $videoProgress;
        }

        if ($lesson->content_type === 'document' || $lesson->type === 'document') {
            if ($totalDocuments > 0) {
                return (int) round(($documentsRead / $totalDocuments) * 100);
            }
            return 0;
        }

        if ($lesson->content_type === 'mixed' || $lesson->type === 'mixed') {
            $hasVideo = !empty($lesson->video_url);
            $hasDocuments = !empty($lesson->documents) && count($lesson->documents) > 0;

            if ($hasVideo && $hasDocuments) {
                $docProgress = $totalDocuments > 0 ? ($documentsRead / $totalDocuments) * 100 : 0;
                return (int) round(($videoProgress + $docProgress) / 2);
            } elseif ($hasVideo) {
                return $videoProgress;
            } elseif ($hasDocuments) {
                return $totalDocuments > 0 ? (int) round(($documentsRead / $totalDocuments) * 100) : 0;
            }
        }

        return $videoProgress;
    }

    public function studentIndex(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $lessons = Lesson::accessibleByStudent($student->id)
            ->with(['teacher.user', 'course', 'classes'])
            ->orderBy('created_at', 'desc')
            ->get();

        $completedLessonIds = $student->progress()
            ->whereIn('lesson_id', $lessons->pluck('id'))
            ->where('status', 'completed')
            ->pluck('lesson_id')
            ->toArray();

        return Inertia::render('Student/Lessons', [
            'course' => null,
            'lessons' => $lessons,
            'completedLessonIds' => $completedLessonIds,
        ]);
    }

    public function studentShow(Lesson $lesson)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $lesson->load(['course.teacher.user']);

        $progress = $student->progress()
            ->where('lesson_id', $lesson->id)
            ->first();

        $nextLesson = Lesson::where('course_id', $lesson->course_id)
            ->where('order', '>', $lesson->order)
            ->orderBy('order')
            ->first();

        $previousLesson = Lesson::where('course_id', $lesson->course_id)
            ->where('order', '<', $lesson->order)
            ->orderBy('order', 'desc')
            ->first();

        return Inertia::render('Student/LessonPlayer', [
            'lesson' => $lesson,
            'progress' => $progress,
            'nextLesson' => $nextLesson,
            'previousLesson' => $previousLesson,
        ]);
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $query = Lesson::where('teacher_id', $teacher->id)
            ->with(['course', 'classes', 'progress', 'excludedStudents']);

        if ($request->has('filter')) {
            switch ($request->filter) {
                case 'standalone':
                    $query->standalone();
                    break;
                case 'course':
                    $query->courseAttached();
                    break;
                case 'published':
                    $query->published();
                    break;
                case 'draft':
                    $query->where('is_published', false);
                    break;
            }
        }

        $lessons = $query->orderBy('created_at', 'desc')->paginate(20);

        $stats = [
            'total' => Lesson::where('teacher_id', $teacher->id)->count(),
            'standalone' => Lesson::where('teacher_id', $teacher->id)->standalone()->count(),
            'course_attached' => Lesson::where('teacher_id', $teacher->id)->courseAttached()->count(),
            'published' => Lesson::where('teacher_id', $teacher->id)->published()->count(),
        ];

        return Inertia::render('Teacher/Lessons', [
            'lessons' => $lessons,
            'stats' => $stats,
            'filter' => $request->filter,
        ]);
    }

    public function studentLessons(Course $course = null)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        if ($course) {
            $course->load(['teacher.user', 'class']);
            $lessons = $course->lessons()
                ->accessibleByStudent($student->id)
                ->orderBy('order')
                ->get();
        } else {
            $lessons = Lesson::accessibleByStudent($student->id)
                ->with(['teacher.user', 'course', 'classes'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $completedLessonIds = $student->progress()
            ->whereIn('lesson_id', $lessons->pluck('id'))
            ->where('status', 'completed')
            ->pluck('lesson_id')
            ->toArray();

        return Inertia::render('Student/Lessons', [
            'course' => $course,
            'lessons' => $lessons,
            'completedLessonIds' => $completedLessonIds,
        ]);
    }

    public function completeLesson(Request $request, Lesson $lesson)
    {
        $user = auth()->user();

        if (!$user->isStudent() || !$user->student) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $progress = StudentProgress::updateOrCreate(
            [
                'student_id' => $user->student->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'progress_percentage' => 100,
                'status' => 'completed',
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'تم تسجيل إكمال الدرس بنجاح',
            'progress' => $progress,
        ]);
    }

    public function manageSharing(Request $request, Lesson $lesson)
    {
        $user = auth()->user();

        if (!$user->teacher || $lesson->teacher_id !== $user->teacher->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'sharing_mode' => 'required|in:private,class,custom,public',
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'exists:classes,id',
        ]);

        $lesson->update([
            'sharing_mode' => $validated['sharing_mode'],
        ]);

        if (isset($validated['class_ids']) && in_array($validated['sharing_mode'], ['class', 'custom'])) {
            $lesson->classes()->sync(
                collect($validated['class_ids'])->mapWithKeys(fn($classId) => [
                    $classId => [
                        'is_active' => true,
                        'assigned_at' => now(),
                    ]
                ])->toArray()
            );
        }

        return response()->json([
            'message' => 'تم تحديث إعدادات المشاركة بنجاح',
            'lesson' => $lesson->load(['classes', 'excludedStudents']),
        ]);
    }

    public function manageExclusions(Request $request, Lesson $lesson)
    {
        $user = auth()->user();

        if (!$user->teacher || $lesson->teacher_id !== $user->teacher->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'reasons' => 'nullable|array',
        ]);

        $excludedData = collect($validated['student_ids'])->mapWithKeys(function($studentId) use ($validated) {
            return [
                $studentId => [
                    'reason' => $validated['reasons'][$studentId] ?? null,
                    'excluded_at' => now(),
                ]
            ];
        })->toArray();

        $lesson->excludedStudents()->sync($excludedData);

        return response()->json([
            'message' => 'تم تحديث قائمة الاستثناءات بنجاح',
            'lesson' => $lesson->load(['excludedStudents']),
        ]);
    }

    public function removeExclusion(Request $request, Lesson $lesson, Student $student)
    {
        $user = auth()->user();

        if (!$user->teacher || $lesson->teacher_id !== $user->teacher->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $lesson->excludedStudents()->detach($student->id);

        return response()->json([
            'message' => 'تم إلغاء استثناء الطالب بنجاح',
        ]);
    }

    public function getLessonStudents(Lesson $lesson)
    {
        $user = auth()->user();

        if (!$user->teacher || $lesson->teacher_id !== $user->teacher->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $students = collect();

        if ($lesson->sharing_mode === 'class') {
            $students = Student::whereHas('class', function($q) use ($lesson) {
                $q->whereIn('classes.id', $lesson->classes->pluck('id'));
            })
                ->with(['user', 'class'])
                ->get();
        } elseif ($lesson->sharing_mode === 'custom' || $lesson->sharing_mode === 'public') {
            $students = Student::with(['user', 'class'])->get();
        }

        $excludedIds = $lesson->excludedStudents->pluck('id')->toArray();
        $progressData = $lesson->progress()
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $studentsData = $students->map(function($student) use ($excludedIds, $progressData) {
            return [
                'id' => $student->id,
                'name' => $student->user->name,
                'class' => $student->class->name,
                'is_excluded' => in_array($student->id, $excludedIds),
                'progress' => $progressData->get($student->id),
            ];
        });

        return response()->json([
            'students' => $studentsData,
            'total' => $studentsData->count(),
            'excluded' => count($excludedIds),
            'accessible' => $studentsData->count() - count($excludedIds),
        ]);
    }

    public function parseDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,txt|max:10240',
        ]);

        try {
            $file = $request->file('document');
            $extension = strtolower($file->getClientOriginalExtension());

            $extractedData = [
                'title' => '',
                'title_ar' => '',
                'description' => '',
                'description_ar' => '',
                'content_text' => '',
                'duration_minutes' => 30,
            ];

            $text = '';

            if ($extension === 'pdf') {
                $parser = new PdfParser();
                $pdf = $parser->parseFile($file->getPathname());
                $text = $pdf->getText();
            } elseif (in_array($extension, ['doc', 'docx'])) {
                $phpWord = WordIOFactory::load($file->getPathname());
                $text = '';

                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        if (method_exists($element, 'getText')) {
                            $text .= $element->getText() . "\n";
                        } elseif (method_exists($element, 'getElements')) {
                            foreach ($element->getElements() as $childElement) {
                                if (method_exists($childElement, 'getText')) {
                                    $text .= $childElement->getText() . "\n";
                                }
                            }
                        }
                    }
                }
            } elseif ($extension === 'txt') {
                $text = file_get_contents($file->getPathname());
            }

            $text = trim($text);

            if (empty($text)) {
                return response()->json([
                    'error' => 'لم يتم العثور على نص في المستند'
                ], 422);
            }

            $lines = explode("\n", $text);
            $lines = array_filter(array_map('trim', $lines));
            $lines = array_values($lines);

            if (!empty($lines[0])) {
                $extractedData['title'] = $lines[0];
                $extractedData['title_ar'] = $this->containsArabic($lines[0]) ? $lines[0] : '';
            }

            if (count($lines) > 1 && strlen($lines[1]) < 200) {
                $description = $lines[1];
                $extractedData['description'] = $description;
                $extractedData['description_ar'] = $this->containsArabic($description) ? $description : '';
            }

            $contentStart = 2;
            if (count($lines) > 2 && strlen($lines[1]) >= 200) {
                $contentStart = 1;
            }

            $contentLines = array_slice($lines, $contentStart);
            $extractedData['content_text'] = implode("\n\n", $contentLines);

            $wordCount = str_word_count($text);
            $estimatedMinutes = max(5, ceil($wordCount / 150));
            $extractedData['duration_minutes'] = min($estimatedMinutes, 120);

            return response()->json([
                'success' => true,
                'data' => $extractedData,
                'stats' => [
                    'word_count' => $wordCount,
                    'character_count' => strlen($text),
                    'line_count' => count($lines),
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'فشل تحليل المستند: ' . $e->getMessage()
            ], 500);
        }
    }

    private function containsArabic($text)
    {
        return preg_match('/[\x{0600}-\x{06FF}]/u', $text);
    }
}
