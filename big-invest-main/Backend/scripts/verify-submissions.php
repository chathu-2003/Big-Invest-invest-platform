<?php

// Real MySQL API integration probe. All test writes are rolled back; no table is dropped.
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
if (config('database.default') !== 'mysql' || DB::connection()->getDatabaseName() !== 'big_invest_db') {
    throw new RuntimeException('Expected the configured big_invest_db MySQL database.');
}
foreach (['enquiries', 'newsletter_subscriptions'] as $table) {
    if (! Schema::hasTable($table)) {
        throw new RuntimeException('Required table is missing.');
    }
    echo $table.': '.implode(', ', Schema::getColumnListing($table)).PHP_EOL;
}
// Use process-local throttling for the probe; production limiter/cache configuration is unchanged.
config(['cache.default' => 'array']);
$email = 'verification-'.bin2hex(random_bytes(8)).'@example.com';
$post = function (string $path, array $payload, int $expected) use ($kernel): array {
    $request = Request::create($path, 'POST', [], [], [], [
        'CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '192.0.2.240',
    ], json_encode($payload));
    $response = $kernel->handle($request);
    if ($response->getStatusCode() !== $expected) {
        throw new RuntimeException('Unexpected status for '.$path.': '.$response->getStatusCode());
    }
    echo $path.': HTTP '.$expected.PHP_EOL;

    return json_decode($response->getContent(), true, flags: JSON_THROW_ON_ERROR);
};
DB::beginTransaction();
try {
    $result = $post('/api/enquiries', ['name' => 'Verification Test', 'email' => $email, 'company' => 'Verification Ltd',
        'type' => 'general', 'message' => 'A transactional verification of enquiry persistence.', 'consent' => true], 201);
    if (! DB::table('enquiries')->where('id', $result['data']['id'])->where('email', $email)->where('status', 'new')->exists()) {
        throw new RuntimeException('Enquiry persistence failed.');
    }
    $post('/api/enquiries', [], 422);
    $first = $post('/api/newsletter/subscribe', ['email' => $email, 'consent' => true], 200);
    $again = $post('/api/newsletter/subscribe', ['email' => strtoupper($email), 'consent' => true], 200);
    if ($first !== $again || DB::table('newsletter_subscriptions')->where('email', $email)->count() !== 1) {
        throw new RuntimeException('Newsletter deduplication failed.');
    }
    $post('/api/newsletter/subscribe', ['email' => 'invalid', 'consent' => true], 422);
    foreach (['/api/enquiries' => 2, '/api/newsletter/subscribe' => 3] as $path => $attempts) {
        for ($i = $attempts; $i < 5; $i++) {
            $post($path, [], 422);
        }
        $post($path, [], 429);
    }
    echo 'MySQL persistence and duplicate checks: PASS'.PHP_EOL;
} finally {
    DB::rollBack();
    echo 'Verification writes rolled back; existing records retained.'.PHP_EOL;
}
