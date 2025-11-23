<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $settings = SystemSetting::all()->keyBy('key');

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        foreach ($validated['settings'] as $settingData) {
            SystemSetting::updateOrCreate(
                ['key' => $settingData['key']],
                [
                    'value' => $settingData['value'],
                    'description' => $settingData['description'] ?? null,
                ]
            );
        }

        return back()->with('success', 'تم تحديث الإعدادات بنجاح');
    }

    public function show($key)
    {
        $setting = SystemSetting::where('key', $key)->firstOrFail();

        return response()->json($setting);
    }

    public function updateSingle(Request $request, $key)
    {
        $user = auth()->user();

        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'value' => 'required',
            'description' => 'nullable|string',
        ]);

        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            $validated
        );

        return response()->json([
            'message' => 'تم تحديث الإعداد بنجاح',
            'setting' => $setting,
        ]);
    }
}
