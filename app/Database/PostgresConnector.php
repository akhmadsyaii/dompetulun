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

    protected function getDsn(array $config)
    {
        $host = $config['host'] ?? '';
        if ($host && !filter_var($host, FILTER_VALIDATE_IP)) {
            $ipv4 = $this->resolveIpv4($host);
            if ($ipv4) {
                $config['host'] = $ipv4;
            }
        }

        return parent::getDsn($config);
    }

    private function resolveIpv4(string $host): ?string
    {
        $records = dns_get_record($host, DNS_A);
        if (!empty($records)) {
            return $records[0]['ip'];
        }
        return null;
    }
}
