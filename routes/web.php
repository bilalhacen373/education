<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\LiveSessionController;
use App\Http\Controllers\JobRequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\EducationCategoryController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ChatController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/browse/courses', [PublicController::class, 'browseCourses'])->name('public.courses');
Route::get('/public/courses/{course}', [PublicController::class, 'showCourse'])->name('public.courses.show');
Route::post('/courses/{course}/request-enrollment', [PublicController::class, 'requestCourseEnrollment'])->name('public.courses.request-enrollment');
Route::get('/courses/{course}/checkout', [PublicController::class, 'courseCheckout'])->name('public.courses.checkout');
Route::post('/courses/{course}/process-payment', [PublicController::class, 'processCoursePayment'])->name('public.courses.process-payment');

Route::get('/browse/lessons', [PublicController::class, 'browseLessons'])->name('public.lessons');
Route::get('/public/lessons/{lesson}', [PublicController::class, 'showLesson'])->name('public.lessons.show');

Route::get('/browse/classes', [PublicController::class, 'browseClasses'])->name('public.classes');
Route::get('/public/classes/{class}', [PublicController::class, 'showClass'])->name('public.classes.show');
Route::post('/classes/{class}/request-enrollment', [PublicController::class, 'requestClassEnrollment'])->name('public.classes.request-enrollment');

Route::post('/favorites/toggle', [PublicController::class, 'toggleFavorite'])->name('public.favorites.toggle');
Route::post('/reviews/submit', [PublicController::class, 'submitReview'])->name('public.reviews.submit');

