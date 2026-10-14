<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    public const TYPES = ['general', 'partnership', 'services', 'import-export', 'sourcing', 'logistics', 'investment', 'industry', 'other'];

    protected $fillable = ['name', 'email', 'phone', 'company', 'type', 'message', 'consented_at'];

    protected $attributes = ['status' => 'new'];

    protected function casts(): array
    {
        return ['consented_at' => 'datetime'];
    }
}
