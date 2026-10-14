<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CmsController;
use App\Http\Controllers\Admin\ManagementController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Middleware\RequireAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('api/admin')->middleware('web')->group(function () {
    Route::get('csrf', [AuthController::class, 'csrf']);
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:admin-login');
    Route::middleware(['auth', RequireAdmin::class, 'throttle:admin-api'])->group(function () {
        Route::get('cms-schema', [CmsController::class, 'schema']);
        Route::get('media', [MediaController::class, 'index']);
        Route::post('media', [MediaController::class, 'store']);
        Route::get('media/{media}/preview', [MediaController::class, 'preview']);
        Route::post('media/{media}/replace', [MediaController::class, 'replace']);
        Route::delete('media/{media}', [MediaController::class, 'destroy']);
        Route::prefix('cms/{kind}')->where(['kind' => 'services|industries|insights|network|partners|categories|pages'])->group(function () {
            Route::get('/', [CmsController::class, 'index']);
            Route::post('/', [CmsController::class, 'store']);
            Route::post('reorder', [CmsController::class, 'reorder']);
            Route::get('{id}', [CmsController::class, 'show'])->whereNumber('id');
            Route::put('{id}', [CmsController::class, 'update'])->whereNumber('id');
            Route::patch('{id}/publication', [CmsController::class, 'publication'])->whereNumber('id');
            Route::delete('{id}', [CmsController::class, 'destroy'])->whereNumber('id');
        });
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('dashboard', [ManagementController::class, 'dashboard']);
        Route::get('enquiries/export', [ManagementController::class, 'exportEnquiries'])->middleware('throttle:admin-export');
        Route::get('enquiries', [ManagementController::class, 'enquiries']);
        Route::get('enquiries/{enquiry}', [ManagementController::class, 'show']);
        Route::patch('enquiries/{enquiry}', [ManagementController::class, 'update']);
        Route::get('subscribers/export', [ManagementController::class, 'exportSubscribers'])->middleware('throttle:admin-export');
        Route::get('subscribers', [ManagementController::class, 'subscribers']);
    });
});
