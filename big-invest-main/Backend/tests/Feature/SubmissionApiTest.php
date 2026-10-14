<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\NewsletterSubscription;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SubmissionApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Only create our tables in the isolated in-memory test database.
        if (DB::connection()->getDriverName() !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            throw new \RuntimeException('These tests require isolated SQLite memory storage.');
        }
        foreach ([database_path('migrations/2026_10_13_000001_create_enquiries_table.php'), database_path('migrations/2026_10_13_000002_create_newsletter_subscriptions_table.php')] as $file) {
            (require $file)->up();
        }
    }

    private function enquiry(array $overrides = []): array
    {
        return array_replace([
            'name' => ' Jane Doe ', 'email' => 'jane@example.com', 'phone' => '+94 (77) 123-4567',
            'company' => ' Example Ltd ', 'type' => 'partnership',
            'message' => 'We would like to discuss a sourcing partnership.', 'consent' => true,
        ], $overrides);
    }

    public function test_enquiry_is_persisted_with_server_owned_status_and_minimal_response(): void
    {
        $this->postJson('/api/enquiries', $this->enquiry(['status' => 'closed', 'consented_at' => '2000-01-01']))
            ->assertCreated()->assertJsonPath('success', true)->assertJsonPath('data.status', 'new')
            ->assertJsonMissingPath('data.email')->assertJsonMissingPath('data.message');
        $this->assertDatabaseHas('enquiries', ['name' => 'Jane Doe', 'company' => 'Example Ltd', 'status' => 'new']);
        $this->assertNotNull(Enquiry::first()->consented_at);
    }

    public function test_all_existing_enquiry_types_are_valid(): void
    {
        foreach (Enquiry::TYPES as $index => $type) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.($index + 1)])
                ->postJson('/api/enquiries', $this->enquiry(['type' => $type, 'phone' => '']))->assertCreated();
        }
        $this->assertDatabaseCount('enquiries', 9);
    }

    public function test_invalid_enquiry_does_not_persist(): void
    {
        $this->postJson('/api/enquiries', $this->enquiry([
            'name' => 'x', 'email' => 'invalid', 'phone' => '123abc', 'company' => 'x',
            'type' => 'unknown', 'message' => 'short', 'consent' => false,
        ]))->assertUnprocessable()->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['name', 'email', 'phone', 'company', 'type', 'message', 'consent']);
        $this->assertDatabaseCount('enquiries', 0);
    }

    public function test_enquiry_length_and_phone_limits(): void
    {
        foreach (['123456', '1234567890123456', '+94ABC1234567'] as $phone) {
            $this->postJson('/api/enquiries', $this->enquiry(['phone' => $phone]))
                ->assertUnprocessable()->assertJsonValidationErrors('phone');
        }
        $this->postJson('/api/enquiries', $this->enquiry(['message' => str_repeat('x', 1001), 'name' => str_repeat('x', 256)]))
            ->assertUnprocessable()->assertJsonValidationErrors(['message', 'name']);
    }

    public function test_newsletter_is_normalized_and_repeated_requests_are_idempotent(): void
    {
        $first = $this->postJson('/api/newsletter/subscribe', ['email' => ' Test@Example.com ', 'consent' => true]);
        $first->assertOk()->assertJsonPath('success', true);
        $consent = NewsletterSubscription::first()->consented_at;
        $again = $this->postJson('/api/newsletter/subscribe', ['email' => 'test@example.com', 'consent' => true]);
        $again->assertOk()->assertExactJson($first->json());
        $this->assertDatabaseCount('newsletter_subscriptions', 1);
        $this->assertDatabaseHas('newsletter_subscriptions', ['email' => 'test@example.com']);
        $this->assertEquals($consent, NewsletterSubscription::first()->consented_at);
    }

    public function test_invalid_newsletter_email_and_missing_consent_are_rejected(): void
    {
        $this->postJson('/api/newsletter/subscribe', ['email' => 'invalid', 'consent' => true])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/newsletter/subscribe', ['email' => 'test@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('consent');
        $this->assertDatabaseCount('newsletter_subscriptions', 0);
    }

    public function test_both_endpoints_limit_attempts_and_keep_retry_header(): void
    {
        foreach (['/api/enquiries', '/api/newsletter/subscribe'] as $endpoint) {
            for ($i = 0; $i < 5; $i++) {
                $this->postJson($endpoint, [])->assertUnprocessable();
            }
            $this->postJson($endpoint, [])->assertStatus(429)->assertJsonPath('success', false)
                ->assertHeader('Retry-After');
        }
    }

    public function test_public_enquiry_reads_are_unavailable(): void
    {
        $this->getJson('/api/enquiries')->assertStatus(405);
        $this->getJson('/api/enquiries/1')->assertNotFound();
    }

    public function test_cors_preflight_allows_actual_submission_endpoint(): void
    {
        $this->withHeaders(['Origin' => 'http://localhost:5173', 'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'content-type'])->options('/api/newsletter/subscribe')
            ->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
