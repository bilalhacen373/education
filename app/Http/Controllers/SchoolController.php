<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\School;
use App\Services\UserChatService;
use App\Services\ChatApiService;

class SchoolController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            $schools = School::with('admin')->latest()->paginate(10);
        } else {
            $schools = $user->schools()->with('admin')->latest()->paginate(10);
        }

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
        ]);
    }

    public function create()
    {
        return Inertia::render('Schools/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'email' => 'required|email|unique:schools,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'logo' => 'nullable|image|max:2048',
            'background_image' => 'nullable|image|max:5120',
            'terms_conditions' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('schools/logos', 'public');
        }

        if ($request->hasFile('background_image')) {
            $validated['background_image'] = $request->file('background_image')->store('schools/backgrounds', 'public');
        }

        $validated['admin_id'] = auth()->id();
        $validated['is_active'] = true;

        $school = School::create($validated);

        return redirect()->route('schools.index')
            ->with('success', 'تم إنشاء المدرسة بنجاح');
    }

    public function show(School $school)
    {
        $this->authorize('view', $school);

        $school->load([
            'admin',
            'teachers.user',
            'students.user',
            'classes.teacher.user',
//            'subscriptions' => function ($query) {
//                $query->active()->latest();
//            }
        ]);

        return Inertia::render('Schools/Show', [
            'school' => $school,
        ]);
    }

    public function edit(School $school)
    {
        $this->authorize('update', $school);

        return Inertia::render('Schools/Edit', [
            'school' => $school,
        ]);
    }

    public function update(Request $request, School $school)
    {
        $this->authorize('update', $school);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'email' => 'required|email|unique:schools,email,' . $school->id,
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'logo' => 'nullable|image|max:2048',
            'background_image' => 'nullable|image|max:5120',
            'terms_conditions' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo')) {
            if ($school->logo) {
                Storage::disk('public')->delete($school->logo);
            }
            $validated['logo'] = $request->file('logo')->store('schools/logos', 'public');
        }

        if ($request->hasFile('background_image')) {
            if ($school->background_image) {
                Storage::disk('public')->delete($school->background_image);
            }
            $validated['background_image'] = $request->file('background_image')->store('schools/backgrounds', 'public');
        }

        $school->update($validated);

        return redirect()->route('schools.show', $school)
            ->with('success', 'تم تحديث المدرسة بنجاح');
    }

    public function destroy(School $school)
    {
        $this->authorize('delete', $school);

        if ($school->logo) {
            Storage::disk('public')->delete($school->logo);
        }

        if ($school->background_image) {
            Storage::disk('public')->delete($school->background_image);
        }

        $school->delete();

        return redirect()->route('schools.index')
            ->with('success', 'تم حذف المدرسة بنجاح');
    }

    public function updateTerms(Request $request, School $school)
    {
        $this->authorize('update', $school);

        $validated = $request->validate([
            'terms_conditions' => 'required|string',
        ]);

        $school->update($validated);

        return back()->with('success', 'تم تحديث الشروط والأحكام بنجاح');
    }

    public function adminIndex()
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return Inertia::render('SchoolAdmin/SchoolProfile', [
                'school' => null,
                'hasSchool' => false,
            ]);
        }

        $school->load([
            'admin',
            'teachers.user',
            'students.user',
            'classes.teacher.user',
//            'subscriptions' => function ($query) {
//                $query->active()->latest();
//            }
        ]);

        $stats = [
            'total_teachers' => $school->teachers()->count(),
            'total_students' => $school->students()->count(),
            'total_classes' => $school->classes()->count(),
//            'active_subscription' => $school->subscriptions()->active()->first(),
        ];

        return Inertia::render('SchoolAdmin/SchoolProfile', [
            'school' => $school,
            'stats' => $stats,
            'hasSchool' => true,
        ]);
    }

    public function showCompleteProfile()
    {
        $user = auth()->user();

        if ($user->schools()->count() > 0) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('SchoolAdmin/CompleteProfile');
    }

    public function completeProfile(Request $request, UserChatService $userChatService, ChatApiService $chatApiService)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin')) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        if ($user->schools()->count() > 0) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'address' => 'required|string',
            'address_ar' => 'nullable|string',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:schools,email',
            'website' => 'nullable|url',
            'logo' => 'nullable|image|max:2048',
        ]);

        $schoolInfo = [
            'school_name' => $validated['name_ar'] ?? $validated['name'] ?? 'المدرسة',
            'student_count' => 0,
        ];

        $chatApiService->ensureAuthenticated('deepseek');
        $aiChatId = $userChatService->createChatForSchoolAdmin($user->id, $user->name_ar ?? $user->name, $schoolInfo);

        $schoolData = [
            'name' => $validated['name'],
            'name_ar' => $validated['name_ar'] ?? null,
            'description' => $validated['description'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'address' => $validated['address'],
            'address_ar' => $validated['address_ar'] ?? null,
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'website' => $validated['website'] ?? null,
            'admin_id' => $user->id,
            'admin_ai_chat_id' => $aiChatId,
            'is_active' => true,
        ];

        if ($request->hasFile('logo')) {
            $schoolData['logo'] = $request->file('logo')->store('schools/logos', 'public');
        }

        School::create($schoolData);

        return redirect()->route('dashboard')
            ->with('success', 'تم إكمال بيانات المدرسة بنجاح');
    }
}
