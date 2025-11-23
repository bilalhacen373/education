<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LiveSession;

class LiveSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = LiveSession::with(['teacher', 'teacher.user', 'class']);

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

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query->latest('scheduled_at')->paginate(15);

        return Inertia::render('LiveSessions/Index', [
            'sessions' => $sessions,
            'filters' => $request->only('status'),
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

        return Inertia::render('LiveSessions/Create', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'class_id' => 'required|exists:classes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15',
            'meeting_platform' => 'required|in:zoom,meet,teams,jitsi',
        ]);

        $validated['status'] = 'scheduled';
        $validated['meeting_url'] = $this->generateMeetingUrl($validated['meeting_platform']);

        $session = LiveSession::create($validated);

        return redirect()->route('live-sessions.show', $session)
            ->with('success', 'تم إنشاء الجلسة المباشرة بنجاح');
    }

    public function show(LiveSession $liveSession)
    {
        $liveSession->load(['teacher', 'teacher.user', 'class.students.user']);

        return Inertia::render('LiveSessions/Show', [
            'session' => $liveSession,
        ]);
    }

    public function edit(LiveSession $liveSession)
    {
        $user = auth()->user();

        $classes = [];
        if ($user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                $classes = $teacher->classes()->with('school')->get();
            }
        }

        return Inertia::render('LiveSessions/Edit', [
            'session' => $liveSession,
            'classes' => $classes,
        ]);
    }

    public function update(Request $request, LiveSession $liveSession)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
        ]);

        $liveSession->update($validated);

        return redirect()->route('live-sessions.show', $liveSession)
            ->with('success', 'تم تحديث الجلسة بنجاح');
    }

    public function start(LiveSession $liveSession)
    {
        $liveSession->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return back()->with('success', 'تم بدء الجلسة المباشرة');
    }

    public function end(LiveSession $liveSession)
    {
        $liveSession->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);

        return back()->with('success', 'تم إنهاء الجلسة المباشرة');
    }

    public function cancel(LiveSession $liveSession)
    {
        $liveSession->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'تم إلغاء الجلسة المباشرة');
    }

    public function destroy(LiveSession $liveSession)
    {
        $liveSession->delete();

        return redirect()->route('live-sessions.index')
            ->with('success', 'تم حذف الجلسة بنجاح');
    }

    private function generateMeetingUrl($platform)
    {
        $uniqueId = uniqid('session_');

        switch ($platform) {
            case 'zoom':
                return "https://zoom.us/j/{$uniqueId}";
            case 'meet':
                return "https://meet.google.com/{$uniqueId}";
            case 'teams':
                return "https://teams.microsoft.com/l/meetup-join/{$uniqueId}";
            case 'jitsi':
                return "https://meet.jit.si/{$uniqueId}";
            default:
                return null;
        }
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $query = LiveSession::with(['class'])
            ->where('teacher_id', $teacher->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query->latest('scheduled_at')->get();
        $classes = $teacher->classes()->with('school')->get();
        $courses = $teacher->courses()->get();

        return Inertia::render('Teacher/LiveSessions', [
            'sessions' => $sessions,
            'classes' => $classes,
            'courses' => $courses,
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
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15',
            'meeting_url' => 'required|url',
//            'meeting_platform' => 'required|in:zoom,meet,teams,jitsi',
        ]);

        $classIds = $teacher->classes()->pluck('classes.id');
        if (!$classIds->contains($validated['class_id'])) {
            return back()->withErrors(['class_id' => 'لا يمكنك إنشاء جلسة لهذا الفصل']);
        }

        $validated['teacher_id'] = $teacher->id;
        $validated['status'] = 'scheduled';
//        $validated['meeting_url'] = $this->generateMeetingUrl($validated['meeting_platform']);

        LiveSession::create($validated);

        return back()->with('success', 'تم إنشاء الجلسة المباشرة بنجاح');
    }

    public function teacherUpdate(Request $request, LiveSession $liveSession)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $liveSession->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15',
        ]);

        $liveSession->update($validated);

        return back()->with('success', 'تم تحديث الجلسة بنجاح');
    }

    public function teacherDestroy(LiveSession $liveSession)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher || $liveSession->teacher_id !== $teacher->id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $liveSession->delete();

        return back()->with('success', 'تم حذف الجلسة بنجاح');
    }

    public function studentIndex(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student || !$student->class_id) {
            return redirect()->route('dashboard');
        }

        $query = LiveSession::with(['teacher', 'teacher.user', 'class'])
            ->where('class_id', $student->class_id)
            ->where('status', '!=', 'cancelled');

        $sessions = $query->latest('scheduled_at')->get();

        return Inertia::render('Student/LiveSessions', [
            'sessions' => $sessions,
        ]);
    }

    public function joinSession(Request $request, LiveSession $liveSession)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student || $student->class_id !== $liveSession->class_id) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        if ($liveSession->status !== 'in_progress') {
            return back()->withErrors(['error' => 'الجلسة غير نشطة']);
        }

        return redirect()->away($liveSession->meeting_url);
    }
}
