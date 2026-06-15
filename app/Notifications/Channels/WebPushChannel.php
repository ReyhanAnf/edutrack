<?php

namespace App\Notifications\Channels;

use App\Models\PushSubscription;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class WebPushChannel
{
    public function send($notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toWebPush')) {
            return;
        }

        $data = $notification->toWebPush($notifiable);

        $publicKey = config('services.vapid.public_key');
        $privateKey = config('services.vapid.private_key');

        if (!$publicKey || !$privateKey) {
            Log::warning('VAPID keys not configured, skipping web push.');
            return;
        }

        $auth = [
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ];

        $webPush = new WebPush($auth);

        $subscriptions = PushSubscription::where('user_id', $notifiable->id)->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = json_encode([
            'title' => $data['title'] ?? 'EduTrack',
            'body' => $data['body'] ?? '',
            'icon' => $data['icon'] ?? '/logo.png',
            'badge' => '/logo.png',
            'tag' => $data['tag'] ?? 'edutrack-notification',
            'url' => $data['url'] ?? '/',
            'data' => $data['extra'] ?? [],
        ]);

        $invalidEndpoints = [];

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding ?? 'aes128gcm',
            ]);

            $report = $webPush->sendOneNotification($subscription, $payload);

            if ($report->isSubscriptionExpired()) {
                $invalidEndpoints[] = $sub->endpoint;
            }
        }

        // Clean up expired subscriptions
        if (!empty($invalidEndpoints)) {
            PushSubscription::whereIn('endpoint', $invalidEndpoints)->delete();
        }
    }
}
