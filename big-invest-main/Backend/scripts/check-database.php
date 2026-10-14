<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$connection = config('database.default');
$settings = config("database.connections.$connection");
echo json_encode([
    'connection' => $connection,
    'host' => $settings['host'] ?? null,
    'port' => $settings['port'] ?? null,
    'database' => $settings['database'] ?? null,
    'pdo_mysql' => extension_loaded('pdo_mysql'),
], JSON_PRETTY_PRINT).PHP_EOL;

try {
    DB::connection()->getPdo();
    $result = DB::selectOne('SELECT 1 AS connected');
    echo 'Database connection: '.($result->connected === 1 ? 'OK' : 'unexpected result').PHP_EOL;
} catch (Throwable $exception) {
    // Avoid printing exception messages that may include connection credentials.
    echo 'Database connection: FAILED; SQLSTATE/code: '.$exception->getCode().PHP_EOL;
    echo 'Check DB_DATABASE, DB_USERNAME and DB_PASSWORD in .env, and provision the database/user.'.PHP_EOL;
    exit(1);
}
