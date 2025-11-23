<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\School;
use App\Models\ClassModel;
use App\Models\User;
use App\Models\EducationCategory;
use App\Models\EducationSubcategory;
use App\Services\UserChatService;
use App\Services\ChatApiService;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Exception;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Student::with(['user', 'school', 'class']);

        if ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->where('school_id', $school->id);
            }
        } elseif ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classIds = $teacher->classes()->pluck('id');
                $query->whereIn('class_id', $classIds);
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $students = $query->latest()->paginate(15);

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'class_id']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $schools = School::where('is_active', true)->get(['id', 'name']);

        $classes = [];
        if ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $classes = $school->classes()->with('teacher.user')->get();
            }
        }

        return Inertia::render('Students/Create', [
            'schools' => $schools,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'school_id' => 'nullable|exists:schools,id',
            'class_id' => 'nullable|exists:classes,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'enrollment_type' => 'required|in:school,independent',
            'education_category_id' => 'required|exists:education_categories,id',
            'education_subcategory_id' => 'required|exists:education_subcategories,id',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'user_type' => 'student',
                'is_active' => true,
            ]);

            $user->assignRole('student');

            Student::create([
                'user_id' => $user->id,
                'school_id' => $validated['school_id'] ?? null,
                'class_id' => $validated['class_id'] ?? null,
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'date_of_birth' => $validated['date_of_birth'],
                'address' => $validated['address'],
                'enrollment_type' => $validated['enrollment_type'],
                'education_category_id' => $validated['education_category_id'],
                'education_subcategory_id' => $validated['education_subcategory_id'],
                'is_active' => true,
            ]);
        });

        return redirect()->route('students.index')
            ->with('success', 'تم إضافة الطالب بنجاح');
    }

    public function show(Student $student)
    {
        $student->load([
            'user',
            'school',
            'class.teacher.user',
            'progress.lesson.course',
            'grades.class',
            'attendances.class',
        ]);

        $stats = [
            'total_courses' => $student->progress()->distinct('lesson_id')->count(),
            'completed_lessons' => $student->progress()->where('status', 'completed')->count(),
            'average_grade' => $student->getAverageGradeAttribute(),
            'attendance_rate' => $student->getAttendanceRateAttribute(),
        ];

        return Inertia::render('Students/Show', [
            'student' => $student,
            'stats' => $stats,
        ]);
    }

    public function edit(Student $student)
    {
        $user = auth()->user();

        $schools = School::where('is_active', true)->get(['id', 'name']);

        $classes = [];
        if ($student->school_id) {
            $classes = ClassModel::where('school_id', $student->school_id)
                ->with('teacher.user')
                ->get();
        }

        $student->load('user');

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'schools' => $schools,
            'classes' => $classes,
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'phone' => 'required|string|max:20',
            'school_id' => 'nullable|exists:schools,id',
            'class_id' => 'nullable|exists:classes,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'enrollment_type' => 'required|in:school,independent',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $student) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            $student->update([
                'school_id' => $validated['school_id'] ?? null,
                'class_id' => $validated['class_id'] ?? null,
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'date_of_birth' => $validated['date_of_birth'],
                'address' => $validated['address'],
                'enrollment_type' => $validated['enrollment_type'],
                'is_active' => $validated['is_active'] ?? $student->is_active,
            ]);
        });

        return redirect()->route('students.show', $student)
            ->with('success', 'تم تحديث بيانات الطالب بنجاح');
    }

    public function destroy(Student $student)
    {
        DB::transaction(function () use ($student) {
            $user = $student->user;
            $student->delete();
            $user->delete();
        });

        return redirect()->route('students.index')
            ->with('success', 'تم حذف الطالب بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $classIds = $teacher->classes()->pluck('classes.id');

        $query = Student::with(['user', 'class'])
            ->whereIn('class_id', $classIds);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('student_id', 'like', "%{$search}%");
        }

        $students = $query->latest()->get();
        $classes = $teacher->classes()->with('school')->get();

        return Inertia::render('Teacher/Students', [
            'students' => $students,
            'classes' => $classes,
            'schools' => []
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'class_id' => 'required|exists:classes,id',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'medical_info' => 'nullable|string',
        ]);

        $teacherClassIds = $teacher->classes()->pluck('classes.id');
        if (!$teacherClassIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك إضافة طلاب لهذا الفصل']);
        }

        DB::transaction(function () use ($validated, $teacher) {
            $password = 'password123';

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($password),
                'phone' => $validated['phone'] ?? null,
                'user_type' => 'student',
                'is_active' => true,
            ]);

            $user->assignRole('student');

            $enrollmentType = $teacher->school_id ? 'school' : 'independent_teacher';

            Student::create([
                'user_id' => $user->id,
                'student_id' => 'STD-' . date('Ymd-His') . '-' . rand(100, 999),
                'class_id' => $validated['class_id'],
                'school_id' => $teacher->school_id,
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'address' => $validated['address'] ?? null,
                'address_ar' => $validated['address_ar'] ?? null,
                'medical_info' => $validated['medical_info'] ?? null,
                'enrollment_type' => $enrollmentType,
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'تم إضافة الطالب بنجاح');
    }

    public function teacherUpdate(Request $request, Student $student)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $teacherClassIds = $teacher->classes()->pluck('classes.id');
        if (!$teacherClassIds->contains($student->class_id)) {
            return back()->withErrors(['error' => 'لا يمكنك تعديل هذا الطالب']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'phone' => 'nullable|string|max:20',
            'class_id' => 'required|exists:classes,id',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'medical_info' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (!$teacherClassIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك نقل الطالب لهذا الفصل']);
        }

        DB::transaction(function () use ($validated, $student) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);

            $student->update([
                'class_id' => $validated['class_id'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'address' => $validated['address'] ?? null,
                'address_ar' => $validated['address_ar'] ?? null,
                'medical_info' => $validated['medical_info'] ?? null,
                'is_active' => $validated['is_active'] ?? $student->is_active,
            ]);
        });

        return back()->with('success', 'تم تحديث بيانات الطالب بنجاح');
    }

    public function teacherDestroy(Student $student)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $teacherClassIds = $teacher->classes()->pluck('classes.id');
        if (!$teacherClassIds->contains($student->class_id)) {
            return back()->withErrors(['error' => 'لا يمكنك حذف هذا الطالب']);
        }

        DB::transaction(function () use ($student) {
            $user = $student->user;
            $student->delete();
            $user->delete();
        });

        return back()->with('success', 'تم حذف الطالب بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return redirect()->route('dashboard');
        }

        $query = Student::with(['user', 'class'])
            ->where('school_id', $school->id);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('student_id', 'like', "%{$search}%");
        }

        $students = $query->latest()->get();
        $classes = $school->classes()->with('teacher.user')->get();

        return Inertia::render('SchoolAdmin/Students', [
            'students' => $students,
            'classes' => $classes,
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
//            'student_id' => 'required|string|unique:students,student_id',
            'class_id' => 'required|exists:classes,id',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'medical_info' => 'nullable|string',
        ]);

        $validated['student_id'] = 'STD-' . date('Ymd-His') . '-' . rand(100, 999);

        DB::transaction(function () use ($validated, $school) {
            $password = 'password123';

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($password),
                'phone' => $validated['phone'] ?? null,
                'user_type' => 'student',
                'is_active' => true,
            ]);

            $user->assignRole('student');

            Student::create([
                'user_id' => $user->id,
                'student_id' => $validated['student_id'],
                'class_id' => $validated['class_id'],
                'school_id' => $school->id,
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'address' => $validated['address'] ?? null,
                'address_ar' => $validated['address_ar'] ?? null,
                'medical_info' => $validated['medical_info'] ?? null,
                'enrollment_type' => 'school',
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'تم إضافة الطالب بنجاح');
    }

    public function adminUpdate(Request $request, Student $student)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school || $student->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'phone' => 'nullable|string|max:20',
