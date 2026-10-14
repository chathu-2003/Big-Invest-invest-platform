<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\NewsletterSubscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        if (DB::connection()->getDriverName() !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            throw new \RuntimeException('Admin tests require isolated SQLite memory storage.');
        }
        foreach (glob(database_path('migrations/*.php')) as $file) {
            (require $file)->up();
        }
    }

    private function admin(): User
    {
        $user = User::create(['name' => 'Test Admin', 'email' => 'admin@example.com', 'password' => 'Valid-test-password!23']);
        $user->is_admin = true;
        $user->save();

        return $user;
    }

    private function enquiry(string $status = 'new', string $name = 'Jane Doe'): Enquiry
    {
        $enquiry = Enquiry::create(['name' => $name, 'email' => 'jane@example.com', 'company' => 'Example Ltd', 'type' => 'partnership', 'message' => 'Please discuss a business partnership.', 'consented_at' => now()]);
        $enquiry->status = $status;
        $enquiry->save();

        return $enquiry;
    }

    public function test_all_private_endpoints_reject_guests(): void
    {
        foreach (['me', 'dashboard', 'enquiries', 'enquiries/1', 'subscribers', 'subscribers/export', 'enquiries/export'] as $path) {
            $this->getJson('/api/admin/'.$path)->assertUnauthorized();
        }
        $this->patchJson('/api/admin/enquiries/1', ['status' => 'closed'])->assertUnauthorized();
        $this->postJson('/api/admin/logout')->assertUnauthorized();
    }

    public function test_non_admin_is_forbidden_and_cannot_login_to_admin(): void
    {
        $user = User::create(['name' => 'Regular user', 'email' => 'regular@example.com', 'password' => 'Valid-test-password!23']);
        $this->postJson('/api/admin/login', ['email' => $user->email, 'password' => 'Valid-test-password!23'])->assertUnprocessable();
        $this->actingAs($user)->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/admin/subscribers/export')->assertForbidden();
        $this->postJson('/api/admin/register', [])->assertNotFound();
    }

    public function test_admin_login_me_and_logout(): void
    {
        $admin = $this->admin();
        $this->getJson('/api/admin/csrf')->assertOk()->assertJsonStructure(['data' => ['token']]);
        $this->postJson('/api/admin/login', ['email' => $admin->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/admin/login', ['email' => $admin->email, 'password' => 'Valid-test-password!23'])
            ->assertOk()->assertJsonPath('data.name', 'Test Admin')->assertJsonMissingPath('data.password');
        $this->assertAuthenticatedAs($admin);
        $this->getJson('/api/admin/me')->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $this->postJson('/api/admin/logout')->assertOk();
        $this->assertGuest();
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', ['email' => 'unknown@example.com', 'password' => 'wrong'])->assertUnprocessable();
        }
        $this->postJson('/api/admin/login', ['email' => 'unknown@example.com', 'password' => 'wrong'])->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_dashboard_metrics_are_real_and_date_filtered(): void
    {
        $this->actingAs($this->admin());
        $this->enquiry();
        $this->enquiry('in_progress');
        $old = $this->enquiry('closed');
        $old->created_at = now()->subDays(60);
        $old->save();
        NewsletterSubscription::create(['email' => 'subscriber@example.com', 'consented_at' => now()]);
        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.total_enquiries', 3)->assertJsonPath('data.new_enquiries', 1)
            ->assertJsonPath('data.newsletter_subscribers', 1)->assertJsonCount(2, 'data.work_queue')->assertJsonCount(4, 'data.recent_activity');
        $this->getJson('/api/admin/dashboard?from='.now()->subDays(30)->format('Y-m-d').'&to='.now()->format('Y-m-d'))
            ->assertOk()->assertJsonPath('data.total_enquiries', 2);
        $this->getJson('/api/admin/dashboard?from=invalid')->assertUnprocessable();
        $this->getJson('/api/admin/dashboard?to=2000-01-01')->assertOk()->assertJsonPath('data.total_enquiries', 0);
    }

    public function test_search_filters_pagination_details_and_status_updates(): void
    {
        $this->actingAs($this->admin());
        $enquiry = $this->enquiry('new', 'Alice');
        $this->enquiry('closed', 'Bob');
        $this->getJson('/api/admin/enquiries?q=Alice&status=new&type=partnership&per_page=1')->assertOk()->assertJsonPath('data.total', 1)->assertJsonPath('data.data.0.name', 'Alice');
        $this->getJson('/api/admin/enquiries?attention=1')->assertJsonPath('data.total', 1);
        $this->getJson('/api/admin/enquiries/'.$enquiry->id)->assertOk()->assertJsonPath('data.message', $enquiry->message);
        $this->patchJson('/api/admin/enquiries/'.$enquiry->id, ['status' => 'resolved', 'email' => 'tampered@example.com'])->assertOk()->assertJsonPath('data.status', 'resolved');
        $this->assertDatabaseHas('enquiries', ['id' => $enquiry->id, 'status' => 'resolved', 'email' => 'jane@example.com']);
        $this->patchJson('/api/admin/enquiries/'.$enquiry->id, ['status' => 'invented'])->assertUnprocessable();
        $this->getJson('/api/admin/enquiries?per_page=999')->assertUnprocessable();
    }

    public function test_subscriber_search_and_authorized_exports(): void
    {
        $this->actingAs($this->admin());
        NewsletterSubscription::create(['email' => 'reader@example.com', 'consented_at' => now()]);
        $this->enquiry('new', '=HYPERLINK("malicious")');
        $this->getJson('/api/admin/subscribers?q=reader')->assertOk()->assertJsonPath('data.total', 1);
        $this->getJson('/api/admin/subscribers/export')->assertOk()->assertDownload('big-invest-subscribers.csv');
        $response = $this->getJson('/api/admin/enquiries/export');
        $response->assertOk()->assertDownload('big-invest-enquiries.csv');
        $this->assertStringContainsString("'=HYPERLINK", $response->streamedContent());
    }
}
