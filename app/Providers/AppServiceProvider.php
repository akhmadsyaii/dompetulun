<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (isset($_ENV['VERCEL']) || getenv('VERCEL')) {
            $this->app->useStoragePath('/tmp/storage');
            $dirs = [
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
            config([
                'view.compiled' => storage_path('framework/views'),
                'logging.channels.single.path' => storage_path('logs/laravel.log'),
            ]);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (isset($_ENV['VERCEL']) || getenv('VERCEL')) {
            $dirs = [
                storage_path('framework/views'),
                storage_path('framework/cache/data'),
                storage_path('framework/sessions'),
                storage_path('logs'),
            ];
            foreach ($dirs as $dir) {
                if (!is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
            }
        }
    }
}
