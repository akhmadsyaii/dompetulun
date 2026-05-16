<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector as BasePostgresConnector;

class PostgresConnector extends BasePostgresConnector
{
    protected function addSslOptions($dsn, array $config)
    {
        $dsn = parent::addSslOptions($dsn, $config);

        $options = $config['pgsql_options'] ?? '';

        if ($options) {
            $dsn .= ';options=' . $options;
        }

        return $dsn;
    }
}
