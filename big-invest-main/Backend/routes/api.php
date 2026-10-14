<?php

use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('api.health');
Route::post('/enquiries', [EnquiryController::class, 'store'])->middleware('throttle:enquiries')->name('api.enquiries.store');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:newsletter')->name('api.newsletter.subscribe');

Route::get('/content', [ContentController::class, 'bootstrap']);
Route::get('/media/{media}', [ContentController::class, 'media'])->whereNumber('media');
foreach (['services' => 'services', 'industries' => 'industries', 'insights' => 'insights', 'global-network' => 'network', 'partners' => 'partners', 'categories' => 'categories', 'pages' => 'pages'] as $path => $kind) {
    Route::get('/'.$path, [ContentController::class, 'index'])->defaults('kind', $kind);
    Route::get('/'.$path.'/{slug}', [ContentController::class, 'show'])->defaults('kind', $kind);
}
