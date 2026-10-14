<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('enquiries', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('newsletter', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('admin-login', fn (Request $request) => [Limit::perMinute(5)->by($request->ip()), Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip())]);
        RateLimiter::for('admin-api', fn (Request $request) => Limit::perMinute(120)->by($request->user()->id));
        RateLimiter::for('admin-export', fn (Request $request) => Limit::perMinute(5)->by($request->user()->id));
    }
}