//            'student_id' => 'required|string|unique:students,student_id,' . $student->id,
            'class_id' => 'required|exists:classes,id',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'medical_info' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $student) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);

            $student->update([
                'student_id' => $validated['student_id'],
                'class_id' => $validated['class_id'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'parent_name' => $validated['parent_name'],
                'parent_phone' => $validated['parent_phone'],
                'parent_email' => $validated['parent_email'] ?? null,
                'address' => $validated['address'] ?? null,
                'address_ar' => $validated['address_ar'] ?? null,
                'medical_info' => $validated['medical_info'] ?? null,
                'is_active' => $validated['is_active'] ?? $student->is_active,
            ]);
        });

        return back()->with('success', 'تم تحديث بيانات الطالب بنجاح');
    }

    public function adminDestroy(Student $student)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school || $student->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        DB::transaction(function () use ($student) {
            $user = $student->user;
            $student->delete();
            $user->delete();
        });

        return back()->with('success', 'تم حذف الطالب بنجاح');
    }

    public function showCompleteProfile()
    {
        $user = auth()->user();

        if ($user->student && $user->student->student_id) {
            return redirect()->route('dashboard');
        }

        $schools = School::where('is_active', true)->get(['id', 'name', 'name_ar']);
        $categories = EducationCategory::with('subcategories')->orderBy('display_order')->get();

        return Inertia::render('Student/CompleteProfile', [
            'schools' => $schools,
            'categories' => $categories,
        ]);
    }

    public function completeProfile(Request $request, UserChatService $userChatService, ChatApiService $chatApiService)
    {
        $user = auth()->user();

        if (!$user->isStudent()) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        if ($user->student && $user->student->student_id) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'address' => 'required|string',
            'address_ar' => 'nullable|string',
            'medical_info' => 'nullable|string',
            'enrollment_type' => 'required|in:school,independent_teacher',
            'school_id' => 'nullable|exists:schools,id',
            'class_id' => 'nullable|exists:classes,id',
            'education_category_id' => 'required|exists:education_categories,id',
            'education_subcategory_id' => 'required|exists:education_subcategories,id',
        ]);

        $category = EducationCategory::find($validated['education_category_id']);
        $subcategory = EducationSubcategory::find($validated['education_subcategory_id']);

        $studentInfo = [
            'education_level' => $category->name_ar ?? $category->name ?? 'عام',
            'category_name' => $subcategory->name_ar ?? $subcategory->name ?? 'غير محدد',
        ];

        $chatApiService->ensureAuthenticated('deepseek');
        $aiChatId = $userChatService->createChatForStudent($user->id, $user->name_ar ?? $user->name, $studentInfo);

        $student = Student::create([
            'user_id' => $user->id,
            'student_id' => 'STD-' . date('Ymd-His') . '-' . rand(100, 999),
            'birth_date' => $validated['birth_date'],
            'gender' => $validated['gender'],
            'parent_name' => $validated['parent_name'],
            'parent_phone' => $validated['parent_phone'],
            'parent_email' => $validated['parent_email'] ?? null,
            'address' => $validated['address'] ?? null,
            'address_ar' => $validated['address_ar'] ?? null,
            'medical_info' => $validated['medical_info'] ?? null,
            'enrollment_type' => $validated['enrollment_type'],
            'school_id' => $validated['school_id'] ?? null,
            'class_id' => $validated['class_id'] ?? null,
            'education_category_id' => $validated['education_category_id'],
            'education_subcategory_id' => $validated['education_subcategory_id'],
            'is_active' => true,
            'ai_chat_id' => $aiChatId,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'تم إكمال البيانات بنجاح');
    }

    public function teacherImport(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'type' => 'required|in:excel,csv',
        ]);

        try {
            $file = $request->file('file');
            $type = $request->input('type');

            $students = $this->parseImportFile($file, $type);

            $teacherClassIds = $teacher->classes()->pluck('classes.id')->toArray();

            if (empty($teacherClassIds)) {
                return back()->withErrors(['error' => 'لا يوجد لديك فصول مسجلة']);
            }

            $defaultClassId = $teacherClassIds[0];

            $imported = 0;
            $errors = [];

            foreach ($students as $index => $studentData) {
                try {
                    $email = $studentData['email'] ?? null;

                    if (!$email) {
                        $errors[] = "الصف " . ($index + 2) . ": البريد الإلكتروني مطلوب";
                        continue;
                    }

                    if (User::where('email', $email)->exists()) {
                        $errors[] = "الصف " . ($index + 2) . ": البريد الإلكتروني {$email} مستخدم بالفعل";
                        continue;
                    }

                    DB::transaction(function () use ($studentData, $teacher, $defaultClassId, &$imported) {
                        $userData = User::create([
                            'name' => $studentData['name'] ?? 'طالب جديد',
                            'email' => $studentData['email'],
                            'password' => Hash::make($studentData['password'] ?? 'password123'),
                            'phone' => $studentData['phone'] ?? null,
                            'user_type' => 'student',
                            'is_active' => true,
                        ]);

                        $userData->assignRole('student');

                        Student::create([
                            'user_id' => $userData->id,
                            'student_id' => 'STD-' . date('Ymd-His') . '-' . rand(100, 999),
                            'class_id' => $studentData['class_id'] ?? $defaultClassId,
                            'school_id' => $teacher->school_id,
                            'birth_date' => $studentData['birth_date'] ?? now()->subYears(10),
                            'gender' => $studentData['gender'] ?? 'male',
                            'parent_name' => $studentData['parent_name'] ?? null,
                            'parent_phone' => $studentData['parent_phone'] ?? null,
                            'parent_email' => $studentData['parent_email'] ?? null,
                            'address' => $studentData['address'] ?? null,
                            'address_ar' => $studentData['address_ar'] ?? null,
                            'medical_info' => $studentData['medical_info'] ?? null,
                            'enrollment_type' => $teacher->school_id ? 'school' : 'independent_teacher',
                            'is_active' => true,
                        ]);

                        $imported++;
                    });
                } catch (Exception $e) {
                    $errors[] = "الصف " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            $message = "تم استيراد {$imported} طالب بنجاح";
            if (!empty($errors)) {
                $message .= ". الأخطاء: " . implode(', ', array_slice($errors, 0, 5));
            }

            return back()->with('success', $message);
        } catch (Exception $e) {
            return back()->withErrors(['file' => 'فشل استيراد الملف: ' . $e->getMessage()]);
        }
    }

    private function parseImportFile($file, $type)
    {
        $students = [];

        try {
            if ($type === 'csv') {
                $handle = fopen($file->getPathname(), 'r');
                $headers = fgetcsv($handle);
                $headers = $this->normalizeHeaders($headers);

                while (($row = fgetcsv($handle)) !== false) {
                    if (empty(array_filter($row))) continue;

                    $studentData = [];
                    foreach ($headers as $index => $header) {
                        $studentData[$header] = $row[$index] ?? null;
                    }
                    $students[] = $this->mapStudentData($studentData);
                }
                fclose($handle);
            } else {
                $spreadsheet = IOFactory::load($file->getPathname());
                $worksheet = $spreadsheet->getActiveSheet();
                $rows = $worksheet->toArray();

                if (empty($rows)) {
                    throw new Exception('الملف فارغ');
                }

                $headers = $this->normalizeHeaders($rows[0]);

                for ($i = 1; $i < count($rows); $i++) {
                    if (empty(array_filter($rows[$i]))) continue;

                    $studentData = [];
                    foreach ($headers as $index => $header) {
                        $studentData[$header] = $rows[$i][$index] ?? null;
                    }
                    $students[] = $this->mapStudentData($studentData);
                }
            }
        } catch (Exception $e) {
            throw new Exception('فشل قراءة الملف: ' . $e->getMessage());
        }

        return $students;
    }

    private function normalizeHeaders($headers)
    {
        $normalized = [];

        $headerMap = [
            'name' => ['name', 'اسم', 'الاسم', 'student name', 'student_name', 'full name', 'fullname'],
            'email' => ['email', 'بريد', 'البريد', 'student email', 'student_email', 'e-mail', 'mail'],
            'phone' => ['phone', 'هاتف', 'الهاتف', 'mobile', 'tel', 'telephone', 'رقم الهاتف'],
            'birth_date' => ['birth_date', 'birthdate', 'date of birth', 'dob', 'تاريخ الميلاد', 'تاريخ_الميلاد', 'birthday'],
            'gender' => ['gender', 'جنس', 'الجنس', 'sex'],
            'parent_name' => ['parent_name', 'parent name', 'اسم ولي الأمر', 'guardian name', 'guardian'],
            'parent_phone' => ['parent_phone', 'parent phone', 'هاتف ولي الأمر', 'guardian phone'],
            'parent_email' => ['parent_email', 'parent email', 'بريد ولي الأمر', 'guardian email'],
            'address' => ['address', 'عنوان', 'العنوان', 'location'],
            'address_ar' => ['address_ar', 'عنوان بالعربية', 'العنوان بالعربية'],
            'medical_info' => ['medical_info', 'medical', 'معلومات طبية', 'health info'],
            'class_id' => ['class_id', 'class', 'فصل', 'الفصل', 'classroom'],
            'password' => ['password', 'كلمة المرور', 'pwd', 'pass'],
        ];

        foreach ($headers as $index => $header) {
            $header = strtolower(trim($header));
            $mapped = false;

            foreach ($headerMap as $standardKey => $variations) {
                foreach ($variations as $variation) {
                    if (stripos($header, $variation) !== false) {
                        $normalized[$index] = $standardKey;
                        $mapped = true;
                        break 2;
                    }
                }
            }

            if (!$mapped) {
                $normalized[$index] = $header;
            }
        }

        return $normalized;
    }

    private function mapStudentData($data)
    {
        $mapped = [];

        $mapped['name'] = $data['name'] ?? $data['student_name'] ?? null;
        $mapped['email'] = $data['email'] ?? $data['student_email'] ?? null;
        $mapped['phone'] = $data['phone'] ?? $data['mobile'] ?? null;

        if (isset($data['birth_date'])) {
            try {
                $birthDate = $data['birth_date'];
                if (is_numeric($birthDate)) {
                    $birthDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($birthDate);
                    $mapped['birth_date'] = $birthDate->format('Y-m-d');
                } else {
                    $mapped['birth_date'] = date('Y-m-d', strtotime($birthDate));
                }
            } catch (Exception $e) {
                $mapped['birth_date'] = null;
            }
        }

        if (isset($data['gender'])) {
            $gender = strtolower(trim($data['gender']));
            if (in_array($gender, ['male', 'ذكر', 'm', 'boy'])) {
                $mapped['gender'] = 'male';
            } elseif (in_array($gender, ['female', 'أنثى', 'f', 'girl'])) {
                $mapped['gender'] = 'female';
            }
        }

        $mapped['parent_name'] = $data['parent_name'] ?? $data['guardian'] ?? null;
        $mapped['parent_phone'] = $data['parent_phone'] ?? $data['guardian_phone'] ?? null;
        $mapped['parent_email'] = $data['parent_email'] ?? $data['guardian_email'] ?? null;
        $mapped['address'] = $data['address'] ?? null;
        $mapped['address_ar'] = $data['address_ar'] ?? null;
        $mapped['medical_info'] = $data['medical_info'] ?? $data['medical'] ?? null;
        $mapped['password'] = $data['password'] ?? 'password123';

        return $mapped;
    }
}
