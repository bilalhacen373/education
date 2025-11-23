<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use App\Models\Attendance;
use App\Models\School;
use App\Models\LiveSession;
use App\Models\User;
use App\Models\Payment;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->user_type === 'student' && (!$user->student || !$user->student->student_id)) {
            return redirect()->route('student.show-complete-profile');
        }

        if ($user->user_type === 'teacher' && !$user->teacher) {
            return redirect()->route('teacher.show-complete-profile');
        }

        if ($user->user_type === 'school_admin' && $user->schools()->count() === 0) {
            return redirect()->route('school-admin.show-complete-profile');
        }

        $stats = [];
        $recentActivities = [];
        $upcomingSessions = [];

        switch ($user->user_type) {
            case 'super_admin':
                $stats = $this->getSuperAdminStats();
                $recentActivities = $this->getSuperAdminActivities();
                break;

            case 'school_admin':
                $stats = $this->getSchoolAdminStats($user);
                $recentActivities = $this->getSchoolAdminActivities($user);
                break;

            case 'teacher':
                $stats = $this->getTeacherStats($user);
                $recentActivities = $this->getTeacherActivities($user);
                $upcomingSessions = $this->getTeacherUpcomingSessions($user);
                break;

            case 'student':
                $stats = $this->getStudentStats($user);
                $recentActivities = $this->getStudentActivities($user);
                $upcomingSessions = $this->getStudentUpcomingSessions($user);
                break;
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'upcomingSessions' => $upcomingSessions,
        ]);
    }

    private function getSuperAdminStats()
    {
        return [
            'total_schools' => School::count(),
            'total_teachers' => User::where('user_type', 'teacher')->count(),
            'total_students' => User::where('user_type', 'student')->count(),
            'monthly_revenue' => Payment::where('status', 'completed')
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('amount'),
        ];
    }

    private function getSuperAdminActivities()
    {
        return [
            [
                'title' => 'مدرسة جديدة تم تسجيلها',
                'time' => '2 ساعات مضت'
            ],
            [
                'title' => 'تم تحديث خطة الاشتراك',
                'time' => '4 ساعات مضت'
            ],
            [
                'title' => 'دفعة جديدة تم استلامها',
                'time' => '6 ساعات مضت'
            ],
        ];
    }

    private function getSchoolAdminStats($user)
    {
        $school = $user->schools()->first();

        if (!$school) {
            return [
                'teachers_count' => 0,
                'students_count' => 0,
                'classes_count' => 0,
                'attendance_rate' => 0,
            ];
        }

        $totalAttendances = Attendance::whereHas('class', function ($query) use ($school) {
            $query->where('school_id', $school->id);
        })->count();

        $presentAttendances = Attendance::whereHas('class', function ($query) use ($school) {
            $query->where('school_id', $school->id);
        })->where('status', 'present')->count();

        $attendanceRate = $totalAttendances > 0 ? round(($presentAttendances / $totalAttendances) * 100, 2) : 0;

        return [
            'teachers_count' => $school->teachers()->count(),
            'students_count' => $school->students()->count(),
            'classes_count' => $school->classes()->count(),
            'attendance_rate' => $attendanceRate,
        ];
    }

    private function getSchoolAdminActivities($user)
    {
        return [
            [
                'title' => 'معلم جديد تم إضافته',
                'time' => '1 ساعة مضت'
            ],
            [
                'title' => 'تم تسجيل حضور الطلاب',
                'time' => '3 ساعات مضت'
            ],
            [
                'title' => 'فصل جديد تم إنشاؤه',
                'time' => '5 ساعات مضت'
            ],
        ];
    }

    private function getTeacherStats($user)
    {
        $teacher = $user->teacher;

        if (!$teacher) {
            return [
                'my_classes' => 0,
                'my_students' => 0,
                'my_courses' => 0,
                'live_sessions' => 0,
            ];
        }

        return [
            'my_classes' => $teacher->classes()->count(),
            'my_students' => $teacher->getTotalStudentsAttribute(),
            'my_courses' => $teacher->courses()->count(),
            'live_sessions' => $teacher->liveSessions()->count(),
        ];
    }

    private function getTeacherActivities($user)
    {
        return [
            [
                'title' => 'درس جديد تم إضافته',
                'time' => '30 دقيقة مضت'
            ],
            [
                'title' => 'تم تقييم الطلاب',
                'time' => '2 ساعة مضت'
            ],
            [
                'title' => 'جلسة مباشرة تم إنهاؤها',
                'time' => '4 ساعات مضت'
            ],
        ];
    }

    private function getTeacherUpcomingSessions($user)
    {
        $teacher = $user->teacher;

        if (!$teacher) {
            return [];
        }

        return $teacher->liveSessions()
            ->where('scheduled_at', '>', Carbon::now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get()
            ->map(function ($session) {
                return [
                    'title' => $session->title,
                    'subject' => $session->class->subject ?? 'عام',
                    'time' => $session->scheduled_at->format('Y-m-d H:i'),
                ];
            });
    }

    private function getStudentStats($user)
    {
        $student = $user->student;

        if (!$student) {
            return [
                'enrolled_courses' => 0,
                'completed_lessons' => 0,
                'progress_rate' => 0,
                'average_grade' => 0,
            ];
        }

        return [
            'enrolled_courses' => $student->progress()->distinct('lesson_id')->count(),
            'completed_lessons' => $student->progress()->where('status', 'completed')->count(),
            'progress_rate' => $student->progress()->avg('progress_percentage') ?? 0,
            'average_grade' => $student->getAverageGradeAttribute(),
        ];
    }

    private function getStudentActivities($user)
    {
        return [
            [
                'title' => 'درس جديد تم إكماله',
                'time' => '1 ساعة مضت'
            ],
            [
                'title' => 'تم الحصول على درجة جديدة',
                'time' => '3 ساعات مضت'
            ],
            [
                'title' => 'تم الانضمام لجلسة مباشرة',
                'time' => '5 ساعات مضت'
            ],
        ];
    }

    private function getStudentUpcomingSessions($user)
    {
        $student = $user->student;

        if (!$student || !$student->class) {
            return [];
        }

        return LiveSession::where('class_id', $student->class_id)
            ->where('scheduled_at', '>', Carbon::now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get()
            ->map(function ($session) {
                return [
                    'title' => $session->title,
                    'subject' => $session->class->subject ?? 'عام',
                    'time' => $session->scheduled_at->format('Y-m-d H:i'),
                ];
            });
    }
}
