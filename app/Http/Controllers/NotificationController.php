<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function unread()
    {
        $notifications = auth()->user()
            ->unreadNotifications()
            ->limit(10)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => auth()->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(DatabaseNotification $notification)
    {
        if ($notification->notifiable_id === auth()->id()) {
            $notification->markAsRead();
        }

        return back()->with('success', 'تم تحديث الإشعار');
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'تم تحديث جميع الإشعارات');
    }

    public function destroy(DatabaseNotification $notification)
    {
        if ($notification->notifiable_id === auth()->id()) {
            $notification->delete();
        }

        return back()->with('success', 'تم حذف الإشعار');
    }

    public function destroyAll()
    {
        auth()->user()->notifications()->delete();

        return back()->with('success', 'تم حذف جميع الإشعارات');
    }
}
