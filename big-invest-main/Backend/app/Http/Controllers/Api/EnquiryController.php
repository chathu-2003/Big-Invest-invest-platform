<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnquiryRequest;
use App\Http\Resources\EnquiryResource;
use App\Models\Enquiry;
use Illuminate\Http\JsonResponse;

class EnquiryController extends Controller
{
    public function store(StoreEnquiryRequest $request): JsonResponse
    {
        $enquiry = Enquiry::create([
            ...$request->safe()->except('consent'),
            'consented_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your enquiry has been received.',
            'data' => (new EnquiryResource($enquiry))->resolve($request),
        ], 201);
    }
}
