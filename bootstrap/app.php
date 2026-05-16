<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Routing\Middleware\ThrottleRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            SecurityHeaders::class,
        ]);

        $middleware->api(prepend: [
            ThrottleRequests::class.':120,1',
        ]);

        $middleware->alias([
            'throttle.api' => ThrottleRequests::class.':120,1',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            return new \Symfony\Component\HttpFoundation\Response(
                "ORIGINAL ERROR: " . $e->getMessage() . "\nFile: " . $e->getFile() . ":" . $e->getLine() . "\nType: " . get_class($e) . "\n\n" . $e->getTraceAsString() . "\n",
                500,
                ['Content-Type' => 'text/plain']
            );
        });
    })->create();
