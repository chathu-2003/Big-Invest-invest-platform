<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (config('database.default') !== 'mysql' || DB::connection()->getDatabaseName() !== 'big_invest_db') {
    fwrite(STDERR, 'Expected the configured big_invest_db MySQL database.');
    exit(1);
}
$email = $argv[2] ?? '';
if (! preg_match('/^integration-[a-f0-9]{16}@example\.com$/', $email)) {
    exit(1);
}
try {
    $result = [];
    foreach (['enquiries', 'newsletter_subscriptions'] as $table) {
        $query = DB::table($table)->where('email', $email);
        $result[$table] = $query->count();
        if (($argv[1] ?? '') === 'cleanup') {
            $query->delete();
        }
    }
    echo json_encode($result);
} catch (Throwable $error) {
    fwrite(STDERR, 'Integration database check failed.');
    exit(1);
}
