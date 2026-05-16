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
        if (str_contains($host, '.supabase.co')) {
            preg_match('/db\.(.+?)\.supabase\.co/', $host, $m);
            $ref = $m[1] ?? '';
            $region = $config['supabase_region'] ?? 'ap-southeast-1';
            if ($ref) {
                $config['host'] = "aws-0-{$region}.pooler.supabase.com";
                $config['port'] = '6543';
                if (!str_contains($config['username'] ?? '', '.')) {
                    $config['username'] = $config['username'] . '.' . $ref;
                }
            }
        } elseif ($host && !filter_var($host, FILTER_VALIDATE_IP)) {
            $records = dns_get_record($host, DNS_A);
            if (!empty($records)) {
                $config['host'] = $records[0]['ip'];
            }
        }

        return parent::getDsn($config);
    }
}
