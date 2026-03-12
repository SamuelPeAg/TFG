<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Mi Aplicación React</title>

        <!-- Fonts y Iconos -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

        <!-- Pasamos el usuario y sus roles a React -->
        <script>
            window.FactomoveUser = {!! json_encode(auth()->check() ? auth()->user()->load('roles') : null) !!};
        </script>

        <!-- Scripts Tailwind & React -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/main.jsx'])
    </head>
    <body class="font-sans antialiased text-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div id="root"></div>
    </body>
</html>
