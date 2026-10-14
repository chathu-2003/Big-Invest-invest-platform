<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsEntry;
use App\Models\CmsMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaController extends Controller
{
    private function json(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data], $status)->header('Cache-Control', 'no-store');
    }

    public function index(Request $request): JsonResponse
    {
        $v = $request->validate(['q' => 'nullable|string|max:255', 'page' => 'nullable|integer|min:1', 'per_page' => 'nullable|integer|between:1,100']);

        return $this->json(CmsMedia::when(! empty($v['q']), fn ($q) => $q->where('name', 'like', '%'.addcslashes($v['q'], '%_\\').'%'))->latest('id')->paginate($v['per_page'] ?? 12));
    }

    private function upload(Request $request, ?CmsMedia $media = null): JsonResponse
    {
        $v = $request->validate(['file' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:5120|dimensions:max_width=6000,max_height=6000', 'alt' => 'nullable|string|max:255']);
        $file = $v['file'];
        $path = $file->store('cms', 'public');
        $old = $media?->getRawOriginal('path');
        try {
            $row = DB::transaction(function () use ($media, $file, $path, $v) {
                $row = $media ?? new CmsMedia;
                $row->fill(['name' => mb_substr(basename($file->getClientOriginalName()), 0, 255), 'path' => $path, 'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'alt' => $v['alt'] ?? '']);
                $row->save();
                CmsEntry::invalidate();

                return $row;
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($path);
            throw $e;
        }
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        return $this->json($row, $media ? 200 : 201);
    }

    public function preview(CmsMedia $media): BinaryFileResponse
    {
        abort_unless(Storage::disk('public')->exists($media->getRawOriginal('path')), 404);

        return response()->file(Storage::disk('public')->path($media->getRawOriginal('path')), ['Content-Type' => $media->mime, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }

    public function store(Request $request): JsonResponse
    {
        return $this->upload($request);
    }

    public function replace(Request $request, CmsMedia $media): JsonResponse
    {
        return $this->upload($request, $media);
    }

    public function destroy(CmsMedia $media): JsonResponse
    {
        $path = $media->getRawOriginal('path');
        DB::transaction(function () use ($media) {
            $locked = CmsMedia::whereKey($media->id)->lockForUpdate()->firstOrFail();
            abort_if(CmsEntry::where('media_id', $media->id)->exists() || DB::table('cms_entry_media')->where('cms_media_id', $media->id)->exists(), 409, 'This image is referenced by content. Select a different image there first.');
            $locked->delete();
            CmsEntry::invalidate();
        });
        Storage::disk('public')->delete($path);

        return $this->json(['deleted' => true]);
    }
}
