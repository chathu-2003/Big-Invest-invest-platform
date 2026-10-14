<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireAdmin
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user()?->is_admin, 403, 'Administrator access is required.');

        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
