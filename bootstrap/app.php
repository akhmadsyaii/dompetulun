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
        $middleware->trustProxies(at: '*');

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
        //
    })->create();
