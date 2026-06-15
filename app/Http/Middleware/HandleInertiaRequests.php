<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'is_admin' => $request->user()->hasAnyRole(['admin', 'super admin']),
                    'roles' => $request->user()->roles->pluck('name'),
                    'permissions' => $request->user()->hasRole('super admin')
                        ? ['*']
                        : $request->user()->getAllPermissions()->pluck('name'),
                    'pending_friend_requests_count' => $request->user()->friendRequestsReceived()->count(),
                    'unread_notifications_count' => $request->user()->unreadNotifications()->count(),
                ]) : null,
            ],
        ];
    }
}
