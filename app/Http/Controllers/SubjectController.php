<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $subjects = $query->orderBy('order')->paginate(15);

        return Inertia::render('Subjects/Index', [
            'subjects' => $subjects,
            'filters' => $request->only('search', 'category'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'category_ar' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        Subject::create($validated);

        return redirect()->route('subjects.index')
            ->with('success', 'تم إضافة المادة بنجاح');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'category_ar' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $subject->update($validated);

        return redirect()->route('subjects.index')
            ->with('success', 'تم تحديث المادة بنجاح');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->route('subjects.index')
            ->with('success', 'تم حذف المادة بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $query = Subject::withCount('classes');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $subjects = $query->orderBy('order')->get();

        return Inertia::render('SchoolAdmin/Subjects', [
            'subjects' => $subjects,
            'filters' => $request->only('search', 'category'),
        ]);
    }

    public function adminStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'category_ar' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
        ]);

        $validated['is_active'] = true;
        $validated['order'] = $validated['order'] ?? 0;

        Subject::create($validated);

        return back()->with('success', 'تم إضافة المادة بنجاح');
    }

    public function adminUpdate(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'category_ar' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $subject->update($validated);

        return back()->with('success', 'تم تحديث المادة بنجاح');
    }

    public function adminDestroy(Subject $subject)
    {
        $subject->delete();

        return back()->with('success', 'تم حذف المادة بنجاح');
    }
}
