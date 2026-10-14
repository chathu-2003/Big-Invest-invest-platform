<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsletterSubscriptionRequest;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function subscribe(StoreNewsletterSubscriptionRequest $request): JsonResponse
    {
        // A unique index and createOrFirst handle concurrent duplicate submissions.
        NewsletterSubscription::query()->createOrFirst(
            ['email' => $request->validated('email')],
            ['consented_at' => now()],
        );

        // Identical acknowledgements avoid revealing whether an address was already stored.
        return response()->json([
            'success' => true,
            'message' => 'Your newsletter subscription request has been received.',
            'data' => ['status' => 'subscribed'],
        ]);
    }
}
