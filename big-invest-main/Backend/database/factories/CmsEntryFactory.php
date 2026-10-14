<?php

namespace Database\Factories;

use App\Models\CmsEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

class CmsEntryFactory extends Factory
{
    protected $model = CmsEntry::class;

    public function definition(): array
    {
        return ['kind' => 'services', 'title' => fake()->sentence(3), 'slug' => fake()->unique()->slug(3), 'icon' => 'globe', 'summary' => 'Trade coordination services.', 'description' => 'Detailed service information.', 'status' => 'draft', 'display_order' => 0, 'payload' => ['type' => 'general', 'points' => [], 'included' => [], 'outcomes' => []]];
    }
}
