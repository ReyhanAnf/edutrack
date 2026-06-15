<?php

namespace App\Providers;

use App\Events\NotificationReceived;
use App\Listeners\GamificationEventSubscriber;
use App\Listeners\NotificationEventSubscriber;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Domains\ArtificialIntelligence\Contracts\QuizGeneratorInterface::class,
            \App\Domains\ArtificialIntelligence\Services\HttpQuizGenerator::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        Event::subscribe(GamificationEventSubscriber::class);
        Event::subscribe(NotificationEventSubscriber::class);

        // Broadcast real-time notification event for instant badge updates
        Event::listen(NotificationSent::class, function (NotificationSent $event) {
            if (method_exists($event->notifiable, 'getKey')) {
                event(new NotificationReceived($event->notifiable->getKey()));
            }
        });

        // Super admin bypasses all permission checks
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super admin') ? true : null;
        });
    }
}
