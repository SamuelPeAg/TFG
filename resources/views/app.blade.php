<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ config('branding.name', 'Factomove') }} - Conecta tu movimiento</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Favicon dinámico -->
    <link rel="icon" type="image/x-icon" href="{{ asset(config('branding.logos.favicon', '/favicon.ico')) }}">
    
    <!-- Fuentes Google Fonts Dinámicas en Caliente -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family={{ urlencode(config('branding.typography.font_family', 'Outfit')) }}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CDN para config rápida -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Tailwind Config Dinámica -->
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brandTeal: '{{ config("branding.colors.primary", "#4BB7AE") }}',
              brandCoral: '{{ config("branding.colors.secondary", "#EF5D7A") }}',
              brandAqua: '{{ config("branding.colors.accent", "#A5EFE2") }}',
              brandPrimary: '{{ config("branding.colors.primary", "#4BB7AE") }}',
              brandSecondary: '{{ config("branding.colors.secondary", "#EF5D7A") }}',
              brandAccent: '{{ config("branding.colors.accent", "#A5EFE2") }}',
              darkText: '#2D3748',
            },
            fontFamily: {
              sans: ['{{ config("branding.typography.font_family", "Outfit") }}', 'sans-serif'],
            }
          }
        }
      }
    </script>

    <!-- Dark mode script -->
    <script>
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    </script>

    <!-- Vite entry point -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])

    @php
      $user = null;
      $role = null;
      if (Auth::guard('staff')->check()) {
        $user = Auth::guard('staff')->user();
        $role = $user->hasRole('admin') ? 'admin' : 'entrenador';
      } elseif (Auth::guard('web')->check()) {
        $user = Auth::guard('web')->user();
        $role = 'cliente';
      }
    @endphp

    <script>
      window.AppConfig = {
        baseUrl: '{{ asset("/") }}',
        user: {!! json_encode($user ? [
          'id' => $user->id,
          'name' => $user->name,
          'role' => $role,
          'photo' => $user->photo,
          'permissions' => ($role === 'admin') ? ['*'] : (($user && method_exists($user, 'getAllPermissions')) ? $user->getAllPermissions()->pluck('name')->toArray() : [])
        ] : null) !!},
        modules: {!! json_encode([
          'nutrition' => config('modules.nutrition', true),
          'payroll' => config('modules.payroll', true),
          'vacations' => config('modules.vacations', true),
          'statistics' => config('modules.statistics', true),
          'booking_swap' => config('modules.booking_swap', true),
        ]) !!},
        branding: {!! json_encode(config('branding')) !!},
        flash: {
          error: '{{ session("error") }}',
          success: '{{ session("success") }}'
        }
      };
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
