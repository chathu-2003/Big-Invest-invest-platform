<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CmsEntryResource;
use App\Models\CmsEntry;
use App\Models\CmsMedia;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ContentController extends Controller
{
    public function query(string $kind): Builder
    {
        return CmsEntry::where('kind', $kind)->published()->when($kind === 'insights', fn ($q) => $q->whereHas('category', fn ($c) => $c->published()))->with(['media', 'category'])->orderBy('display_order')->orderBy('id');
    }

    private function cached(string $key, \Closure $callback): JsonResponse
    {
        $version = Cache::get('cms.version', 'initial');

        return response()->json(['success' => true, 'data' => Cache::remember('cms.'.$version.'.'.$key, 60, $callback)])->header('Cache-Control', 'no-cache');
    }

    public function index(Request $request, string $kind): JsonResponse
    {
        $v = $request->validate(['q' => 'nullable|string|max:255', 'category' => 'nullable|string|max:150', 'page' => 'nullable|integer|min:1', 'per_page' => 'nullable|integer|between:1,100']);

        return $this->cached($kind.'.'.hash('sha256', json_encode($v)), function () use ($kind, $v, $request) {
            $q = $this->query($kind);
            if (! empty($v['q'])) {
                $q->where('title', 'like', '%'.addcslashes($v['q'], '%_\\').'%');
            }
            if (! empty($v['category'])) {
                $q->whereHas('category', fn ($c) => $c->where('slug', $v['category']));
            }
            $rows = $q->paginate($v['per_page'] ?? 12);

            return ['data' => CmsEntryResource::collection($rows->items())->resolve($request), 'current_page' => $rows->currentPage(), 'last_page' => $rows->lastPage(), 'total' => $rows->total()];
        });
    }

    public function show(Request $request, string $slug, string $kind): JsonResponse
    {
        return $this->cached($kind.'.'.$slug, fn () => (new CmsEntryResource($this->query($kind)->where('slug', $slug)->firstOrFail()))->resolve($request));
    }

    public function bootstrap(Request $request): JsonResponse
    {
        return $this->cached('bootstrap', function () use ($request) {
            $result = [];
            foreach (['services', 'industries', 'insights', 'network', 'partners', 'categories', 'pages'] as $kind) {
                $result[$kind] = CmsEntryResource::collection($this->query($kind)->get())->resolve($request);
            }

            return $result;
        });
    }

    public function media(CmsMedia $media): BinaryFileResponse
    {
        abort_unless(CmsEntry::published()->where(fn ($q) => $q->where('kind', '!=', 'insights')->orWhereHas('category', fn ($category) => $category->published()))->where(function ($q) use ($media) {
            $q->where('media_id', $media->id)->orWhereHas('mediaReferences', fn ($m) => $m->where('cms_media.id', $media->id));
        })->exists(), 404);
        abort_unless(Storage::disk('public')->exists($media->getRawOriginal('path')), 404);

        return response()->file(Storage::disk('public')->path($media->getRawOriginal('path')), ['Content-Type' => $media->mime, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'public, max-age=0, must-revalidate']);
    }
}
