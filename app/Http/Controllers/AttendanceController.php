<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\ClassModel;
use App\Models\Teacher;
use App\Models\TeacherAttendance;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Attendance::with(['student.user', 'class']);

        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classIds = $teacher->classes()->pluck('id');
                $query->whereIn('class_id', $classIds);
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->whereHas('class', function($q) use ($school) {
                    $q->where('school_id', $school->id);
                });
            }
        } elseif ($user->isStudent()) {
            $student = $user->student;
            if ($student) {
                $query->where('student_id', $student->id);
            }
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $attendances = $query->latest('date')->paginate(20);

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'filters' => $request->only(['date', 'class_id']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();

        $classes = [];
        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classes = $teacher->classes()->with('students.user')->get();
            }
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $classes = $school->classes()->with(['students.user', 'teacher.user'])->get();
            }
        }

        $selectedClass = null;
        if ($request->has('class_id')) {
            $selectedClass = ClassModel::with('students.user')->find($request->class_id);
        }

        return Inertia::render('Attendance/Create', [
            'classes' => $classes,
            'selectedClass' => $selectedClass,
            'date' => $request->get('date', Carbon::today()->toDateString()),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.check_in_time' => 'nullable|date_format:H:i',
            'attendances.*.check_out_time' => 'nullable|date_format:H:i',
            'attendances.*.notes' => 'nullable|string',
            'attendances.*.notes_ar' => 'nullable|string',
        ]);

        foreach ($validated['attendances'] as $attendanceData) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $attendanceData['student_id'],
                    'class_id' => $validated['class_id'],
                    'date' => $validated['date'],
                ],
                [
                    'status' => $attendanceData['status'],
                    'check_in_time' => $attendanceData['check_in_time'] ?? null,
                    'check_out_time' => $attendanceData['check_out_time'] ?? null,
                    'notes' => $attendanceData['notes'] ?? null,
                    'notes_ar' => $attendanceData['notes_ar'] ?? null,
                    'marked_by' => auth()->id(),
                ]
            );
        }

        return redirect()->route('attendance.index')
            ->with('success', 'تم تسجيل الحضور بنجاح');
    }

    public function teacherAttendanceIndex(Request $request)
    {
        $user = auth()->user();

        $query = TeacherAttendance::with(['teacher.user', 'school']);

        if ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->where('school_id', $school->id);
            }
        } elseif ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $query->where('teacher_id', $teacher->id);
            }
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('month')) {
            $query->whereMonth('date', $request->month);
        }

        $attendances = $query->latest('date')->paginate(20);

        return Inertia::render('TeacherAttendance/Index', [
            'attendances' => $attendances,
            'filters' => $request->only(['date', 'month']),
        ]);
    }

    public function teacherAttendanceStore(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'school_id' => 'required|exists:schools,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused,sick_leave',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
            'penalty_amount' => 'nullable|numeric|min:0',
        ]);

        $teacher = Teacher::findOrFail($validated['teacher_id']);

        if ($validated['status'] === 'absent' && !isset($validated['penalty_amount'])) {
            $validated['penalty_amount'] = $teacher->hourly_rate * 8;
        }

        TeacherAttendance::updateOrCreate(
            [
                'teacher_id' => $validated['teacher_id'],
                'school_id' => $validated['school_id'],
                'date' => $validated['date'],
            ],
            $validated
        );

        return back()->with('success', 'تم تسجيل حضور المعلم بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $classIds = $teacher->classes()->pluck('classes.id');

        $query = Attendance::with(['student.user', 'class'])
            ->whereIn('class_id', $classIds);

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $attendances = $query->latest('date')->get();
        $classes = $teacher->classes()->with('students')->get();

        return Inertia::render('Teacher/Attendance', [
            'attendances' => $attendances,
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
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.check_in_time' => 'nullable|date_format:H:i',
            'attendances.*.check_out_time' => 'nullable|date_format:H:i',
            'attendances.*.notes' => 'nullable|string',
            'attendances.*.notes_ar' => 'nullable|string',
        ]);

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك تسجيل الحضور لهذا الفصل']);
        }

        foreach ($validated['attendances'] as $attendanceData) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $attendanceData['student_id'],
                    'class_id' => $validated['class_id'],
                    'date' => $validated['date'],
                ],
                [
                    'status' => $attendanceData['status'],
                    'check_in_time' => $attendanceData['check_in_time'] ?? null,
                    'check_out_time' => $attendanceData['check_out_time'] ?? null,
                    'notes' => $attendanceData['notes'] ?? null,
                    'notes_ar' => $attendanceData['notes_ar'] ?? null,
                    'marked_by' => $user->id,
                ]
            );
        }

        return back()->with('success', 'تم تسجيل الحضور بنجاح');
    }

    public function teacherUpdate(Request $request, Attendance $attendance)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($attendance->class_id)) {
            return back()->withErrors(['error' => 'لا يمكنك تعديل هذا السجل']);
        }

        $validated = $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);

        return back()->with('success', 'تم تحديث الحضور بنجاح');
    }

    public function studentIndex(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('dashboard');
        }

        $query = Attendance::with(['class'])
            ->where('student_id', $student->id);

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->latest('date')->get();

        $stats = [
            'total' => $attendances->count(),
            'present' => $attendances->where('status', 'present')->count(),
            'absent' => $attendances->where('status', 'absent')->count(),
            'late' => $attendances->where('status', 'late')->count(),
            'excused' => $attendances->where('status', 'excused')->count(),
        ];

        return Inertia::render('Student/Attendance', [
            'attendances' => $attendances,
            'stats' => $stats,
        ]);
    }
}