Route::middleware('auth')->group(function () {
    // Student Profile Completion
    Route::get('/student/complete-profile', [StudentController::class, 'showCompleteProfile'])->name('student.show-complete-profile');
    Route::post('/student/complete-profile', [StudentController::class, 'completeProfile'])->name('student.complete-profile');

    // Teacher Profile Completion
    Route::get('/teacher/complete-profile', [TeacherController::class, 'showCompleteProfile'])->name('teacher.show-complete-profile');
    Route::post('/teacher/complete-profile', [TeacherController::class, 'completeProfile'])->name('teacher.complete-profile');

    // School Admin Profile Completion
    Route::get('/school-admin/complete-profile', [SchoolController::class, 'showCompleteProfile'])->name('school-admin.show-complete-profile');
    Route::post('/school-admin/complete-profile', [SchoolController::class, 'completeProfile'])->name('school-admin.complete-profile');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password update route
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');

    Route::resource('schools', SchoolController::class);
    Route::put('/schools/{school}/terms', [SchoolController::class, 'updateTerms'])->name('schools.update-terms');

    Route::resource('teachers', TeacherController::class);

    Route::resource('students', StudentController::class);

    Route::resource('classes', ClassController::class);

    Route::resource('courses', CourseController::class);

    Route::get('/courses/{course}/lessons', [LessonController::class, 'index'])->name('courses.lessons.index');
    Route::get('/courses/{course}/lessons/create', [LessonController::class, 'create'])->name('courses.lessons.create');
    Route::post('/courses/{course}/lessons', [LessonController::class, 'store'])->name('courses.lessons.store');

    Route::resource('lessons', LessonController::class)->except(['index', 'create', 'store']);
    Route::post('/lessons/{lesson}/progress', [LessonController::class, 'updateProgress'])->name('lessons.update-progress');

    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/create', [AttendanceController::class, 'create'])->name('attendance.create');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');

    Route::get('/teacher-attendance', [AttendanceController::class, 'teacherAttendanceIndex'])->name('teacher-attendance.index');
    Route::post('/teacher-attendance', [AttendanceController::class, 'teacherAttendanceStore'])->name('teacher-attendance.store');

    Route::resource('grades', GradeController::class);
    Route::post('/grades/bulk', [GradeController::class, 'bulkStore'])->name('grades.bulk-store');

    Route::resource('payments', PaymentController::class);
    Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirmPayment'])->name('payments.confirm');
    Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund'])->name('payments.refund');
    Route::get('/teacher-payments', [PaymentController::class, 'teacherPayments'])->name('payments.teachers');
    Route::post('/teachers/{teacher}/payment', [PaymentController::class, 'processTeacherPayment'])->name('payments.process-teacher');

    Route::resource('timetable', TimetableController::class);
    Route::post('/timetable/generate-with-ai', [TimetableController::class, 'generateWithAI'])->name('timetable.generate-with-ai');
    Route::post('/timetable/generate-for-school-with-ai', [TimetableController::class, 'generateForSchoolWithAI'])->name('timetable.generate-for-school-with-ai');

    Route::resource('live-sessions', LiveSessionController::class);
    Route::post('/live-sessions/{liveSession}/start', [LiveSessionController::class, 'start'])->name('live-sessions.start');
    Route::post('/live-sessions/{liveSession}/end', [LiveSessionController::class, 'end'])->name('live-sessions.end');
    Route::post('/live-sessions/{liveSession}/cancel', [LiveSessionController::class, 'cancel'])->name('live-sessions.cancel');

    Route::resource('job-requests', JobRequestController::class);
    Route::post('/job-requests/{jobRequest}/apply', [JobRequestController::class, 'apply'])->name('job-requests.apply');
    Route::get('/job-requests/{jobRequest}/applications', [JobRequestController::class, 'applications'])->name('job-requests.applications');
    Route::put('/job-applications/{application}', [JobRequestController::class, 'updateApplicationStatus'])->name('job-applications.update');

    Route::resource('reviews', ReviewController::class);
    Route::get('/reviews/{type}/{id}', [ReviewController::class, 'getReviewsForEntity'])->name('reviews.entity');

    Route::get('/subscription/plans', [SubscriptionController::class, 'plans'])->name('subscriptions.plans');
    Route::post('/subscription/{plan}/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscriptions.subscribe');
    Route::resource('subscriptions', SubscriptionController::class)->only(['index']);
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::post('/subscriptions/{subscription}/renew', [SubscriptionController::class, 'renew'])->name('subscriptions.renew');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    // Education Categories Routes
    Route::get('/education-categories', [EducationCategoryController::class, 'getCategories'])->name('education-categories.index');
    Route::get('/education-categories/{categoryId}/subcategories', [EducationCategoryController::class, 'getSubcategories'])->name('education-categories.subcategories');

    // Chat AI Routes
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::get('/chat/{id}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{id}/message', [ChatController::class, 'sendMessage'])->name('chat.send-message');
    Route::put('/chat/{id}', [ChatController::class, 'update'])->name('chat.update');
    Route::delete('/chat/{id}', [ChatController::class, 'destroy'])->name('chat.destroy');
    Route::get('/chat/api/status', [ChatController::class, 'checkApiStatus'])->name('chat.api-status');
    Route::post('/chat/extract-document', [ChatController::class, 'extractFromDocument'])->name('chat.extract-document');
    Route::post('/chat/generate-course-info', [ChatController::class, 'generateCourseInfo'])->name('chat.generate-course-info');

    // Super Admin Routes
    Route::middleware(['role:super_admin'])->prefix('admin')->group(function () {
        Route::get('/plans', function () {
            return Inertia::render('Admin/Plans');
        })->name('admin.plans');

        Route::get('/payments', function () {
            return Inertia::render('Admin/Payments');
        })->name('admin.payments');

        Route::get('/reports', function () {
            return Inertia::render('Admin/Reports');
        })->name('admin.reports');

        Route::get('/settings', function () {
            return Inertia::render('Admin/Settings');
        })->name('admin.settings');

        Route::get('/education-categories', [EducationCategoryController::class, 'manage'])->name('admin.education-categories');
        Route::post('/education-categories', [EducationCategoryController::class, 'store'])->name('admin.education-categories.store');
        Route::put('/education-categories/{id}', [EducationCategoryController::class, 'update'])->name('admin.education-categories.update');
        Route::delete('/education-categories/{id}', [EducationCategoryController::class, 'destroy'])->name('admin.education-categories.destroy');
        Route::post('/education-subcategories', [EducationCategoryController::class, 'storeSubcategory'])->name('admin.education-subcategories.store');
        Route::put('/education-subcategories/{id}', [EducationCategoryController::class, 'updateSubcategory'])->name('admin.education-subcategories.update');
        Route::delete('/education-subcategories/{id}', [EducationCategoryController::class, 'destroySubcategory'])->name('admin.education-subcategories.destroy');
    });

    // School Admin Routes
    Route::middleware(['role:school_admin'])->prefix('school-admin')->name('school-admin.')->group(function () {
        Route::get('/school', [SchoolController::class, 'adminIndex'])->name('school');

        Route::get('/teachers', [TeacherController::class, 'adminIndex'])->name('teachers');
        Route::post('/teachers', [TeacherController::class, 'adminStore'])->name('teachers.store');
        Route::put('/teachers/{teacher}', [TeacherController::class, 'adminUpdate'])->name('teachers.update');
        Route::delete('/teachers/{teacher}', [TeacherController::class, 'adminDestroy'])->name('teachers.destroy');

        Route::get('/students', [StudentController::class, 'adminIndex'])->name('students');
        Route::post('/students', [StudentController::class, 'adminStore'])->name('students.store');
        Route::put('/students/{student}', [StudentController::class, 'adminUpdate'])->name('students.update');
        Route::delete('/students/{student}', [StudentController::class, 'adminDestroy'])->name('students.destroy');

        Route::get('/classes', [ClassController::class, 'adminIndex'])->name('classes');
        Route::post('/classes', [ClassController::class, 'adminStore'])->name('classes.store');
        Route::put('/classes/{class}', [ClassController::class, 'adminUpdate'])->name('classes.update');
        Route::delete('/classes/{class}', [ClassController::class, 'adminDestroy'])->name('classes.destroy');

        Route::get('/timetable', [TimetableController::class, 'adminIndex'])->name('timetable');
        Route::post('/timetable', [TimetableController::class, 'adminStore'])->name('timetable.store');
        Route::put('/timetable/{timetable}', [TimetableController::class, 'adminUpdate'])->name('timetable.update');
        Route::delete('/timetable/{timetable}', [TimetableController::class, 'adminDestroy'])->name('timetable.destroy');
        Route::post('/timetable/generate-ai-school', [TimetableController::class, 'generateForSchoolWithAI'])->name('timetable.generate-ai-school');

        Route::get('/payments', [PaymentController::class, 'adminIndex'])->name('payments');

        Route::get('/settings', [SystemSettingController::class, 'index'])->name('settings');
        Route::put('/settings', [SystemSettingController::class, 'update'])->name('settings.update');

        Route::get('/subjects', [SubjectController::class, 'adminIndex'])->name('subjects');
        Route::post('/subjects', [SubjectController::class, 'adminStore'])->name('subjects.store');
        Route::put('/subjects/{subject}', [SubjectController::class, 'adminUpdate'])->name('subjects.update');
        Route::delete('/subjects/{subject}', [SubjectController::class, 'adminDestroy'])->name('subjects.destroy');
    });

    // Teacher Routes
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/classes', [ClassController::class, 'teacherIndex'])->name('classes');
        Route::post('/classes', [ClassController::class, 'teacherStore'])->name('classes.store');
        Route::put('/classes/{class}', [ClassController::class, 'teacherUpdate'])->name('classes.update');
        Route::delete('/classes/{class}', [ClassController::class, 'teacherDestroy'])->name('classes.destroy');

        Route::get('/students', [StudentController::class, 'teacherIndex'])->name('students');
        Route::post('/students', [StudentController::class, 'teacherStore'])->name('students.store');
        Route::put('/students/{student}', [StudentController::class, 'teacherUpdate'])->name('students.update');
        Route::delete('/students/{student}', [StudentController::class, 'teacherDestroy'])->name('students.destroy');
        Route::post('/students/import', [StudentController::class, 'teacherImport'])->name('students.import');

        Route::get('/courses', [CourseController::class, 'teacherIndex'])->name('courses');
        Route::post('/courses', [CourseController::class, 'teacherStore'])->name('courses.store');
        Route::post('/courses/{course}', [CourseController::class, 'teacherUpdate'])->name('courses.update');
        Route::delete('/courses/{course}', [CourseController::class, 'teacherDestroy'])->name('courses.destroy');
        Route::post('/courses/{course}/toggle-publish', [CourseController::class, 'togglePublish'])->name('courses.toggle-publish');
        Route::post('/courses/{course}/toggle-free', [CourseController::class, 'toggleFree'])->name('courses.toggle-free');
        Route::get('/courses/{course}/available-lessons', [CourseController::class, 'getAvailableLessons'])->name('courses.available-lessons');
        Route::post('/courses/{course}/attach-lessons', [CourseController::class, 'attachLessons'])->name('courses.attach-lessons');
        Route::delete('/courses/{course}/detach-lesson/{lesson}', [CourseController::class, 'detachLesson'])->name('courses.detach-lesson');

        Route::get('/attendance', [AttendanceController::class, 'teacherIndex'])->name('attendance');
        Route::post('/attendance', [AttendanceController::class, 'teacherStore'])->name('attendance.store');
        Route::put('/attendance/{attendance}', [AttendanceController::class, 'teacherUpdate'])->name('attendance.update');

        Route::get('/grades', [GradeController::class, 'teacherIndex'])->name('grades');
        Route::post('/grades', [GradeController::class, 'teacherStore'])->name('grades.store');
        Route::put('/grades/{grade}', [GradeController::class, 'teacherUpdate'])->name('grades.update');
        Route::delete('/grades/{grade}', [GradeController::class, 'teacherDestroy'])->name('grades.destroy');

        Route::get('/live-sessions', [LiveSessionController::class, 'teacherIndex'])->name('live-sessions');
        Route::post('/live-sessions', [LiveSessionController::class, 'teacherStore'])->name('live-sessions.store');
        Route::put('/live-sessions/{liveSession}', [LiveSessionController::class, 'teacherUpdate'])->name('live-sessions.update');
        Route::delete('/live-sessions/{liveSession}', [LiveSessionController::class, 'teacherDestroy'])->name('live-sessions.destroy');

        Route::get('/payments', [PaymentController::class, 'teacherIndex'])->name('payments');

        Route::get('/timetable', [TimetableController::class, 'teacherIndex'])->name('timetable');
        Route::post('/timetable', [TimetableController::class, 'teacherStore'])->name('timetable.store');
        Route::post('/timetable/generate-ai', [TimetableController::class, 'generateWithAI'])->name('timetable.generate-ai');

        Route::get('/job-requests', [JobRequestController::class, 'teacherIndex'])->name('job-requests');
        Route::post('/job-requests', [JobRequestController::class, 'teacherStore'])->name('job-requests.store');

        Route::get('/enrollment-requests', [CourseController::class, 'teacherEnrollmentRequests'])->name('enrollment-requests');
        Route::post('/enrollment-requests/{request}/approve', [CourseController::class, 'approveEnrollment'])->name('enrollment-requests.approve');
        Route::post('/enrollment-requests/{request}/reject', [CourseController::class, 'rejectEnrollment'])->name('enrollment-requests.reject');

        Route::get('/lessons', [LessonController::class, 'teacherIndex'])->name('lessons.index');
        Route::get('/lessons/create', [LessonController::class, 'create'])->name('lessons.create');
        Route::post('/lessons', [LessonController::class, 'store'])->name('lessons.store');
        Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        Route::get('/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('lessons.edit');
        Route::post('/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');
        Route::post('/lessons/{lesson}/sharing', [LessonController::class, 'manageSharing'])->name('lessons.sharing');
        Route::post('/lessons/{lesson}/exclusions', [LessonController::class, 'manageExclusions'])->name('lessons.exclusions');
        Route::delete('/lessons/{lesson}/exclusions/{student}', [LessonController::class, 'removeExclusion'])->name('lessons.exclusions.remove');
        Route::get('/lessons/{lesson}/students', [LessonController::class, 'getLessonStudents'])->name('lessons.students');
        Route::post('/lessons/parse-document', [LessonController::class, 'parseDocument'])->name('lessons.parse-document');
    });
    // Student Routes
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/courses', [CourseController::class, 'studentIndex'])->name('courses');
        Route::get('/courses/{course}', [CourseController::class, 'studentShow'])->name('courses.show');
        Route::post('/courses/{course}/enroll-request', [CourseController::class, 'requestEnrollment'])->name('courses.enroll-request');
        Route::get('/enrollment-requests', [CourseController::class, 'myEnrollmentRequests'])->name('enrollment-requests');

        Route::get('/courses/{course}/lessons', [LessonController::class, 'studentLessons'])->name('courses.lessons');
        Route::get('/lessons', [LessonController::class, 'studentIndex'])->name('lessons');
        Route::get('/lessons/{lesson}', [LessonController::class, 'studentShow'])->name('lessons.show');
        Route::post('/lessons/{lesson}/progress', [LessonController::class, 'updateProgress'])->name('lessons.progress');
        Route::post('/lessons/{lesson}/complete', [LessonController::class, 'completeLesson'])->name('lessons.complete');

        Route::get('/grades', [GradeController::class, 'studentIndex'])->name('grades');

        Route::get('/attendance', [AttendanceController::class, 'studentIndex'])->name('attendance');

        Route::get('/live-sessions', [LiveSessionController::class, 'studentIndex'])->name('live-sessions');
        Route::post('/live-sessions/{liveSession}/join', [LiveSessionController::class, 'joinSession'])->name('live-sessions.join');
    });
});

require __DIR__.'/auth.php';
