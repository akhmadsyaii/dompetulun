<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();

if ($request->get('token') !== 'migrate-iam-super-secret-2026') {
    $response = response('<h1>401 Unauthorized</h1>', 401);
    $response->send();
    $kernel->terminate($request, $response);
    exit;
}

try {
    $app->make('Illuminate\Contracts\Console\Kernel')->call('migrate', ['--force' => true]);
    $output = $app->make('Illuminate\Contracts\Console\Kernel')->output();
    $response = response('<h1>Migration OK</h1><pre>' . htmlspecialchars($output) . '</pre>');
} catch (\Exception $e) {
    $response = response('<h1>Migration FAILED</h1><pre>' . htmlspecialchars($e->getMessage()) . '</pre>', 500);
}

$response->send();
$kernel->terminate($request, $response);
