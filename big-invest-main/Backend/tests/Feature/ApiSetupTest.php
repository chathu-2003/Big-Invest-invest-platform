<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ApiSetupTest extends TestCase
{
    public function test_health_is_json_without_database_access(): void
    {
        $this->get('/api/health')->assertOk()->assertExactJson([
            'success' => true,
            'message' => 'API is healthy.',
            'data' => ['status' => 'ok'],
        ]);
    }

    public function test_unknown_api_route_returns_json_without_accept_header(): void
    {
        $this->get('/api/missing')->assertNotFound()->assertJsonPath('success', false);
    }

    public function test_validation_errors_preserve_field_messages(): void
    {
        Route::post('/api/test-validation', function () {
            throw ValidationException::withMessages(['email' => ['An email address is required.']]);
        });

        $this->post('/api/test-validation')->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.email.0', 'An email address is required.');
    }

    public function test_server_errors_do_not_expose_internal_details(): void
    {
        Route::get('/api/test-error', function () {
            throw new \RuntimeException('Sensitive internal detail');
        });

        $this->get('/api/test-error')->assertStatus(500)->assertExactJson([
            'success' => false,
            'message' => 'An internal server error occurred.',
            'errors' => [],
        ]);
    }

    public function test_react_preflight_is_allowed(): void
    {
        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'content-type',
        ])->options('/api/health')->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }

    public function test_unlisted_origin_is_not_allowed(): void
    {
        $this->withHeader('Origin', 'https://unlisted.example')->get('/api/health')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
