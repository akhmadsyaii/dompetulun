<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector as BasePostgresConnector;

class PostgresConnector extends BasePostgresConnector
{
    protected function addSslOptions($dsn, array $config)
    {
        $dsn = parent::addSslOptions($dsn, $config);

        $options = $config['pgsql_options'] ?? '';

        if (empty($options)) {
            $host = $config['host'] ?? '';
            if ($host) {
                $endpointId = explode('.', $host)[0];
                $options = 'endpoint%3D' . $endpointId;
            }
        }

        if ($options) {
            $dsn .= ';options=' . $options;
        }

        return $dsn;
    }
}
