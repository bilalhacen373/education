<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Teacher;
use App\Models\School;
use App\Models\User;
use App\Services\UserChatService;
use App\Services\ChatApiService;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Teacher::with(['user', 'school', 'classes']);

        if ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->where('school_id', $school->id);
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teachers = $query->latest()->paginate(15);

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $schools = School::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Teachers/Create', [
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'school_id' => 'nullable|exists:schools,id',
            'specialization' => 'required|string|max:255',
            'specialization_ar' => 'required|string|max:255',
            'qualifications' => 'required|string',
            'qualifications_ar' => 'required|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'employment_type' => 'required|in:full_time,part_time,freelance',
            'subjects' => 'nullable|array',
            'availability' => 'nullable|array',
            'is_available_for_hire' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'name_ar' => $validated['name_ar'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'user_type' => 'teacher',
                'is_active' => true,
            ]);

            $user->assignRole('teacher');

            Teacher::create([
                'user_id' => $user->id,
                'teacher_id' => 'T' . date('Ymd-His') . '-' . rand(100, 999),
                'school_id' => $validated['school_id'] ?? null,
                'specialization' => $validated['specialization'],
                'specialization_ar' => $validated['specialization_ar'],
                'qualifications' => $validated['qualifications'],
                'qualifications_ar' => $validated['qualifications_ar'],
                'experience_years' => $validated['experience_years'],
                'hourly_rate' => $validated['hourly_rate'] ?? null ?? null,
                'monthly_salary' => $validated['monthly_salary'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'employment_type' => $validated['employment_type'],
                'subjects' => $validated['subjects'] ?? null,
                'availability' => $validated['availability'] ?? null,
                'is_available_for_hire' => $validated['is_available_for_hire'] ?? false,
                'is_active' => true,
            ]);
        });

        return redirect()->route('teachers.index')
            ->with('success', 'تم إضافة المعلم بنجاح');
    }

    public function show(Teacher $teacher)
    {
        $teacher->load([
            'user',
            'school',
            'classes.students',
            'courses.lessons',
            'liveSessions',
        ]);

        $stats = [
            'total_classes' => $teacher->classes()->count(),
            'total_students' => $teacher->getTotalStudentsAttribute(),
            'total_courses' => $teacher->courses()->count(),
            'total_sessions' => $teacher->liveSessions()->count(),
        ];

        return Inertia::render('Teachers/Show', [
            'teacher' => $teacher,
            'stats' => $stats,
        ]);
    }

    public function edit(Teacher $teacher)
    {
        $schools = School::where('is_active', true)->get(['id', 'name']);
        $teacher->load('user');

        return Inertia::render('Teachers/Edit', [
            'teacher' => $teacher,
            'schools' => $schools,
        ]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->user_id,
            'phone' => 'required|string|max:20',
            'school_id' => 'nullable|exists:schools,id',
            'specialization' => 'required|string|max:255',
            'specialization_ar' => 'required|string|max:255',
            'qualifications' => 'required|string',
            'qualifications_ar' => 'required|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'employment_type' => 'required|in:full_time,part_time,freelance',
            'subjects' => 'nullable|array',
            'availability' => 'nullable|array',
            'is_available_for_hire' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $teacher) {
            $teacher->user->update([
                'name' => $validated['name'],
                'name_ar' => $validated['name_ar'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            $teacher->update([
                'school_id' => $validated['school_id'],
                'specialization' => $validated['specialization'],
                'specialization_ar' => $validated['specialization_ar'],
                'qualifications' => $validated['qualifications'],
                'qualifications_ar' => $validated['qualifications_ar'],
                'experience_years' => $validated['experience_years'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'monthly_salary' => $validated['monthly_salary'],
                'hire_date' => $validated['hire_date'],
                'employment_type' => $validated['employment_type'],
                'subjects' => $validated['subjects'],
                'availability' => $validated['availability'],
                'is_available_for_hire' => $validated['is_available_for_hire'] ?? $teacher->is_available_for_hire,
                'is_active' => $validated['is_active'] ?? $teacher->is_active,
            ]);
        });

        return redirect()->route('teachers.show', $teacher)
            ->with('success', 'تم تحديث بيانات المعلم بنجاح');
    }

    public function destroy(Teacher $teacher)
    {
        DB::transaction(function () use ($teacher) {
            $user = $teacher->user;
            $teacher->delete();
            $user->delete();
        });

        return redirect()->route('teachers.index')
            ->with('success', 'تم حذف المعلم بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return Inertia::render('SchoolAdmin/Teachers', [
                'teachers' => [],
                'school' => null,
                'classes' => [],
            ]);
        }

        $query = Teacher::with(['user', 'classes', 'attendances'])
            ->where('school_id', $school->id);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teachers = $query->latest()->get()->map(function($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->user->name,
                'name_ar' => $teacher->user->name_ar,
                'email' => $teacher->user->email,
                'phone' => $teacher->user->phone,
                'specialization' => $teacher->specialization,
                'specialization_ar' => $teacher->specialization_ar,
                'qualifications' => $teacher->qualifications,
                'qualifications_ar' => $teacher->qualifications_ar,
                'experience_years' => $teacher->experience_years,
                'monthly_salary' => $teacher->monthly_salary,
                'employment_type' => $teacher->employment_type,
                'hire_date' => $teacher->hire_date->format('Y-m-d'),
                'hourly_rate' => $teacher->hourly_rate,
                'is_active' => $teacher->is_active,
                'total_classes' => $teacher->classes()->count(),
                'absent_count' => $teacher->attendances()->where('status', 'absent')->count(),
                'classes' => $teacher->classes->map(function($class) {
                    return [
                        'id' => $class->id,
                        'name' => $class->name,
                        'name_ar' => $class->name_ar,
                    ];
                }),
            ];
        });

        $classes = $school->classes()->with(['subjects'])->get();

        return Inertia::render('SchoolAdmin/Teachers', [
            'teachers' => $teachers,
            'school' => $school,
            'classes' => $classes,
        ]);
    }

    public function adminStore(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return back()->withErrors(['error' => 'يجب إنشاء مدرسة أولاً']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'specialization_ar' => 'required|string|max:255',
            'qualifications' => 'required|string',
            'qualifications_ar' => 'required|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'employment_type' => 'required|in:full_time,part_time,freelance',
        ]);

        DB::transaction(function () use ($validated, $school) {
            $user = User::create([
                'name' => $validated['name'],
                'name_ar' => $validated['name_ar'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'user_type' => 'teacher',
                'is_active' => true,
            ]);

            $user->assignRole('teacher');

            Teacher::create([
                'user_id' => $user->id,
                'teacher_id' => 'T' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'school_id' => $school->id,
                'specialization' => $validated['specialization'],
                'specialization_ar' => $validated['specialization_ar'],
                'qualifications' => $validated['qualifications'],
                'qualifications_ar' => $validated['qualifications_ar'],
                'experience_years' => $validated['experience_years'],
                'hourly_rate' => $validated['hourly_rate'] ?? null ?? null,
                'monthly_salary' => $validated['monthly_salary'] ?? null,
                'hire_date' => $validated['hire_date'] ?? now(),
                'employment_type' => $validated['employment_type'],
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'تم إضافة المعلم بنجاح');
    }

    public function adminUpdate(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->user_id,
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'specialization_ar' => 'required|string|max:255',
            'qualifications' => 'required|string',
            'qualifications_ar' => 'required|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'employment_type' => 'required|in:full_time,part_time,freelance',
            'is_active' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $teacher) {
            $teacher->user->update([
                'name' => $validated['name'],
                'name_ar' => $validated['name_ar'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            $teacher->update([
                'specialization' => $validated['specialization'],
                'specialization_ar' => $validated['specialization_ar'],
                'qualifications' => $validated['qualifications'],
                'qualifications_ar' => $validated['qualifications_ar'],
                'experience_years' => $validated['experience_years'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'monthly_salary' => $validated['monthly_salary'],
                'hire_date' => $validated['hire_date'],
                'employment_type' => $validated['employment_type'],
                'is_active' => $validated['is_active'] ?? $teacher->is_active,
            ]);
        });

        return back()->with('success', 'تم تحديث بيانات المعلم بنجاح');
    }

    public function adminDestroy(Teacher $teacher)
    {
        DB::transaction(function () use ($teacher) {
            $user = $teacher->user;
            $teacher->delete();
            $user->delete();
        });

        return back()->with('success', 'تم حذف المعلم بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return Inertia::render('Teacher/Classes', [
                'classes' => [],
                'teacher' => null,
            ]);
        }

        $classes = $teacher->classes()->with(['students', 'school'])->get();

        return Inertia::render('Teacher/Classes', [
            'classes' => $classes,
            'teacher' => $teacher->load('user'),
        ]);
    }

    public function showCompleteProfile()
    {
        $user = auth()->user();

        if ($user->teacher) {
            return redirect()->route('dashboard');
        }

        $schools = School::where('is_active', true)->get(['id', 'name', 'name_ar']);

        return Inertia::render('Teacher/CompleteProfile', [
            'schools' => $schools,
        ]);
    }

    public function completeProfile(Request $request, UserChatService $userChatService, ChatApiService $chatApiService)
    {
        $user = auth()->user();

        if (!$user->hasRole('teacher')) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        if ($user->teacher) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'gender' => 'required|in:male,female',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'birth_date' => 'required|date',
//            'teacher_id' => 'required|string|unique:teachers,teacher_id',
            'specialization' => 'required_without:specialization_ar|string|max:255',
            'specialization_ar' => 'required_without:specialization|string|max:255',
            'qualifications' => 'required_without:qualifications_ar|nullable|string',
            'qualifications_ar' => 'required_without:qualifications|nullable|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
//            'hire_date' => 'required|date',
            'employment_type' => 'required|in:full_time,part_time,contract,freelance',
            'subjects' => 'nullable|array',
            'is_available_for_hire' => 'boolean',
            'school_id' => 'nullable|exists:schools,id',
        ]);

        $teacherInfo = [
            'specialization' => $validated['specialization'],
            'specialization_ar' => $validated['specialization_ar'] ?? null,
            'experience_years' => $validated['experience_years'],
        ];

        $chatApiService->ensureAuthenticated('deepseek');

        $aiChatId = $userChatService->createChatForTeacher($user->id, $user->name_ar ?? $user->name, $teacherInfo);

        Teacher::create([
            'gender' => $validated['gender'],
            'address' => $validated['address'],
            'address_ar' => $validated['address_ar'],
            'birth_date' => $validated['birth_date'],
            'user_id' => $user->id,
            'teacher_id' => 'TCH-' . date('Ymd-His') . '-' . rand(100, 999),
            'specialization' => $validated['specialization'],
            'specialization_ar' => $validated['specialization_ar'] ?? null,
            'qualifications' => $validated['qualifications'],
            'qualifications_ar' => $validated['qualifications_ar'] ?? null,
            'experience_years' => $validated['experience_years'],
            'hourly_rate' => $validated['hourly_rate'] ?? null,
            'monthly_salary' => $validated['monthly_salary'] ?? null,
            'employment_type' => $validated['employment_type'],
            'subjects' => $validated['subjects'] ?? [],
            'is_available_for_hire' => $validated['is_available_for_hire'] ?? false,
            'school_id' => $validated['school_id'] ?? null,
            'is_active' => true,
            'ai_chat_id' => $aiChatId,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'تم إكمال البيانات بنجاح');
    }
}
