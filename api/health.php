<?php
header('Content-Type: application/json');
echo json_encode([
    'php_version' => PHP_VERSION,
    'vercel' => getenv('VERCEL') ?: 'not set',
    'app_key' => getenv('APP_KEY') ? 'set: ' . substr(getenv('APP_KEY'), 0, 20) . '...' : 'NOT SET',
    'db_host' => getenv('DB_HOST') ?: 'NOT SET',
    'db_conn' => getenv('DB_CONNECTION') ?: 'NOT SET',
    'storage_path' => defined('PHP_WINDOWS_VERSION_MAJOR') ? 'windows' : (is_dir('/tmp/storage') ? '/tmp/storage exists' : '/tmp/storage missing'),
]);
