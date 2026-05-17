<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

if (isset($_ENV['VERCEL']) || getenv('VERCEL')) {
    $cacheDir = '/tmp/storage/bootstrap/cache';
    $dirs = [
        $cacheDir,
        '/tmp/storage/framework/views',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/logs',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
    foreach (['packages.php', 'services.php'] as $file) {
        $src = __DIR__.'/../bootstrap/cache/'.$file;
        $dst = $cacheDir.'/'.$file;
        if (file_exists($src) && !file_exists($dst)) {
            @copy($src, $dst);
        }
    }
    putenv('APP_PACKAGES_CACHE='.$cacheDir.'/packages.php');
    putenv('APP_SERVICES_CACHE='.$cacheDir.'/services.php');
}

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

if (isset($_ENV['VERCEL']) || getenv('VERCEL')) {
    $app->useStoragePath('/tmp/storage');
}

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();

$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
