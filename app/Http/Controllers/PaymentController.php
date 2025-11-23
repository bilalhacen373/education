<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Teacher;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Payment::with(['user', 'school']);

        if ($user->isTeacher()) {
            $query->where('payer_type', Teacher::class)
                ->where('payee_id', $user->teacher->id);
        } elseif ($user->isStudent()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $query->where('school_id', $school->id);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('payment_type', $request->type);
        }

        $payments = $query->latest()->paginate(20);

        $stats = [
            'total' => $query->sum('amount'),
            'completed' => Payment::where('status', 'completed')->sum('amount'),
            'pending' => Payment::where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $students = [];
        $teachers = [];
        $schools = [];

        if ($user->isSuperAdmin()) {
            $schools = School::where('is_active', true)->get(['id', 'name']);
        } elseif ($user->isSchoolAdmin()) {
            $school = $user->schools()->first();
            if ($school) {
                $students = $school->students()->with('user')->get();
                $teachers = $school->teachers()->with('user')->get();
            }
        }

        return Inertia::render('Payments/Create', [
            'students' => $students,
            'teachers' => $teachers,
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'school_id' => 'nullable|exists:schools,id',
            'payment_type' => 'required|in:tuition,salary,subscription,penalty,refund',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bank_transfer,online',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'payer_type' => 'nullable|string',
            'payee_id' => 'nullable|integer',
        ]);

        $validated['status'] = 'pending';
        $validated['transaction_id'] = 'TXN-' . time() . '-' . rand(1000, 9999);

        $payment = Payment::create($validated);

        return redirect()->route('payments.show', $payment)
            ->with('success', 'تم إنشاء عملية الدفع بنجاح');
    }

    public function show(Payment $payment)
    {
        $payment->load(['user', 'school', 'payable']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        if ($validated['status'] === 'completed' && !$payment->paid_at) {
            $validated['paid_at'] = now();
        }

        $payment->update($validated);

        return back()->with('success', 'تم تحديث حالة الدفع بنجاح');
    }

    public function confirmPayment(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_reference' => 'required|string',
        ]);

        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'notes' => 'تم التأكيد برقم مرجعي: ' . $validated['payment_reference'],
        ]);

        return back()->with('success', 'تم تأكيد الدفع بنجاح');
    }

    public function refund(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'refund_reason' => 'required|string',
        ]);

        Payment::create([
            'user_id' => $payment->user_id,
            'school_id' => $payment->school_id,
            'payment_type' => 'refund',
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'status' => 'pending',
            'description' => 'استرجاع للدفعة: ' . $payment->transaction_id,
            'notes' => $validated['refund_reason'],
            'transaction_id' => 'REFUND-' . time() . '-' . rand(1000, 9999),
        ]);

        $payment->update([
            'status' => 'refunded',
            'notes' => $validated['refund_reason'],
        ]);

        return back()->with('success', 'تم إنشاء عملية الاسترجاع بنجاح');
    }

    public function teacherPayments()
    {
        $user = auth()->user();

        if (!$user->isSchoolAdmin()) {
            abort(403);
        }

        $school = $user->schools()->first();
        if (!$school) {
            abort(404);
        }

        $teachers = $school->teachers()->with(['user', 'attendances' => function($query) {
            $query->whereMonth('date', now()->month);
        }])->get();

        $teacherPayments = $teachers->map(function($teacher) {
            $attendances = $teacher->attendances;
            $presentDays = $attendances->where('status', 'present')->count();
            $absentDays = $attendances->where('status', 'absent')->count();
            $totalPenalty = $attendances->sum('penalty_amount');

            return [
                'teacher' => $teacher,
                'present_days' => $presentDays,
                'absent_days' => $absentDays,
                'base_salary' => $teacher->salary,
                'penalty' => $totalPenalty,
                'net_salary' => $teacher->salary - $totalPenalty,
            ];
        });

        return Inertia::render('Payments/TeacherPayments', [
            'teacherPayments' => $teacherPayments,
            'month' => now()->format('Y-m'),
        ]);
    }

    public function processTeacherPayment(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
            'base_salary' => 'required|numeric|min:0',
            'penalty' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer',
        ]);

        $netSalary = $validated['base_salary'] - $validated['penalty'];

        Payment::create([
            'user_id' => $teacher->user_id,
            'school_id' => $teacher->school_id,
            'payment_type' => 'salary',
            'amount' => $netSalary,
            'payment_method' => $validated['payment_method'],
            'status' => 'completed',
            'paid_at' => now(),
            'description' => 'راتب شهر ' . $validated['month'],
            'notes' => 'الراتب الأساسي: ' . $validated['base_salary'] . ' - الخصم: ' . $validated['penalty'],
            'transaction_id' => 'SALARY-' . time() . '-' . rand(1000, 9999),
            'payer_type' => Teacher::class,
            'payee_id' => $teacher->id,
        ]);

        return back()->with('success', 'تم صرف راتب المعلم بنجاح');
    }

    public function adminIndex(Request $request)
    {
        $user = auth()->user();
        $school = $user->schools()->first();

        if (!$school) {
            return redirect()->route('dashboard');
        }

        $query = Payment::with(['user', 'payable'])
            ->where('school_id', $school->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('payment_type', $request->type);
        }

        $payments = $query->latest()->get();

        $stats = [
            'total' => $query->sum('amount'),
            'completed' => Payment::where('school_id', $school->id)->where('status', 'completed')->sum('amount'),
            'pending' => Payment::where('school_id', $school->id)->where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('SchoolAdmin/Payments', [
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }

    public function teacherIndex(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard');
        }

        $payments = Payment::where('payer_type', Teacher::class)
            ->where('payee_id', $teacher->id)
            ->with(['school'])
            ->latest()
            ->get();

        $studentPayments = Payment::where('payment_type', 'tuition')
            ->whereHas('user.student', function($q) use ($teacher) {
                $q->whereIn('class_id', $teacher->classes()->pluck('classes.id'));
            })
            ->with(['user'])
            ->latest()
            ->get();

        return Inertia::render('Teacher/Payments', [
            'salaryPayments' => $payments,
            'studentPayments' => $studentPayments,
        ]);
    }
}
