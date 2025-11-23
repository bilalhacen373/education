<?php

namespace App\Http\Controllers;

use App\Models\JobRequest;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = JobRequest::with(['requester', 'school']);

        if ($user->isSchoolAdmin()) {
            $query->where('requester_id', $user->id)
                ->where('request_type', 'school_seeking_teacher');
        } elseif ($user->isTeacher()) {
            $query->where('request_type', 'teacher_seeking_school');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $jobRequests = $query->latest()->paginate(15);

        return Inertia::render('JobRequests/Index', [
            'jobRequests' => $jobRequests,
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $requestType = $user->isSchoolAdmin() ? 'school_seeking_teacher' : 'teacher_seeking_school';

        return Inertia::render('JobRequests/Create', [
            'requestType' => $requestType,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'required|string',
            'requirements' => 'required|array',
            'subjects' => 'nullable|array',
            'offered_salary' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'location_ar' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,freelance',
            'expires_at' => 'nullable|date',
        ]);

        $validated['requester_id'] = $user->id;
        $validated['requester_type'] = $user->isSchoolAdmin() ? 'school_admin' : 'teacher';
        $validated['request_type'] = $user->isSchoolAdmin() ? 'school_seeking_teacher' : 'teacher_seeking_school';
        $validated['status'] = 'open';

        $jobRequest = JobRequest::create($validated);

        return redirect()->route('job-requests.show', $jobRequest)
            ->with('success', 'تم نشر طلب التوظيف بنجاح');
    }

    public function show(JobRequest $jobRequest)
    {
        $jobRequest->load(['requester', 'school', 'applications.applicant']);

        $userApplication = null;
        if (auth()->user()->isTeacher() && auth()->user()->teacher) {
            $userApplication = $jobRequest->applications()
                ->where('applicant_id', auth()->id())
                ->first();
        }

        return Inertia::render('JobRequests/Show', [
            'jobRequest' => $jobRequest,
            'userApplication' => $userApplication,
        ]);
    }

    public function edit(JobRequest $jobRequest)
    {
        $this->authorize('update', $jobRequest);

        return Inertia::render('JobRequests/Edit', [
            'jobRequest' => $jobRequest,
        ]);
    }

    public function update(Request $request, JobRequest $jobRequest)
    {
        $this->authorize('update', $jobRequest);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'salary_range_min' => 'nullable|numeric|min:0',
            'salary_range_max' => 'nullable|numeric|min:0',
            'location' => 'required|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,contract',
            'status' => 'required|in:open,closed,filled',
        ]);

        $jobRequest->update($validated);

        return redirect()->route('job-requests.show', $jobRequest)
            ->with('success', 'تم تحديث طلب التوظيف بنجاح');
    }

    public function destroy(JobRequest $jobRequest)
    {
        $this->authorize('delete', $jobRequest);

        $jobRequest->delete();

        return redirect()->route('job-requests.index')
            ->with('success', 'تم حذف طلب التوظيف بنجاح');
    }

    public function apply(Request $request, JobRequest $jobRequest)
    {
        $user = auth()->user();

        if (!$user->isTeacher()) {
            return back()->withErrors(['error' => 'فقط المعلمون يمكنهم التقديم']);
        }

        $existingApplication = JobApplication::where('job_request_id', $jobRequest->id)
            ->where('applicant_id', $user->id)
            ->exists();

        if ($existingApplication) {
            return back()->withErrors(['error' => 'لقد قمت بالتقديم على هذا الطلب مسبقاً']);
        }

        $validated = $request->validate([
            'cover_letter' => 'required|string',
            'expected_salary' => 'nullable|numeric|min:0',
        ]);

        JobApplication::create([
            'job_request_id' => $jobRequest->id,
            'applicant_id' => $user->id,
            'cover_letter' => $validated['cover_letter'],
            'expected_salary' => $validated['expected_salary'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'تم إرسال طلبك بنجاح');
    }

    public function applications(JobRequest $jobRequest)
    {
        $this->authorize('view', $jobRequest);

        $applications = $jobRequest->applications()
            ->with(['applicant.teacher'])
            ->latest()
            ->get();

        return Inertia::render('JobRequests/Applications', [
            'jobRequest' => $jobRequest,
            'applications' => $applications,
        ]);
    }

    public function updateApplicationStatus(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,rejected',
            'notes' => 'nullable|string',
        ]);

        $application->update($validated);

        return back()->with('success', 'تم تحديث حالة الطلب بنجاح');
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();

        $query = JobRequest::with(['requester', 'school'])
            ->where('request_type', 'school_seeking_teacher')
            ->where('status', 'open');

        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        if ($request->has('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        $jobRequests = $query->latest()->get();

        $myApplications = JobApplication::where('applicant_id', $user->id)
            ->with(['jobRequest.school', 'jobRequest.requester'])
            ->latest()
            ->get();

        $myJobRequests = JobRequest::where('requester_id', $user->id)
            ->where('request_type', 'teacher_seeking_school')
            ->with('applications.applicant')
            ->latest()
            ->get();

        return Inertia::render('Teacher/JobRequests', [
            'jobRequests' => $jobRequests,
            'myApplications' => $myApplications,
            'myJobRequests' => $myJobRequests,
        ]);
    }

    public function teacherStore(Request $request)
    {
        $user = auth()->user();

        if (!$user->isTeacher()) {
            return back()->withErrors(['error' => 'غير مصرح']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'required|string',
            'description_ar' => 'required|string',
            'requirements' => 'required|array',
            'subjects' => 'nullable|array',
            'offered_salary' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'location_ar' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full_time,part_time,freelance',
            'expires_at' => 'nullable|date',
        ]);

        $validated['requester_id'] = $user->id;
        $validated['requester_type'] = 'teacher';
        $validated['request_type'] = 'teacher_seeking_school';
        $validated['status'] = 'open';

        JobRequest::create($validated);

        return back()->with('success', 'تم نشر طلب التوظيف بنجاح');
    }
}
