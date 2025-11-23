<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\CourseEnrollmentRequest;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Course::with(['teacher', 'teacher.user', 'class', 'lessons']);

        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $query->where('teacher_id', $teacher->id);
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

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $courses = $query->latest()->paginate(15);

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'filters' => $request->only('search'),
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
                $classes = $school->classes()->with('teacher.user')->get();
            }
        }

        return Inertia::render('Courses/Create', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'class_id' => 'nullable|exists:classes,id',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'required|string',
            'subject' => 'required|string|max:255',
            'subject_ar' => 'required|string|max:255',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'learning_objectives' => 'required|array',
            'prerequisites' => 'nullable|array',
            'is_free' => 'nullable|boolean',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('courses/thumbnails', 'public');
        }

        $validated['is_published'] = false;

        $course = Course::create($validated);

        return redirect()->route('courses.show', $course)
            ->with('success', 'تم إنشاء الكورس بنجاح');
    }

    public function show(Course $course)
    {
        $course->load([
            'teacher',
            'teacher.user',
            'class.school',
            'lessons' => function($query) {
                $query->orderBy('order');
            },
        ]);

        $user = auth()->user();
        $progress = null;

        if ($user->isStudent() && $user->student) {
            $progress = $user->student->progress()
                ->whereHas('lesson', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })
                ->with('lesson')
                ->get();
        }

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'progress' => $progress,
        ]);
    }

    public function edit(Course $course)
    {
        $user = auth()->user();

        $classes = [];
        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classes = $teacher->classes()->with('school')->get();
            }
        }

        return Inertia::render('Courses/Edit', [
            'course' => $course,
            'classes' => $classes,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'required|string|max:255',
            'level' => 'required|string|max:50',
            'duration_weeks' => 'required|integer|min:1',
            'thumbnail' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('courses/thumbnails', 'public');
        }

        $course->update($validated);

        return redirect()->route('courses.show', $course)
            ->with('success', 'تم تحديث الكورس بنجاح');
    }

    public function destroy(Course $course)
    {
        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $course->delete();

        return redirect()->route('courses.index')
            ->with('success', 'تم حذف الكورس بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $courses = $teacher->courses()
            ->with(['classes', 'subjects', 'lessons.subject'])
            ->withCount([
                'enrollmentRequests as enrollment_count' => function ($query) {
                    $query->where('status', 'approved');
                }
            ])
            ->where('teacher_id', $teacher->id)
            ->get();

        $classes = $teacher->classes()->with('school')->get();
        $subjects = \App\Models\Subject::active()->orderBy('name_ar')->get();

        return Inertia::render('Teacher/Courses', [
            'courses' => $courses,
            'classes' => $classes,
            'subjects' => $subjects,
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
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'exists:classes,id',
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'required|string',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'learning_objectives' => 'required|array',
            'prerequisites' => 'nullable|array',
            'enrollment_conditions' => 'nullable|string',
            'enrollment_conditions_ar' => 'nullable|string',
            'requires_approval' => 'nullable|boolean',
            'enrollment_fee' => 'nullable|numeric|min:0',
            'is_free' => 'nullable|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $courseData = [
            'title' => $validated['title'],
            'title_ar' => $validated['title_ar'],
            'description' => $validated['description'],
            'description_ar' => $validated['description_ar'],
            'difficulty_level' => $validated['difficulty_level'],
            'duration_hours' => $validated['duration_hours'],
            'price' => $validated['price'] ?? 0,
            'learning_objectives' => $validated['learning_objectives'],
            'prerequisites' => $validated['prerequisites'] ?? [],
            'enrollment_conditions' => $validated['enrollment_conditions'] ?? null,
            'enrollment_conditions_ar' => $validated['enrollment_conditions_ar'] ?? null,
            'requires_approval' => $validated['requires_approval'] ?? true,
            'enrollment_fee' => $validated['enrollment_fee'] ?? 0,
            'is_free' => $validated['is_free'] ?? true,
            'teacher_id' => $teacher->id,
            'is_published' => false,
        ];

        if ($request->hasFile('image')) {
            $courseData['image'] = $request->file('image')->store('courses/images', 'public');
        }

        $course = Course::create($courseData);

        if($request->has('class_ids') && !empty($request->class_ids)) {
            $course->classes()->sync($validated['class_ids']);
        }
        $course->subjects()->sync($validated['subject_ids']);

        return back()->with('success', 'تم إنشاء الكورس بنجاح');
    }

    public function teacherUpdate(Request $request, Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $request->merge([
            'is_published' => $request->has('is_published') ? 1 : 0
        ]);

        $validated = $request->validate([
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'exists:classes,id',
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'required|string',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'learning_objectives' => 'required|array',
            'prerequisites' => 'nullable|array',
            'enrollment_conditions' => 'nullable|string',
            'enrollment_conditions_ar' => 'nullable|string',
            'requires_approval' => 'nullable|boolean',
            'enrollment_fee' => 'nullable|numeric|min:0',
            'is_free' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $courseData = [
            'title' => $validated['title'],
            'title_ar' => $validated['title_ar'],
            'description' => $validated['description'],
            'description_ar' => $validated['description_ar'],
            'difficulty_level' => $validated['difficulty_level'],
            'duration_hours' => $validated['duration_hours'],
            'price' => $validated['price'] ?? 0,
            'learning_objectives' => $validated['learning_objectives'],
            'prerequisites' => $validated['prerequisites'] ?? [],
            'enrollment_conditions' => $validated['enrollment_conditions'] ?? null,
            'enrollment_conditions_ar' => $validated['enrollment_conditions_ar'] ?? null,
            'requires_approval' => $validated['requires_approval'] ?? true,
            'enrollment_fee' => $validated['enrollment_fee'] ?? 0,
            'is_free' => $validated['is_free'] ?? true,
            'is_published' => $validated['is_published'] ?? false,
        ];

        if ($request->hasFile('image')) {
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            $courseData['image'] = $request->file('image')->store('courses/images', 'public');
        }

        $course->update($courseData);

        $course->classes()->sync($validated['class_ids'] ?? []);
        $course->subjects()->sync($validated['subject_ids']);

        return back()->with('success', 'تم تحديث الكورس بنجاح');
    }

    public function teacherDestroy(Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();

        return back()->with('success', 'تم حذف الكورس بنجاح');
    }

    public function studentIndex(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $query = Course::with(['teacher', 'teacher.user', 'class', 'class.educationCategory', 'class.educationSubcategory', 'lessons'])
            ->where('is_published', true);

        if ($student->education_category_id) {
            $query->whereHas('class', function($q) use ($student) {
                $q->where('education_category_id', $student->education_category_id);
                if ($student->education_subcategory_id) {
                    $q->where('education_subcategory_id', $student->education_subcategory_id);
                }
            });
        }

        $allCourses = $query->get();

        $enrolledCourses = collect();
        $availableCourses = collect();

        foreach ($allCourses as $course) {
            $totalLessons = $course->lessons->count();
            $completedLessons = $student->progress()
                ->whereHas('lesson', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })
                ->where('status', 'completed')
                ->count();

            $course->progress_percentage = $totalLessons > 0
                ? round(($completedLessons / $totalLessons) * 100)
                : 0;
            $course->completed_lessons = $completedLessons;
            $course->lessons_count = $totalLessons;

            if ($student->class_id && $course->class_id === $student->class_id) {
                $enrolledCourses->push($course);
            } else {
                $availableCourses->push($course);
            }
        }

        $enrollmentRequests = CourseEnrollmentRequest::where('student_id', $student->id)->get();

        return Inertia::render('Student/Courses', [
            'availableCourses' => $availableCourses,
            'enrolledCourses' => $enrolledCourses,
            'enrollmentRequests' => $enrollmentRequests,
        ]);
    }

    public function studentShow(Course $course)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student || $student->class_id !== $course->class_id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $course->load([
            'teacher',
            'teacher.user',
            'class',
            'lessons' => function($query) {
                $query->orderBy('order');
            },
        ]);

        $progress = $student->progress()
            ->whereHas('lesson', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->with('lesson')
            ->get()
            ->keyBy('lesson_id');

        return Inertia::render('Student/CourseShow', [
            'course' => $course,
            'progress' => $progress,
        ]);
    }

    public function requestEnrollment(Request $request, Course $course)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return back()->withErrors(['error' => 'يجب إكمال بيانات الطالب أولاً']);
        }

        $existingRequest = CourseEnrollmentRequest::where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return back()->withErrors(['error' => 'لديك طلب قيد الانتظار بالفعل']);
            }
            if ($existingRequest->status === 'approved') {
                return back()->withErrors(['error' => 'أنت مسجل في هذا الكورس بالفعل']);
            }
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
            'accepted_conditions' => 'required|accepted',
        ]);

        CourseEnrollmentRequest::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'تم إرسال طلب التسجيل بنجاح');
    }

    public function myEnrollmentRequests()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $requests = CourseEnrollmentRequest::with(['course.teacher.user', 'reviewer'])
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return Inertia::render('Student/EnrollmentRequests', [
            'requests' => $requests,
        ]);
    }

    public function teacherEnrollmentRequests()
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $requests = CourseEnrollmentRequest::with(['student.user', 'course'])
            ->whereHas('course', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })
            ->latest()
            ->get();

        return Inertia::render('Teacher/EnrollmentRequests', [
            'requests' => $requests,
        ]);
    }

    public function approveEnrollment(CourseEnrollmentRequest $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $request->course->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $request->approve($user->id);

        return back()->with('success', 'تم قبول الطالب بنجاح');
    }

    public function rejectEnrollment(Request $req, CourseEnrollmentRequest $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $request->course->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $req->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $request->reject($user->id, $validated['rejection_reason'] ?? null);

        return back()->with('success', 'تم رفض الطلب');
    }

    public function togglePublish(Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $course->update(['is_published' => !$course->is_published]);

        return response()->json([
            'success' => true,
            'is_published' => $course->is_published,
            'message' => $course->is_published ? 'تم نشر الكورس' : 'تم إلغاء نشر الكورس'
        ]);
    }

    public function toggleFree(Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $course->update(['is_free' => !$course->is_free]);

        return response()->json([
            'success' => true,
            'is_free' => $course->is_free,
            'message' => $course->is_free ? 'تم جعل الكورس مجاني' : 'تم جعل الكورس مدفوع'
        ]);
    }

    public function getAvailableLessons(Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }


        $courseSubjectIds = $course->subjects()->pluck('subjects.id')->toArray();

        $attachedLessonIds = $course->lessons()->pluck('lessons.id')->toArray();

        $availableLessons = \App\Models\Lesson::where('teacher_id', $teacher->id)
            ->whereNotIn('id', $attachedLessonIds)
            ->where('is_standalone', true)
            ->where('is_published', true)
            ->when(count($courseSubjectIds) > 0, function($query) use ($courseSubjectIds) {
                return $query->whereIn('subject_id', $courseSubjectIds);
            })
            ->with(['subject'])
            ->orderBy('title_ar')
            ->get();

        return response()->json([
            'lessons' => $availableLessons,
        ]);
    }

    public function attachLessons(Request $request, Course $course)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'lesson_ids' => 'required|array',
            'lesson_ids.*' => 'exists:lessons,id',
        ]);

        foreach ($validated['lesson_ids'] as $lessonId) {
            $lesson = \App\Models\Lesson::find($lessonId);
            if ($lesson && $lesson->teacher_id === $teacher->id) {
                $lesson->update([
                    'course_id' => $course->id,
                    'is_standalone' => false,
                ]);
            }
        }

        return back()->with('success', 'تم إضافة الدروس إلى الكورس بنجاح');
    }

    public function detachLesson(Course $course, \App\Models\Lesson $lesson)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id || $lesson->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $lesson->update([
            'course_id' => null,
            'is_standalone' => true,
        ]);

        return back()->with('success', 'تم فصل الدرس من الكورس بنجاح');
    }
}
