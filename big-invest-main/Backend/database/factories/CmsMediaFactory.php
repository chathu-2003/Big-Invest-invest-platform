<?php

namespace Database\Factories;

use App\Models\CmsMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

class CmsMediaFactory extends Factory
{
    protected $model = CmsMedia::class;

    public function definition(): array
    {
        return ['name' => 'image.png', 'path' => 'cms/'.fake()->uuid().'.png', 'mime' => 'image/png', 'size' => 100, 'alt' => 'Example image'];
    }
}
