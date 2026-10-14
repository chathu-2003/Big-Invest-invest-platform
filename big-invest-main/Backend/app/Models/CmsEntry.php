<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CmsEntry extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['payload' => 'array', 'published_at' => 'datetime', 'display_order' => 'integer'];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'media_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(self::class, 'category_id');
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published')->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    public static function invalidate(): void
    {
        DB::afterCommit(fn () => Cache::forever('cms.version', (string) Str::uuid()));
    }

    public function mediaReferences(): BelongsToMany
    {
        return $this->belongsToMany(CmsMedia::class, 'cms_entry_media', 'cms_entry_id', 'cms_media_id');
    }

    protected static function booted(): void
    {
        static::saved(function ($entry) {
            $urls = [$entry->image];
            if ($entry->kind === 'pages') {
                $schema = json_decode(file_get_contents(database_path('seeders/content/page-schema.json')), true)[$entry->slug] ?? [];
                foreach ($schema as $field) {
                    if ($field['type'] === 'image') {
                        $urls[] = $entry->payload['fields'][$field['key']] ?? null;
                    }
                }
            }
            preg_match_all('~/api/media/(\d+)~', json_encode($urls, JSON_UNESCAPED_SLASHES), $matches);
            $entry->mediaReferences()->sync(array_unique($matches[1]));
            static::invalidate();
        });
        static::deleted(fn () => static::invalidate());
    }
}
