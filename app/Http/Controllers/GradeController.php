<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Grade;
use App\Models\Student;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Grade::with(['student.user', 'class']);

        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classIds = $teacher->classes()->pluck('id');
                $query->whereIn('class_id', $classIds);
            }
        } elseif ($user->isStudent()) {
            $student = $user->student;
            if ($student) {
                $query->where('student_id', $student->id);
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->whereHas('class', function($q) use ($school) {
                    $q->where('school_id', $school->id);
                });
            }
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        $grades = $query->latest()->paginate(20);

        return Inertia::render('Grades/Index', [
            'grades' => $grades,
            'filters' => $request->only(['class_id', 'student_id']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();

        $classes = [];
        $students = [];

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

        if ($request->has('class_id')) {
            $students = Student::where('class_id', $request->class_id)
                ->with('user')
                ->get();
        }

        return Inertia::render('Grades/Create', [
            'classes' => $classes,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:classes,id',
            'subject' => 'required|string|max:255',
            'subject_ar' => 'required|string|max:255',
            'grade_type' => 'required|in:quiz,assignment,exam,participation,final',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'graded_date' => 'required|date',
            'comments' => 'nullable|string',
            'comments_ar' => 'nullable|string',
        ]);

        $validated['percentage'] = ($validated['score'] / $validated['max_score']) * 100;
        $validated['letter_grade'] = $this->calculateGradeLetter($validated['percentage']);
        $validated['graded_by'] = auth()->id();

        Grade::create($validated);

        return redirect()->route('grades.index')
            ->with('success', 'تم إضافة الدرجة بنجاح');
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'exam_type' => 'required|in:quiz,midterm,final,assignment,project',
            'exam_name' => 'required|string|max:255',
            'max_score' => 'required|numeric|min:0',
            'weight' => 'required|numeric|min:0|max:100',
            'date' => 'required|date',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.score' => 'required|numeric|min:0',
        ]);

        foreach ($validated['grades'] as $gradeData) {
            $percentage = ($gradeData['score'] / $validated['max_score']) * 100;
            $weightedScore = ($percentage * $validated['weight']) / 100;

            Grade::create([
                'student_id' => $gradeData['student_id'],
                'class_id' => $validated['class_id'],
                'exam_type' => $validated['exam_type'],
                'exam_name' => $validated['exam_name'],
                'score' => $gradeData['score'],
                'max_score' => $validated['max_score'],
                'percentage' => $percentage,
                'weight' => $validated['weight'],
                'weighted_score' => $weightedScore,
                'grade_letter' => $this->calculateGradeLetter($percentage),
                'date' => $validated['date'],
            ]);
        }

        return redirect()->route('grades.index')
            ->with('success', 'تم إضافة الدرجات بنجاح');
    }

    public function show(Grade $grade)
    {
        $grade->load(['student.user', 'class.teacher.user']);

        return Inertia::render('Grades/Show', [
            'grade' => $grade,
        ]);
    }

    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'comments' => 'nullable|string',
            'comments_ar' => 'nullable|string',
        ]);

        $validated['percentage'] = ($validated['score'] / $validated['max_score']) * 100;
        $validated['letter_grade'] = $this->calculateGradeLetter($validated['percentage']);

        $grade->update($validated);

        return back()->with('success', 'تم تحديث الدرجة بنجاح');
    }

    public function destroy(Grade $grade)
    {
        $grade->delete();

        return redirect()->route('grades.index')
            ->with('success', 'تم حذف الدرجة بنجاح');
    }

    private function calculateGradeLetter($percentage)
    {
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $classIds = $teacher->classes()->pluck('classes.id');

        $query = Grade::with(['student.user', 'class'])
            ->whereIn('class_id', $classIds);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $grades = $query->latest()->get();
        $classes = $teacher->classes()->with('students')->get();

        return Inertia::render('Teacher/Grades', [
            'grades' => $grades,
            'classes' => $classes,
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
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:classes,id',
            'subject' => 'required|string|max:255',
            'subject_ar' => 'required|string|max:255',
            'grade_type' => 'required|in:quiz,assignment,exam,participation,final',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'graded_date' => 'required|date',
            'comments' => 'nullable|string',
            'comments_ar' => 'nullable|string',
        ]);

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك إضافة درجات لهذا الفصل']);
        }

        $validated['percentage'] = ($validated['score'] / $validated['max_score']) * 100;
        $validated['letter_grade'] = $this->calculateGradeLetter($validated['percentage']);
        $validated['graded_by'] = $user->id;

        Grade::create($validated);

        return back()->with('success', 'تم إضافة الدرجة بنجاح');
    }

    public function teacherUpdate(Request $request, Grade $grade)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($grade->class_id)) {
            return back()->withErrors(['error' => 'لا يمكنك تعديل هذه الدرجة']);
        }

        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'comments' => 'nullable|string',
            'comments_ar' => 'nullable|string',
        ]);

        $validated['percentage'] = ($validated['score'] / $validated['max_score']) * 100;
        $validated['letter_grade'] = $this->calculateGradeLetter($validated['percentage']);

        $grade->update($validated);

        return back()->with('success', 'تم تحديث الدرجة بنجاح');
    }

    public function teacherDestroy(Grade $grade)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($grade->class_id)) {
            return back()->withErrors(['error' => 'لا يمكنك حذف هذه الدرجة']);
        }

        $grade->delete();

        return back()->with('success', 'تم حذف الدرجة بنجاح');
    }

    public function studentIndex(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $query = Grade::with(['class'])
            ->where('student_id', $student->id);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $grades = $query->latest()->get();

        $stats = [
            'total_exams' => $grades->count(),
            'average_percentage' => $grades->avg('percentage'),
            'total_weighted_score' => $grades->sum('weighted_score'),
            'grade_distribution' => [
                'A' => $grades->where('grade_letter', 'A')->count(),
                'B' => $grades->where('grade_letter', 'B')->count(),
                'C' => $grades->where('grade_letter', 'C')->count(),
                'D' => $grades->where('grade_letter', 'D')->count(),
                'F' => $grades->where('grade_letter', 'F')->count(),
            ],
        ];

        return Inertia::render('Student/Grades', [
            'grades' => $grades,
            'stats' => $stats,
        ]);
    }
}
