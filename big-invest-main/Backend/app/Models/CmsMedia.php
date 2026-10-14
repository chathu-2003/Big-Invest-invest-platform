<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsMedia extends Model
{
    use HasFactory;

    protected $table = 'cms_media';

    protected $guarded = ['id'];

    protected $hidden = ['path'];

    protected $appends = ['url', 'preview_url'];

    public function getPreviewUrlAttribute(): string
    {
        return '/api/admin/media/'.$this->id.'/preview';
    }

    public function getUrlAttribute(): string
    {
        return url('/api/media/'.$this->id).'?v='.substr(hash('sha256', $this->getRawOriginal('path')), 0, 16);
    }
}
