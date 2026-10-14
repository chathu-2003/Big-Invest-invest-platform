<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'kind' => $this->kind, 'slug' => $this->slug, 'title' => $this->title, 'summary' => $this->summary, 'description' => $this->description, 'image' => $this->media?->url ?? $this->image, 'icon' => $this->icon, 'display_order' => $this->display_order, 'seo_title' => $this->seo_title, 'seo_description' => $this->seo_description, 'author' => $this->author, 'published_at' => $this->published_at?->toIso8601String(), 'category' => $this->category ? ['slug' => $this->category->slug, 'title' => $this->category->title] : null, 'payload' => $this->payload ?? []];
    }
}
