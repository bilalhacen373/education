<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;



use Illuminate\Http\Request;
use Inertia\Inertia;
use Database\Factories\Education\vendor\nesbot\carbon\src\Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Subscription::with(['user', 'plan', 'school']);

        if ($user->isSchoolAdmin()) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->latest()->paginate(15);

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only('status'),
        ]);
    }

    public function plans()
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get();

        $user = auth()->user();
        $currentSubscription = null;

        if ($user->isSchoolAdmin()) {
            $currentSubscription = $user->subscriptions()
                ->where('status', 'active')
                ->with('plan')
                ->first();
        }

        return Inertia::render('Subscriptions/Plans', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
        ]);
    }

    public function subscribe(Request $request, SubscriptionPlan $plan)
    {
        $user = auth()->user();

        if (!$user->isSchoolAdmin() && !$user->isTeacher()) {
            return back()->withErrors(['error' => 'فقط مديرو المدارس والمعلمون يمكنهم الاشتراك']);
        }

        $activeSubscription = $user->subscriptions()
            ->where('status', 'active')
            ->first();

        if ($activeSubscription) {
            return back()->withErrors(['error' => 'لديك اشتراك نشط بالفعل']);
        }

        $validated = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
        ]);

        $startDate = Carbon::now();
        $endDate = $startDate->copy()->addDays($plan->duration_days);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'school_id' => $validated['school_id'] ?? null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 'pending',
            'price' => $plan->price,
        ]);

        return redirect()->route('payments.create', [
            'subscription_id' => $subscription->id,
            'amount' => $plan->price,
        ])->with('info', 'يرجى إتمام عملية الدفع لتفعيل الاشتراك');
    }

    public function cancel(Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        $subscription->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'تم إلغاء الاشتراك بنجاح');
    }

    public function renew(Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        $newEndDate = Carbon::parse($subscription->end_date)
            ->addDays($subscription->plan->duration_days);

        $newSubscription = Subscription::create([
            'user_id' => $subscription->user_id,
            'plan_id' => $subscription->plan_id,
            'school_id' => $subscription->school_id,
            'start_date' => $subscription->end_date,
            'end_date' => $newEndDate,
            'status' => 'pending',
            'price' => $subscription->plan->price,
        ]);

        return redirect()->route('payments.create', [
            'subscription_id' => $newSubscription->id,
            'amount' => $subscription->plan->price,
        ])->with('info', 'يرجى إتمام عملية الدفع لتجديد الاشتراك');
    }
}
