<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CmsEntryRequest;
use App\Models\CmsEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CmsController extends Controller
{
    private function entry(string $kind, int $id): CmsEntry
    {
        return CmsEntry::where('kind', $kind)->findOrFail($id);
    }

    private function json(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data], $status)->header('Cache-Control', 'no-store');
    }

    public function index(Request $request, string $kind): JsonResponse
    {
        $v = $request->validate(['q' => 'nullable|string|max:255', 'status' => ['nullable', Rule::in(['draft', 'published'])], 'sort' => ['nullable', Rule::in(['display_order', 'title', 'updated_at'])], 'direction' => ['nullable', Rule::in(['asc', 'desc'])], 'per_page' => 'nullable|integer|between:1,100', 'page' => 'nullable|integer|min:1']);
        $q = CmsEntry::where('kind', $kind)->with('media');
        if (! empty($v['q'])) {
            $q->where('title', 'like', '%'.addcslashes($v['q'], '%_\\').'%');
        }
        if (! empty($v['status'])) {
            $q->where('status', $v['status']);
        }

        return $this->json($q->orderBy($v['sort'] ?? 'display_order', $v['direction'] ?? 'asc')->orderBy('id')->paginate($v['per_page'] ?? 10));
    }

    public function show(string $kind, int $id): JsonResponse
    {
        return $this->json($this->entry($kind, $id)->load('media'));
    }

    public function store(CmsEntryRequest $request, string $kind): JsonResponse
    {
        return $this->json(DB::transaction(fn () => CmsEntry::create(['kind' => $kind] + $this->values($request))), 201);
    }

    public function update(CmsEntryRequest $request, string $kind, int $id): JsonResponse
    {
        $entry = $this->entry($kind, $id);
        DB::transaction(fn () => $entry->update($this->values($request)));

        return $this->json($entry->fresh()->load('media'));
    }

    private function values(CmsEntryRequest $request): array
    {
        $v = $request->validated();
        if ($v['status'] === 'published' && empty($v['published_at'])) {
            $v['published_at'] = now();
        }

        return $v;
    }

    public function publication(Request $request, string $kind, int $id): JsonResponse
    {
        $v = $request->validate(['status' => ['required', Rule::in(['draft', 'published'])]]);
        $entry = $this->entry($kind, $id);
        $entry->status = $v['status'];
        if ($entry->status === 'published' && ! $entry->published_at) {
            $entry->published_at = now();
        }
        $entry->save();

        return $this->json($entry);
    }

    public function destroy(string $kind, int $id): JsonResponse
    {
        $entry = $this->entry($kind, $id);
        abort_if(CmsEntry::where('category_id', $id)->exists(), 409, 'This category is used by articles. Reassign them first.');
        $entry->delete();

        return $this->json(['deleted' => true]);
    }

    public function reorder(Request $request, string $kind): JsonResponse
    {
        $v = $request->validate(['ids' => 'required|array|min:1|max:100', 'ids.*' => ['required', 'integer', 'distinct', Rule::exists('cms_entries', 'id')->where('kind', $kind)]]);
        DB::transaction(function () use ($v, $kind) {
            $entries = CmsEntry::where('kind', $kind)->orderBy('display_order')->orderBy('id')->lockForUpdate()->get();
            $requested = collect($v['ids']);
            $position = 0;
            $ordered = $entries->map(function ($entry) use ($requested, &$position) {
                return $requested->contains($entry->id) ? $requested[$position++] : $entry->id;
            });
            foreach ($ordered as $order => $id) {
                $entries->firstWhere('id', $id)->update(['display_order' => $order]);
            }
        });

        return $this->json(['reordered' => true]);
    }

    public function schema(): JsonResponse
    {
        $schema = json_decode(file_get_contents(database_path('seeders/content/page-schema.json')), true);
        $rows = json_decode(file_get_contents(database_path('seeders/content/initial-content.json')), true);
        foreach ($rows as $row) {
            if ($row['kind'] === 'pages') {
                foreach ($schema[$row['slug']] as &$field) {
                    $field['value'] = $row['payload']['fields'][$field['key']];
                }
                unset($field);
            }
        }

        return $this->json($schema);
    }
}
