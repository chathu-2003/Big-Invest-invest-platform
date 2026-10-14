<?php

namespace App\Http\Requests;

use App\Models\CmsMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CmsEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public static function safeUrl(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if (! is_string($value) || preg_match('/[\x00-\x20<>"\'\\\\]/', $value) || str_starts_with($value, '//') || (! str_starts_with($value, '/') && ! str_starts_with($value, '#') && ! in_array(parse_url($value, PHP_URL_SCHEME), ['http', 'https'], true))) {
                $fail('Use a local path or an HTTP(S) URL.');
            }
            if (preg_match('~/api/media/(\d+)~', (string) $value, $match) && ! CmsMedia::whereKey($match[1])->exists()) {
                $fail('The selected media image no longer exists.');
            }
        };
    }

    public function rules(): array
    {
        $kind = $this->route('kind');
        $id = $this->route('id');
        $rules = ['title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'string', 'max:150', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('cms_entries', 'slug')->where('kind', $kind)->ignore($id)], 'summary' => ['nullable', 'string', 'max:5000'], 'description' => ['nullable', 'string', 'max:100000'], 'image' => ['nullable', 'string', 'max:2048', self::safeUrl()], 'media_id' => ['nullable', 'integer', 'exists:cms_media,id'], 'icon' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9-]+$/'], 'display_order' => ['required', 'integer', 'min:0', 'max:1000000'], 'status' => ['required', Rule::in(['draft', 'published'])], 'seo_title' => ['nullable', 'string', 'max:255'], 'seo_description' => ['nullable', 'string', 'max:1000'], 'author' => ['nullable', 'string', 'max:255'], 'published_at' => ['nullable', 'date'], 'category_id' => [$kind === 'insights' ? 'required' : 'nullable', 'integer', Rule::exists('cms_entries', 'id')->where('kind', 'categories')], 'payload' => ['present', 'array']];
        $allowed = match ($kind) {
            'services' => ['type', 'imgPos', 'points', 'included', 'outcomes', 'nav_description'],'industries' => ['short', 'tagline', 'group', 'plain', 'opps', 'services', 'note'],'insights' => ['read', 'sample'],'network' => ['x', 'y', 'd', 'items', 'disclaimer'],'partners' => ['website', 'confirmed'],'pages' => ['fields'],'categories' => [],default => []
        };
        if ($allowed) {
            $rules['payload'][] = 'array:'.implode(',', $allowed);
        } else {
            $rules['payload'][] = 'max:0';
        }
        foreach (['points', 'included', 'items', 'services'] as $key) {
            if (in_array($key, $allowed, true)) {
                $rules['payload.'.$key] = ['sometimes', 'array', 'max:40'];
                $rules['payload.'.$key.'.*'] = ['string', 'max:2000'];
            }
        }
        foreach (['outcomes', 'opps'] as $key) {
            if (in_array($key, $allowed, true)) {
                $rules['payload.'.$key] = ['sometimes', 'array', 'max:30'];
                $rules['payload.'.$key.'.*'] = ['array', 'size:2'];
                $rules['payload.'.$key.'.*.*'] = ['string', 'max:2000'];
            }
        }
        foreach (['short', 'tagline', 'group', 'note', 'disclaimer', 'nav_description'] as $key) {
            if (in_array($key, $allowed, true)) {
                $rules['payload.'.$key] = ['sometimes', 'nullable', 'string', 'max:5000'];
            }
        }
        if ($kind === 'services') {
            $rules['payload.type'] = ['required', Rule::in(['general', 'partnership', 'services', 'import-export', 'sourcing', 'logistics', 'investment', 'industry', 'other'])];
            $rules['payload.imgPos'] = ['nullable', 'regex:/^\d{1,3}% \d{1,3}%$/'];
        }
        if ($kind === 'industries') {
            $rules['payload.plain'] = ['sometimes', 'boolean'];
            $rules['payload.services.*'] = ['string', Rule::exists('cms_entries', 'slug')->where('kind', 'services')];
        }
        if ($kind === 'insights') {
            $rules['description'] = ['required', 'string', 'max:100000'];
            $rules['payload.read'] = ['required', 'integer', 'min:1', 'max:120'];
            $rules['payload.sample'] = ['sometimes', 'boolean'];
        }
        if ($kind === 'network') {
            $rules['payload.x'] = ['nullable', 'numeric', 'between:0,1240'];
            $rules['payload.y'] = ['nullable', 'numeric', 'between:0,560'];
            $rules['payload.d'] = ['nullable', 'string', 'max:2000', 'regex:/^[MmLlHhVvCcSsQqTtAaZz0-9., +\-]*$/'];
        }
        if ($kind === 'partners') {
            $rules['payload.website'] = ['nullable', 'string', 'max:2048', self::safeUrl()];
            $rules['payload.confirmed'] = ['required', 'boolean'];
        }
        if ($kind === 'pages') {
            $rules['slug'] = ['required', Rule::in(['home', 'about']), Rule::unique('cms_entries', 'slug')->where('kind', 'pages')->ignore($id)];
            $schema = json_decode(file_get_contents(database_path('seeders/content/page-schema.json')), true)[$this->input('slug')] ?? [];
            $rules['payload.fields'] = ['required', 'array:'.implode(',', array_column($schema, 'key'))];
            foreach ($schema as $field) {
                $rules['payload.fields.'.$field['key']] = ['present', 'string', 'max:10000'];
                if (in_array($field['type'], ['image', 'link'], true)) {
                    $rules['payload.fields.'.$field['key']][] = self::safeUrl();
                }
            }
        }

        return $rules;
    }
}
