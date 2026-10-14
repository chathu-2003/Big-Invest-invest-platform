<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_media', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('path')->unique();
            $t->string('mime', 50);
            $t->unsignedInteger('size');
            $t->string('alt')->default('');
            $t->timestamps();
        });
        Schema::create('cms_entries', function (Blueprint $t) {
            $t->id();
            $t->string('kind', 30);
            $t->string('slug', 150);
            $t->string('title');
            $t->text('summary')->nullable();
            $t->longText('description')->nullable();
            $t->string('image', 2048)->nullable();
            $t->foreignId('media_id')->nullable()->constrained('cms_media')->restrictOnDelete();
            $t->foreignId('category_id')->nullable()->constrained('cms_entries')->restrictOnDelete();
            $t->string('icon', 60)->default('globe');
            $t->unsignedInteger('display_order')->default(0);
            $t->string('status', 20)->default('draft');
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->string('author')->nullable();
            $t->timestamp('published_at')->nullable();
            $t->json('payload')->nullable();
            $t->timestamps();
            $t->unique(['kind', 'slug']);
            $t->index(['kind', 'status', 'display_order']);
        });
        Schema::create('cms_entry_media', function (Blueprint $t) {
            $t->foreignId('cms_entry_id')->constrained('cms_entries')->cascadeOnDelete();
            $t->foreignId('cms_media_id')->constrained('cms_media')->restrictOnDelete();
            $t->primary(['cms_entry_id', 'cms_media_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_entry_media');
        Schema::dropIfExists('cms_entries');
        Schema::dropIfExists('cms_media');
    }
};
