<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dompetulun</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>
        (function() {
            try {
                var theme = JSON.parse(localStorage.getItem('theme'));
                if (theme) document.documentElement.classList.add('dark');
            } catch(e) {}
        })();
    </script>
    @inertiaHead
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="loading-screen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-surface transition-opacity duration-300">
        <div class="w-9 h-9 rounded-full border-[3px] border-border border-t-primary animate-spin"></div>
    </div>
    @inertia
</body>
</html>
