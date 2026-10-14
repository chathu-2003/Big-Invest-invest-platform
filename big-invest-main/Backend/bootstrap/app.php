<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            require __DIR__.'/../routes/admin.php';
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->respond(function ($response) {
            if (! request()->is('api/*') || ! $response instanceof JsonResponse) {
                return $response;
            }

            $payload = $response->getData(true);
            $status = $response->getStatusCode();

            if ($status >= 400) {
                $response->setData([
                    'success' => false,
                    'message' => $status >= 500 ? 'An internal server error occurred.' : ($payload['message'] ?? 'Request failed.'),
                    'errors' => $payload['errors'] ?? (object) [],
                ]);
            }

            return $response;
        });
    })->create();
