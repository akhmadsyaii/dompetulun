<?php
header('Content-Type: application/json');

$result = [
    'php_version' => PHP_VERSION,
    'vercel' => getenv('VERCEL') ?: 'not set',
    'app_key' => getenv('APP_KEY') ? 'set' : 'NOT SET',
    'db_host' => getenv('DB_HOST') ?: 'NOT SET',
    'db_conn' => getenv('DB_CONNECTION') ?: 'NOT SET',
    'storage_tmp' => is_dir('/tmp') ? 'exists' : 'missing',
    'storage_tmp_writable' => is_writable('/tmp') ? 'yes' : 'no',
];

// Test database connection
if (extension_loaded('pdo_pgsql')) {
    try {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            getenv('DB_HOST'),
            getenv('DB_PORT') ?: '5432',
            getenv('DB_DATABASE') ?: 'postgres'
        );
        $pdo = new PDO($dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $result['db_connection'] = 'OK';
        $result['db_version'] = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    } catch (Exception $e) {
        $result['db_connection'] = 'FAILED';
        $result['db_error'] = $e->getMessage();
    }
} else {
    $result['db_connection'] = 'pdo_pgsql NOT INSTALLED';
}

echo json_encode($result, JSON_PRETTY_PRINT);
