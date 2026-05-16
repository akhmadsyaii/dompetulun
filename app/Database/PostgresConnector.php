<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector as BasePostgresConnector;

class PostgresConnector extends BasePostgresConnector
{
    protected function getDsn(array $config)
    {
        $dsn = parent::getDsn($config);

        $host = $config['host'] ?? '';
        if ($host && !str_contains($host, '-pooler')) {
            $parts = explode('.', $host);
            $endpointId = $parts[0];
            $dsn .= ";options=endpoint={$endpointId}";
        }

        return $dsn;
    }
}
