<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Services\ChatApiService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, ChatApiService $chatApiService): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:20',
            'user_type' => 'required|in:super_admin,school_admin,teacher,student',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'user_type' => $request->user_type,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->user_type);

        event(new Registered($user));

        Auth::login($user);

        $chatApiService->ensureAuthenticated('deepseek');

        if ($request->user_type === 'student') {
            return redirect()->route('student.show-complete-profile');
        } elseif ($request->user_type === 'teacher') {
            return redirect()->route('teacher.show-complete-profile');
        } elseif ($request->user_type === 'school_admin') {
            return redirect()->route('school-admin.show-complete-profile');
        }

        return redirect(RouteServiceProvider::HOME);
    }
}
