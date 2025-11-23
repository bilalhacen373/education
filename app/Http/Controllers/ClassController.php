<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;


use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ClassModel;
use App\Models\School;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\EducationCategory;
use App\Models\EducationSubcategory;
use function MongoDB\BSON\toJSON;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = ClassModel::with(['school', 'mainTeacher.user', 'teachers.user', 'subjects', 'students', 'educationCategory', 'educationSubcategory']);

        if ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->where('school_id', $school->id);
            }
        } elseif ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $query->whereHas('teachers', function($q) use ($teacher) {
                    $q->where('teachers.id', $teacher->id);
                });
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('class_code', 'like', "%{$search}%");
            });
        }

        $classes = $query->latest()->paginate(15);

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $schools = [];
        $teachers = [];

        if ($user->isSuperAdmin()) {
            $schools = School::where('is_active', true)->get(['id', 'name']);
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $schools = [$school];
                $teachers = $school->teachers()->with('user')->get();
            }
        }

        return Inertia::render('Classes/Create', [
            'schools' => $schools,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
            'main_teacher_id' => 'nullable|exists:teachers,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'grade_level' => 'required|string|max:50',
            'description_ar' => 'nullable|string',
            'description' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
            'class_code' => 'nullable|string|max:50|unique:classes,class_code',
            'academic_year' => 'nullable|string|max:50',
            'education_category_id' => 'nullable|exists:education_categories,id',
            'education_subcategory_id' => 'nullable|exists:education_subcategories,id',
        ]);

        $validated['is_active'] = true;

        $class = ClassModel::create($validated);

        if (!empty($validated['teacher_ids'])) {
            $class->teachers()->attach($validated['teacher_ids']);
        }

        if (!empty($validated['subject_ids'])) {
            $class->subjects()->attach($validated['subject_ids']);
        }

        return redirect()->route('classes.index')
            ->with('success', 'تم إنشاء الفصل بنجاح');
    }

    public function show(ClassModel $class)
    {
        $class->load([
            'school',
            'teacher.user',
            'students.user',
            'courses.lessons',
            'attendances' => function($query) {
                $query->latest()->limit(10);
            },
            'timetables',
        ]);

        $stats = [
            'total_students' => $class->students()->count(),
            'attendance_rate' => $class->getAttendanceRateAttribute(),
            'average_grade' => $class->getAverageGradeAttribute(),
        ];

        return Inertia::render('Classes/Show', [
            'class' => $class,
            'stats' => $stats,
        ]);
    }

    public function edit(ClassModel $class)
    {
        $user = auth()->user();

        $schools = [];
        $teachers = [];

        if ($user->isSuperAdmin()) {
            $schools = School::where('is_active', true)->get(['id', 'name']);
            $teachers = Teacher::with('user')->get();
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $schools = [$school];
                $teachers = $school->teachers()->with('user')->get();
            }
        }

        return Inertia::render('Classes/Edit', [
            'class' => $class,
            'schools' => $schools,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, ClassModel $class)
    {
        $validated = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
            'teacher_id' => 'required|exists:teachers,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'subject_ar' => 'required|string|max:255',
            'grade_level' => 'required|string|max:50',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
            'settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $class->update($validated);

        return redirect()->route('classes.show', $class)
            ->with('success', 'تم تحديث الفصل بنجاح');
    }

    public function destroy(ClassModel $class)
    {
        $class->delete();

        return redirect()->route('classes.index')
            ->with('success', 'تم حذف الفصل بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $classes = $teacher->classes()
            ->with(['mainTeacher.user', 'school', 'students', 'subjects', 'educationCategory', 'educationSubcategory'])
            ->withCount([
                'students as student_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->get();

        $subjects = Subject::active()->orderBy('order')->get();
        $categories = EducationCategory::with('subcategories')->orderBy('display_order')->get();

        return Inertia::render('Teacher/Classes', [
            'classes' => $classes,
            'teacher_id' => $teacher->id,
            'subjects' => $subjects,
            'categories' => $categories,
        ]);
    }

    public function teacherStore(Request $request)
    {

        $user = auth()->user();
        $teacher = $user->teacher;
        $school = $teacher->school;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'name' => 'required_without:name_ar|nullable|string|max:255',
            'name_ar' => 'required_without:name|nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
//            'class_code' => 'nullable|string|max:50|unique:classes,class_code',
            'academic_year' => 'nullable|string|max:50',
            'education_category_id' => 'nullable|exists:education_categories,id',
            'education_subcategory_id' => 'nullable|exists:education_subcategories,id',
        ]);

        $validated['class_code'] = 'CLS-' . date('Ymd-His') . '-' . rand(100, 999);

        $validated['main_teacher_id'] = $teacher->id;
        $validated['teacher_ids'] = [$teacher->id];


        if($school) {
            $validated['school_id'] = $school->id;
        }

        $validated['is_active'] = true;

        $class = ClassModel::create($validated);

        if (!empty($validated['teacher_ids'])) {
            $class->teachers()->attach($validated['teacher_ids']);
        }

        if (!empty($validated['subject_ids'])) {
            $class->subjects()->attach($validated['subject_ids']);
        }

        return back()->with('success', 'تم إنشاء الفصل بنجاح');

    }

    public function teacherUpdate(Request $request, ClassModel $class)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $class->main_teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'name' => 'required_without:name_ar|nullable|string|max:255',
            'name_ar' => 'required_without:name|nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
//            'class_code' => 'nullable|string|max:50|unique:classes,class_code,' . $class->id,
            'academic_year' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'education_category_id' => 'nullable|exists:education_categories,id',
            'education_subcategory_id' => 'nullable|exists:education_subcategories,id',
        ]);

        $class->update($validated);

        if (isset($validated['subject_ids'])) {
            $class->subjects()->sync($validated['subject_ids']);
        }

        return back()->with('success', 'تم تحديث الفصل بنجاح');
    }

    public function teacherDestroy(ClassModel $class)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $class->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $class->delete();

        return back()->with('success', 'تم حذف الفصل بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return redirect()->route('dashboard');
        }

        $classes = $school->classes()
            ->with(['mainTeacher.user', 'teachers.user', 'subjects', 'students', 'educationCategory', 'educationSubcategory'])
            ->withCount([
                'students as student_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->get();

        $teachers = $school->teachers()->with('user')->get();
        $subjects = Subject::active()->orderBy('order')->get();
        $categories = EducationCategory::with('subcategories')->orderBy('display_order')->get();

        return Inertia::render('SchoolAdmin/Classes', [
            'classes' => $classes,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'categories' => $categories,
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
            'main_teacher_id' => 'nullable|exists:teachers,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
//            'class_code' => 'nullable|string|max:50|unique:classes,class_code',
            'academic_year' => 'nullable|string|max:50',
            'education_category_id' => 'nullable|exists:education_categories,id',
            'education_subcategory_id' => 'nullable|exists:education_subcategories,id',
        ]);

        $validated['class_code'] = 'CLS-' . date('Ymd-His') . '-' . rand(100, 999);

        $validated['school_id'] = $school->id;
        $validated['is_active'] = true;

        $class = ClassModel::create($validated);

        if (!empty($validated['teacher_ids'])) {
            $class->teachers()->attach($validated['teacher_ids']);
        }

        if (!empty($validated['subject_ids'])) {
            $class->subjects()->attach($validated['subject_ids']);
        }

        return back()->with('success', 'تم إنشاء الفصل بنجاح');
    }

    public function adminUpdate(Request $request, ClassModel $class)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school || $class->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'main_teacher_id' => 'nullable|exists:teachers,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'room_number' => 'nullable|string|max:50',
//            'class_code' => 'nullable|string|max:50|unique:classes,class_code,' . $class->id,
            'academic_year' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'education_category_id' => 'nullable|exists:education_categories,id',
            'education_subcategory_id' => 'nullable|exists:education_subcategories,id',
        ]);

        $class->update($validated);

        if (isset($validated['teacher_ids'])) {
            $class->teachers()->sync($validated['teacher_ids']);
        }

        if (isset($validated['subject_ids'])) {
            $class->subjects()->sync($validated['subject_ids']);
        }

        return back()->with('success', 'تم تحديث الفصل بنجاح');
    }

    public function adminDestroy(ClassModel $class)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school || $class->school_id !== $school->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $class->delete();

        return back()->with('success', 'تم حذف الفصل بنجاح');
    }
}
