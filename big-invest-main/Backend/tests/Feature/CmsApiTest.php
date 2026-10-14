<?php

namespace Tests\Feature;

use App\Models\CmsEntry;
use App\Models\CmsMedia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CmsApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        if (DB::connection()->getDriverName() !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            throw new \RuntimeException('CMS tests require isolated SQLite memory storage.');
        }
        foreach (glob(database_path('migrations/*.php')) as $file) {
            (require $file)->up();
        }
    }

    private function admin(): void
    {
        $user = User::factory()->create();
        $user->is_admin = true;
        $user->save();
        $this->actingAs($user);
    }

    private function service(array $override = []): array
    {
        return array_replace(['title' => 'CMS service', 'slug' => 'cms-service', 'summary' => 'Service summary', 'description' => 'Service details', 'icon' => 'globe', 'display_order' => 0, 'status' => 'draft', 'payload' => ['type' => 'services', 'points' => ['Coordination'], 'included' => ['Planning'], 'outcomes' => [['Clear plan', 'Agreed next steps']]]], $override);
    }

    public function test_service_crud_publication_updates_public_content_and_cache(): void
    {
        $this->admin();
        $v = $this->service();
        $id = $this->postJson('/api/admin/cms/services', $v)->assertCreated()->json('data.id');
        $this->assertDatabaseHas('cms_entries', ['id' => $id, 'status' => 'draft']);
        $this->getJson('/api/services')->assertJsonPath('data.total', 0);
        $this->patchJson('/api/admin/cms/services/'.$id.'/publication', ['status' => 'published'])->assertOk();
        $this->getJson('/api/services/cms-service')->assertOk()->assertJsonPath('data.title', 'CMS service')->assertJsonMissingPath('data.status')->assertJsonMissingPath('data.created_at');
        $this->getJson('/api/content')->assertJsonPath('data.services.0.title', 'CMS service');
        $this->putJson('/api/admin/cms/services/'.$id, $this->service(['title' => 'Updated title', 'status' => 'published']))->assertOk();
        $this->getJson('/api/services/cms-service')->assertJsonPath('data.title', 'Updated title');
        $this->getJson('/api/content')->assertJsonPath('data.services.0.title', 'Updated title');
        $this->patchJson('/api/admin/cms/services/'.$id.'/publication', ['status' => 'draft'])->assertOk();
        $this->getJson('/api/services')->assertJsonPath('data.total', 0);
        $this->getJson('/api/services/cms-service')->assertNotFound();
        $this->deleteJson('/api/admin/cms/services/'.$id)->assertOk();
        $this->assertDatabaseMissing('cms_entries', ['id' => $id]);
    }

    public function test_cms_routes_reject_guests_and_non_admins(): void
    {
        foreach (['services', 'industries', 'insights', 'network', 'partners', 'categories', 'pages'] as $kind) {
            $this->getJson('/api/admin/cms/'.$kind)->assertUnauthorized();
            $this->postJson('/api/admin/cms/'.$kind, $this->service())->assertUnauthorized();
            $this->putJson('/api/admin/cms/'.$kind.'/1', $this->service())->assertUnauthorized();
            $this->deleteJson('/api/admin/cms/'.$kind.'/1')->assertUnauthorized();
            $this->patchJson('/api/admin/cms/'.$kind.'/1/publication', ['status' => 'published'])->assertUnauthorized();
            $this->postJson('/api/admin/cms/'.$kind.'/reorder', ['ids' => [1]])->assertUnauthorized();
        }
        $this->postJson('/api/admin/media', [])->assertUnauthorized();
        $this->actingAs(User::factory()->create())->postJson('/api/admin/cms/services', $this->service())->assertForbidden();
        $this->postJson('/api/admin/media', [])->assertForbidden();
    }

    public function test_validations_and_unique_slugs_and_kind_scope(): void
    {
        $this->admin();
        $this->postJson('/api/admin/cms/services', [])->assertUnprocessable()->assertJsonValidationErrors(['title', 'slug', 'status', 'payload']);
        $id = $this->postJson('/api/admin/cms/services', $this->service())->assertCreated()->json('data.id');
        $this->postJson('/api/admin/cms/services', $this->service())->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->putJson('/api/admin/cms/services/'.$id, $this->service())->assertOk();
        $this->getJson('/api/admin/cms/industries/'.$id)->assertNotFound();
        $this->postJson('/api/admin/cms/services', $this->service(['slug' => 'bad slug', 'image' => 'javascript:alert(1)', 'icon' => 'x" onload="x', 'payload' => ['type' => 'unsupported', 'unknown' => 'unsafe']]))->assertUnprocessable()->assertJsonValidationErrors(['slug', 'image', 'icon', 'payload', 'payload.type']);
        $this->getJson('/api/admin/cms/services?sort=id desc;drop')->assertUnprocessable();
    }

    public function test_ordering_search_pagination_and_reorder(): void
    {
        $this->admin();
        $a = CmsEntry::factory()->create(['title' => 'Alpha', 'slug' => 'alpha', 'status' => 'published', 'display_order' => 5]);
        $b = CmsEntry::factory()->create(['title' => 'Beta', 'slug' => 'beta', 'status' => 'published', 'display_order' => 2]);
        $this->getJson('/api/services?per_page=1')->assertJsonPath('data.data.0.slug', 'beta')->assertJsonPath('data.total', 2);
        $this->postJson('/api/admin/cms/services/reorder', ['ids' => [$a->id, $b->id]])->assertOk();
        $this->getJson('/api/services')->assertJsonPath('data.data.0.slug', 'alpha');
        $c = CmsEntry::factory()->create(['title' => 'Gamma', 'slug' => 'gamma', 'status' => 'published', 'display_order' => 2]);
        $this->postJson('/api/admin/cms/services/reorder', ['ids' => [$b->id, $a->id]])->assertOk();
        $this->getJson('/api/services')->assertJsonPath('data.data.0.slug', 'beta')->assertJsonPath('data.data.1.slug', 'alpha')->assertJsonPath('data.data.2.slug', 'gamma');
        $this->assertSame(2, $c->fresh()->display_order);
        $this->getJson('/api/admin/cms/services?q=Beta')->assertJsonPath('data.total', 1);
        $this->postJson('/api/admin/cms/industries/reorder', ['ids' => [$a->id]])->assertUnprocessable();
    }

    public function test_industries_insights_network_partners_and_categories_have_complete_crud(): void
    {
        $this->admin();
        $category = CmsEntry::factory()->create(['kind' => 'categories', 'slug' => 'news', 'title' => 'News', 'status' => 'published', 'payload' => []]);
        $modules = [
            'industries' => ['payload' => ['short' => 'Industry', 'tagline' => 'Sector support', 'group' => 'other', 'opps' => [['Opportunity', 'Description']], 'services' => [], 'note' => 'Confirm regulations.']],
            'insights' => ['category_id' => $category->id, 'payload' => ['read' => 5, 'sample' => false]],
            'network' => ['payload' => ['x' => 612, 'y' => 168, 'd' => 'M893 372 Q752 71 612 168', 'items' => ['Market support'], 'disclaimer' => 'Illustrative only.']],
            'partners' => ['payload' => ['website' => 'https://example.com', 'confirmed' => false]],
            'categories' => ['payload' => []],
        ];
        foreach ($modules as $kind => $fields) {
            $v = $this->service(['slug' => 'new-'.$kind] + $fields);
            $id = $this->postJson('/api/admin/cms/'.$kind, $v)->assertCreated()->json('data.id');
            $this->patchJson('/api/admin/cms/'.$kind.'/'.$id.'/publication', ['status' => 'published'])->assertOk();
            $public = $kind === 'network' ? 'global-network' : $kind;
            $this->getJson('/api/'.$public.'/new-'.$kind)->assertOk()->assertJsonPath('data.title', 'CMS service');
            $this->putJson('/api/admin/cms/'.$kind.'/'.$id, array_replace($v, ['title' => 'Updated', 'status' => 'published']))->assertOk();
            $this->getJson('/api/'.$public.'/new-'.$kind)->assertJsonPath('data.title', 'Updated');
            $this->patchJson('/api/admin/cms/'.$kind.'/'.$id.'/publication', ['status' => 'draft'])->assertOk();
            $this->getJson('/api/'.$public.'/new-'.$kind)->assertNotFound();
            $this->deleteJson('/api/admin/cms/'.$kind.'/'.$id)->assertOk();
            $this->assertDatabaseMissing('cms_entries', ['id' => $id]);
        }
    }

    public function test_article_category_publication_scheduling_and_delete_restriction(): void
    {
        $this->freezeTime();
        $this->admin();
        $category = CmsEntry::factory()->create(['kind' => 'categories', 'status' => 'published', 'payload' => []]);
        $article = CmsEntry::factory()->create(['kind' => 'insights', 'category_id' => $category->id, 'status' => 'published', 'published_at' => now()->addDay(), 'payload' => ['read' => 5]]);
        $this->getJson('/api/insights')->assertJsonPath('data.total', 0);
        $article->update(['published_at' => now()]);
        $this->getJson('/api/insights')->assertJsonPath('data.total', 1);
        $this->patchJson('/api/admin/cms/categories/'.$category->id.'/publication', ['status' => 'draft'])->assertOk();
        $this->getJson('/api/insights')->assertJsonPath('data.total', 0);
        $this->deleteJson('/api/admin/cms/categories/'.$category->id)->assertConflict();
    }

    private function png(string $name = 'image.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5ioAAAAASUVORK5CYII='));
    }

    public function test_media_upload_replace_reference_protection_and_unused_removal(): void
    {
        Storage::fake('public');
        $this->admin();
        $response = $this->post('/api/admin/media', ['file' => $this->png(), 'alt' => 'Image alt'], ['Accept' => 'application/json'])->assertCreated()->assertJsonMissingPath('data.path');
        $id = $response->json('data.id');
        $media = CmsMedia::findOrFail($id);
        $path = $media->getRawOriginal('path');
        Storage::disk('public')->assertExists($path);
        $this->get('/api/media/'.$id)->assertNotFound();
        $this->get('/api/admin/media/'.$id.'/preview')->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $entry = CmsEntry::factory()->create(['media_id' => $id, 'status' => 'published']);
        $this->get('/api/media/'.$id)->assertOk();
        $this->deleteJson('/api/admin/media/'.$id)->assertConflict();
        $this->post('/api/admin/media/'.$id.'/replace', ['file' => $this->png('replacement.png')], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.id', $id);
        Storage::disk('public')->assertMissing($path);
        $this->getJson('/api/services/'.$entry->slug)->assertJsonPath('data.image', fn ($url) => str_starts_with($url, url('/api/media/'.$id).'?v='));
        $category = CmsEntry::factory()->create(['kind' => 'categories', 'status' => 'draft', 'payload' => []]);
        $entry->update(['kind' => 'insights', 'category_id' => $category->id]);
        $this->get('/api/media/'.$id)->assertNotFound();
        $category->update(['status' => 'published']);
        $this->get('/api/media/'.$id)->assertOk();
        $entry->delete();
        $newPath = $media->fresh()->getRawOriginal('path');
        $this->deleteJson('/api/admin/media/'.$id)->assertOk();
        Storage::disk('public')->assertMissing($newPath);
        $this->get('/api/media/'.$id)->assertNotFound();
    }

    public function test_media_rejects_unsafe_oversized_and_non_image_uploads(): void
    {
        Storage::fake('public');
        $this->admin();
        foreach (['attack.svg' => '<svg onload="alert(1)"></svg>', 'attack.php' => '<?php echo 1;', 'image.png' => 'not an image'] as $name => $body) {
            $this->post('/api/admin/media', ['file' => UploadedFile::fake()->createWithContent($name, $body)], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');
        }
        $this->post('/api/admin/media', ['file' => UploadedFile::fake()->create('huge.png', 6000, 'image/png')], ['Accept' => 'application/json'])->assertUnprocessable();
        $this->assertSame(0, CmsMedia::count());
        Storage::disk('public')->assertDirectoryEmpty('cms');
    }

    public function test_home_about_structured_content_validates_links_and_protects_media_references(): void
    {
        Storage::fake('public');
        $this->admin();
        $this->artisan('cms:import')->assertExitCode(0);
        $home = CmsEntry::where('kind', 'pages')->where('slug', 'home')->firstOrFail();
        $v = $home->only(['title', 'slug', 'summary', 'description', 'image', 'media_id', 'icon', 'display_order', 'status', 'seo_title', 'seo_description', 'author', 'published_at', 'category_id', 'payload']);
        $schema = json_decode(file_get_contents(database_path('seeders/content/page-schema.json')), true)['home'];
        $text = collect($schema)->firstWhere('type', 'text')['key'];
        $image = collect($schema)->firstWhere('type', 'image')['key'];
        $link = collect($schema)->firstWhere('type', 'link')['key'];
        $v['payload']['fields'][$text] = 'Updated Home content';
        $mediaId = $this->post('/api/admin/media', ['file' => $this->png()], ['Accept' => 'application/json'])->assertCreated()->json('data.id');
        $v['payload']['fields'][$image] = url('/api/media/'.$mediaId);
        $this->putJson('/api/admin/cms/pages/'.$home->id, $v)->assertOk();
        $this->getJson('/api/pages/home')->assertJsonPath('data.payload.fields.'.$text, 'Updated Home content');
        $this->deleteJson('/api/admin/media/'.$mediaId)->assertConflict();
        $v['payload']['fields'][$link] = 'javascript:alert(1)';
        $this->putJson('/api/admin/cms/pages/'.$home->id, $v)->assertUnprocessable()->assertJsonValidationErrors('payload.fields.'.$link);
        $v['payload']['fields'][$link] = '/services';
        $v['payload']['fields']['unknown'] = 'Injected field';
        $this->putJson('/api/admin/cms/pages/'.$home->id, $v)->assertUnprocessable()->assertJsonValidationErrors('payload.fields');
        $v['payload']['fields'] = $home->payload['fields'];
        $v['payload']['fields'][$image] = url('/api/media/99999');
        $this->putJson('/api/admin/cms/pages/'.$home->id, $v)->assertUnprocessable();
    }

    public function test_import_is_insert_only_and_preserves_existing_records(): void
    {
        $existing = CmsEntry::factory()->create(['slug' => 'global-trade', 'title' => 'Already edited']);
        $this->artisan('cms:import')->assertExitCode(0);
        $this->assertSame('Already edited', $existing->fresh()->title);
        $count = CmsEntry::count();
        $this->artisan('cms:import')->assertExitCode(0);
        $this->assertSame($count, CmsEntry::count());
        $this->assertSame(8, CmsEntry::where('kind', 'services')->count());
    }
}
