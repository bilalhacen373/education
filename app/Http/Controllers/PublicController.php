<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\EducationCategory;
use App\Models\ClassEnrollmentRequest;
use App\Models\CourseEnrollmentRequest;
use App\Models\Favorite;
use App\Models\Review;
use App\Models\Student;
use App\Models\Payment;

class PublicController extends Controller
{
    public function browseCourses(Request $request)
    {
        $query = Course::with(['teacher.user', 'subjects', 'classes.educationCategory', 'classes.educationSubcategory'])
            ->where('is_published', true)
            ->withCount([
                'enrollmentRequests as enrollment_count' => function ($q) {
                    $q->where('status', 'approved');
                },
                'lessons as lessons_count'
            ])
            ->withAvg('reviews as average_rating', 'rating');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('description_ar', 'like', "%{$search}%");
            });
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty_level', $request->difficulty);
        }

        if ($request->filled('is_free')) {
            $query->where('is_free', $request->is_free === 'true' ? true : false);
        }

        if ($request->filled('subject_id')) {
            $query->whereHas('subjects', function($q) use ($request) {
                $q->where('subjects.id', $request->subject_id);
            });
        }

        if ($request->filled('category_id')) {
            $query->whereHas('classes', function($q) use ($request) {
                $q->where('category_id', $request->category_id);
                if ($request->filled('subcategory_id')) {
                    $q->where('education_subcategory_id', $request->subcategory_id);
                }
            });
        }

        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'popular':
                    $query->orderByDesc('enrollment_count');
                    break;
                case 'newest':
                    $query->latest();
                    break;
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                default:
                    $query->latest();
            }
        } else {
            $query->latest();
        }

        $courses = $query->paginate(12)->withQueryString();

        if (auth()->check() && auth()->user()->isStudent()) {
            $student = auth()->user()->student;
            if ($student) {
                $courseIds = $courses->pluck('id')->toArray();
                $enrollmentRequests = CourseEnrollmentRequest::where('student_id', $student->id)
                    ->whereIn('course_id', $courseIds)
                    ->get()
                    ->keyBy('course_id');

                $courses->getCollection()->transform(function ($course) use ($enrollmentRequests) {
                    $course->enrollment_request = $enrollmentRequests->get($course->id);
                    return $course;
                });
            }
        }

        $subjects = Subject::active()->orderBy('name_ar')->get(['id', 'name', 'name_ar']);
        $categories = EducationCategory::with('subcategories:id,category_id,name,name_ar')
            ->orderBy('display_order')
            ->get(['id', 'name', 'name_ar']);

        return Inertia::render('Public/BrowseCourses', [
            'courses' => $courses,
            'filters' => $request->only(['search', 'difficulty', 'is_free', 'subject_id', 'category_id', 'subcategory_id', 'sort']),
            'subjects' => $subjects,
            'categories' => $categories,
        ]);
    }

    public function browseLessons(Request $request)
    {
        $query = Lesson::with(['teacher.user', 'subject', 'course'])
            ->where('is_published', true)
            ->where('sharing_mode', 'public');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('description_ar', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_free')) {
            $query->where('is_free', $request->is_free === 'true' ? true : false);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'newest':
                    $query->latest();
                    break;
                case 'oldest':
                    $query->oldest();
                    break;
                case 'title':
                    $query->orderBy('title_ar', 'asc');
                    break;
                default:
                    $query->latest();
            }
        } else {
            $query->latest();
        }

        $lessons = $query->paginate(12)->withQueryString();

        $subjects = Subject::active()->orderBy('name_ar')->get(['id', 'name', 'name_ar']);

        return Inertia::render('Public/BrowseLessons', [
            'lessons' => $lessons,
            'filters' => $request->only(['search', 'type', 'is_free', 'subject_id', 'teacher_id', 'sort']),
            'subjects' => $subjects,
        ]);
    }

    public function browseClasses(Request $request)
    {
        $query = ClassModel::with([
            'mainTeacher.user',
            'teachers.user',
            'subjects',
            'school',
            'educationCategory',
            'educationSubcategory'
        ])
            ->where('is_active', true)
            ->withCount('students');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('description_ar', 'like', "%{$search}%")
                    ->orWhere('class_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('subject_id')) {
            $query->whereHas('subjects', function($q) use ($request) {
                $q->where('subjects.id', $request->subject_id);
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
            if ($request->filled('subcategory_id')) {
                $query->where('education_subcategory_id', $request->subcategory_id);
            }
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('has_space')) {
            if ($request->has_space === 'true') {
                // استخدام subquery بدلاً من whereColumn
//                $query->whereHas('students', function($q) {
//                    $q->where('status', 'approved');
//                }, '<', DB::raw('max_students'));

                // أو بدلاً من ذلك:
                $query->whereRaw('(select count(*) from class_enrollment_requests where class_id = classes.id and status = "approved") < max_students');
            }
        }

        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'newest':
                    $query->latest();
                    break;
                case 'name':
                    $query->orderBy('name_ar', 'asc');
                    break;
                case 'students':
                    // للترتيب بعدد الطلاب، نحتاج إلى join أو subquery
                    $query->withCount(['students as students_count' => function($q) {
                        $q->where('status', 'approved');
                    }])->orderByDesc('students_count');
                    break;
                default:
                    $query->latest();
            }
        } else {
            $query->latest();
        }

        $classes = $query->paginate(12)->withQueryString();

        $classes->getCollection()->transform(function ($class) {
            $class->available_spots = $class->max_students - $class->students_count;
            $class->is_full = $class->students_count >= $class->max_students;
            return $class;
        });

        if (auth()->check() && auth()->user()->isStudent()) {
            $student = auth()->user()->student;
            if ($student) {
                $classIds = $classes->pluck('id')->toArray();
                $enrollmentRequests = ClassEnrollmentRequest::where('student_id', $student->id)
                    ->whereIn('class_id', $classIds)
                    ->get()
                    ->keyBy('class_id');

                $classes->getCollection()->transform(function ($class) use ($enrollmentRequests) {
                    $class->enrollment_request = $enrollmentRequests->get($class->id);
                    return $class;
                });
            }
        }

        $subjects = Subject::active()->orderBy('name_ar')->get(['id', 'name', 'name_ar']);
        $categories = EducationCategory::with('subcategories:id,category_id,name,name_ar')
            ->orderBy('display_order')
            ->get(['id', 'name', 'name_ar']);

        return Inertia::render('Public/BrowseClasses', [
            'classes' => $classes,
            'filters' => $request->only(['search', 'subject_id', 'category_id', 'subcategory_id', 'academic_year', 'has_space', 'sort']),
            'subjects' => $subjects,
            'categories' => $categories,
        ]);
    }

    public function requestClassEnrollment(Request $request, ClassModel $class)
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'يجب تسجيل الدخول أولاً');
        }

        $user = auth()->user();
        if (!$user->isStudent()) {
            return back()->withErrors(['error' => 'يجب أن تكون طالباً للانضمام إلى فصل']);
        }

        $student = $user->student;
        if (!$student) {
            return back()->withErrors(['error' => 'يجب إكمال بيانات الطالب أولاً']);
        }

        if ($class->student_count >= $class->max_students) {
            return back()->withErrors(['error' => 'الفصل ممتلئ']);
        }

        $existingRequest = ClassEnrollmentRequest::where('student_id', $student->id)
            ->where('class_id', $class->id)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return back()->withErrors(['error' => 'لديك طلب قيد الانتظار بالفعل']);
            }
            if ($existingRequest->status === 'approved') {
                return back()->withErrors(['error' => 'أنت مسجل في هذا الفصل بالفعل']);
            }
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        ClassEnrollmentRequest::create([
            'student_id' => $student->id,
            'class_id' => $class->id,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'تم إرسال طلب الانضمام بنجاح');
    }

    public function showCourse(Course $course)
    {
        $course->load([
            'teacher.user',
            'subjects',
            'lessons' => function ($q) {
                $q->where('is_published', true)->orderBy('order_index');
            },
            'classes.educationCategory',
            'classes.educationSubcategory'
        ]);

        $course->loadCount([
            'enrollmentRequests as enrollment_count' => function ($q) {
                $q->where('status', 'approved');
            },
            'lessons as lessons_count'
        ]);

        $reviews = Review::where('reviewee_type', Course::class)
            ->where('reviewee_id', $course->id)
            ->where('is_approved', true)
            ->with('reviewer')
            ->latest()
            ->paginate(10);

        $averageRating = Review::where('reviewee_type', Course::class)
            ->where('reviewee_id', $course->id)
            ->where('is_approved', true)
            ->avg('rating');

        $enrollmentRequest = null;
        $isFavorite = false;
        $hasReviewed = false;

        if (auth()->check() && auth()->user()->isStudent()) {
            $student = auth()->user()->student;
            if ($student) {
                $enrollmentRequest = CourseEnrollmentRequest::where('student_id', $student->id)
                    ->where('course_id', $course->id)
                    ->first();

                $isFavorite = Favorite::where('user_id', auth()->id())
                    ->where('favoritable_type', Course::class)
                    ->where('favoritable_id', $course->id)
                    ->exists();

                $hasReviewed = Review::where('reviewer_id', auth()->id())
                    ->where('reviewee_type', Course::class)
                    ->where('reviewee_id', $course->id)
                    ->exists();
            }
        }

        return Inertia::render('Public/ShowCourse', [
            'course' => $course,
            'reviews' => $reviews,
            'averageRating' => round($averageRating ?? 0, 1),
            'enrollmentRequest' => $enrollmentRequest,
            'isFavorite' => $isFavorite,
            'hasReviewed' => $hasReviewed,
        ]);
    }

    public function requestCourseEnrollment(Request $request, Course $course)
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'يجب تسجيل الدخول أولاً');
        }

        $user = auth()->user();
        if (!$user->isStudent()) {
            return back()->withErrors(['error' => 'يجب أن تكون طالباً للتسجيل في الكورس']);
        }

        $student = $user->student;
        if (!$student) {
            return back()->withErrors(['error', 'يجب إكمال بيانات الطالب أولاً']);
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

        if (!$course->is_free && ($course->price > 0 || $course->enrollment_fee > 0)) {
            $totalAmount = ($course->price ?? 0) + ($course->enrollment_fee ?? 0);
            return redirect()->route('public.courses.checkout', $course->id)
                ->with('totalAmount', $totalAmount);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        CourseEnrollmentRequest::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'message' => $validated['message'] ?? null,
            'status' => $course->requires_approval ? 'pending' : 'approved',
        ]);

        return back()->with('success', 'تم إرسال طلب التسجيل بنجاح');
    }

    public function showLesson(Lesson $lesson)
    {
        if (!$lesson->is_published || $lesson->sharing_mode !== 'public') {
            abort(404);
        }

        $lesson->load(['teacher.user', 'subject', 'course']);

        $reviews = Review::where('reviewee_type', Lesson::class)
            ->where('reviewee_id', $lesson->id)
            ->where('is_approved', true)
            ->with('reviewer')
            ->latest()
            ->paginate(10);

        $averageRating = Review::where('reviewee_type', Lesson::class)
            ->where('reviewee_id', $lesson->id)
            ->where('is_approved', true)
            ->avg('rating');

        $isFavorite = false;
        $hasReviewed = false;
        $progress = null;

        if (auth()->check() && auth()->user()->isStudent()) {
            $student = auth()->user()->student;
            if ($student) {
                $isFavorite = Favorite::where('user_id', auth()->id())
                    ->where('favoritable_type', Lesson::class)
                    ->where('favoritable_id', $lesson->id)
                    ->exists();

                $hasReviewed = Review::where('reviewer_id', auth()->id())
                    ->where('reviewee_type', Lesson::class)
                    ->where('reviewee_id', $lesson->id)
                    ->exists();

                $progress = $lesson->progress()
                    ->where('student_id', $student->id)
                    ->first();
            }
        }

        return Inertia::render('Public/ShowLesson', [
            'lesson' => $lesson,
            'reviews' => $reviews,
            'averageRating' => round($averageRating ?? 0, 1),
            'isFavorite' => $isFavorite,
            'hasReviewed' => $hasReviewed,
            'progress' => $progress,
        ]);
    }

    public function showClass(ClassModel $class)
    {
        $class->load([
            'mainTeacher.user',
            'teachers.user',
            'subjects',
            'school',
            'educationCategory',
            'educationSubcategory'
        ]);

        $class->loadCount('students');
        $class->available_spots = $class->max_students - $class->students_count;
        $class->is_full = $class->students_count >= $class->max_students;

        $reviews = Review::where('reviewee_type', ClassModel::class)
            ->where('reviewee_id', $class->id)
            ->where('is_approved', true)
            ->with('reviewer')
            ->latest()
            ->paginate(10);

        $averageRating = Review::where('reviewee_type', ClassModel::class)
            ->where('reviewee_id', $class->id)
            ->where('is_approved', true)
            ->avg('rating');

        $enrollmentRequest = null;
        $isFavorite = false;
        $hasReviewed = false;

        if (auth()->check() && auth()->user()->isStudent()) {
            $student = auth()->user()->student;
            if ($student) {
                $enrollmentRequest = ClassEnrollmentRequest::where('student_id', $student->id)
                    ->where('class_id', $class->id)
                    ->first();

                $isFavorite = Favorite::where('user_id', auth()->id())
                    ->where('favoritable_type', ClassModel::class)
                    ->where('favoritable_id', $class->id)
                    ->exists();

                $hasReviewed = Review::where('reviewer_id', auth()->id())
                    ->where('reviewee_type', ClassModel::class)
                    ->where('reviewee_id', $class->id)
                    ->exists();
            }
        }

        return Inertia::render('Public/ShowClass', [
            'class' => $class,
            'reviews' => $reviews,
            'averageRating' => round($averageRating ?? 0, 1),
            'enrollmentRequest' => $enrollmentRequest,
            'isFavorite' => $isFavorite,
            'hasReviewed' => $hasReviewed,
        ]);
    }

    public function toggleFavorite(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        $validated = $request->validate([
            'type' => 'required|in:course,lesson,class',
            'id' => 'required|integer',
        ]);

        $typeMap = [
            'course' => Course::class,
            'lesson' => Lesson::class,
            'class' => ClassModel::class,
        ];

        $type = $typeMap[$validated['type']];

        $favorite = Favorite::where('user_id', auth()->id())
            ->where('favoritable_type', $type)
            ->where('favoritable_id', $validated['id'])
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['isFavorite' => false, 'message' => 'تمت الإزالة من المفضلة']);
        }

        Favorite::create([
            'user_id' => auth()->id(),
            'favoritable_type' => $type,
            'favoritable_id' => $validated['id'],
        ]);

        return response()->json(['isFavorite' => true, 'message' => 'تمت الإضافة للمفضلة']);
    }

    public function submitReview(Request $request)
    {
        if (!auth()->check()) {
            return back()->withErrors(['error' => 'يجب تسجيل الدخول أولاً']);
        }

        $validated = $request->validate([
            'type' => 'required|in:course,lesson,class',
            'id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $typeMap = [
            'course' => Course::class,
            'lesson' => Lesson::class,
            'class' => ClassModel::class,
        ];

        $type = $typeMap[$validated['type']];

        $existingReview = Review::where('reviewer_id', auth()->id())
            ->where('reviewee_type', $type)
            ->where('reviewee_id', $validated['id'])
            ->first();

        if ($existingReview) {
            return back()->withErrors(['error' => 'لقد قمت بالتقييم مسبقاً']);
        }

        Review::create([
            'reviewer_id' => auth()->id(),
            'reviewee_type' => $type,
            'reviewee_id' => $validated['id'],
            'rating' => $validated['rating'],
            'comment_ar' => $validated['comment'],
            'is_approved' => true,
        ]);

        return back()->with('success', 'تم إرسال التقييم بنجاح');
    }

    public function courseCheckout(Course $course)
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'يجب تسجيل الدخول أولاً');
        }

        $user = auth()->user();
        if (!$user->isStudent()) {
            return redirect()->back()->withErrors(['error' => 'يجب أن تكون طالباً للتسجيل في الكورس']);
        }

        $student = $user->student;
        if (!$student) {
            return redirect()->back()->withErrors(['error' => 'يجب إكمال بيانات الطالب أولاً']);
        }

        $existingRequest = CourseEnrollmentRequest::where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingRequest && $existingRequest->status === 'approved') {
            return redirect()->route('public.courses.show', $course->id)
                ->with('error', 'أنت مسجل في هذا الكورس بالفعل');
        }

        $totalAmount = ($course->price ?? 0) + ($course->enrollment_fee ?? 0);

        return Inertia::render('Public/CourseCheckout', [
            'course' => $course->load('teacher.user', 'subjects'),
            'totalAmount' => $totalAmount,
            'coursePrice' => $course->price ?? 0,
            'enrollmentFee' => $course->enrollment_fee ?? 0,
        ]);
    }

    public function processCoursePayment(Request $request, Course $course)
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        if (!$user->isStudent()) {
            return back()->withErrors(['error' => 'يجب أن تكون طالباً للتسجيل في الكورس']);
        }

        $student = $user->student;
        if (!$student) {
            return back()->withErrors(['error' => 'يجب إكمال بيانات الطالب أولاً']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:direct',
            'amount' => 'required|numeric|min:0',
            'message' => 'nullable|string|max:500',
        ]);

        $totalAmount = ($course->price ?? 0) + ($course->enrollment_fee ?? 0);

        if ($validated['amount'] != $totalAmount) {
            return back()->withErrors(['error' => 'المبلغ غير صحيح']);
        }

        DB::beginTransaction();
        try {
            $payment = Payment::create([
                'payer_id' => $student->id,
                'payer_type' => Student::class,
                'amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_type' => 'course_enrollment',
                'status' => 'pending',
                'reference_id' => $course->id,
                'reference_type' => Course::class,
                'description' => "Course registration fees: {$course->title}",
                'description_ar' => "رسوم التسجيل في الكورس: {$course->title_ar}",
            ]);

            $enrollmentRequest = CourseEnrollmentRequest::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'message' => $validated['message'] ?? null,
                'status' => 'pending',
                'payment_id' => $payment->id,
            ]);

            DB::commit();

            return redirect()->route('public.courses.show', $course->id)
                ->with('success', 'تم إرسال طلب التسجيل والدفع بنجاح. سيتم مراجعة طلبك قريباً');

        } catch (\Exception $e) {
            dd($e->getMessage());
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء معالجة الطلب']);
        }
    }
}
