<?php

namespace App\Http\Requests;

use App\Models\Enquiry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^[+()\d\s-]+$/', function ($attribute, $value, $fail) {
                $digits = strlen(preg_replace('/\D/', '', $value));
                if ($digits < 7 || $digits > 15) {
                    $fail('The phone must contain between 7 and 15 digits.');
                }
            }],
            'company' => ['required', 'string', 'min:2', 'max:255'],
            'type' => ['required', 'string', Rule::in(Enquiry::TYPES)],
            'message' => ['required', 'string', 'min:20', 'max:1000'],
            'consent' => ['required', 'accepted'],
        ];
    }
}
