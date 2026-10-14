<?php

namespace App\Http\Requests;

use App\Models\Enquiry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:200'],
            'status' => ['nullable', Rule::in(['new', 'in_progress', 'resolved', 'closed'])],
            'type' => ['nullable', Rule::in(Enquiry::TYPES)],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', Rule::when($this->filled('from'), 'after_or_equal:from')],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'attention' => ['nullable', 'boolean'],
        ];
    }
}
