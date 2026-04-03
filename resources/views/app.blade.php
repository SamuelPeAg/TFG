<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factomove - Conecta tu movimiento</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Tailwind CDN para config rápida -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Tailwind Config -->
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brandTeal: '#4BB7AE',
              brandCoral: '#EF5D7A',
              brandAqua: '#A5EFE2',
              darkText: '#2D3748',
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
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
          'photo' => $user->foto_de_perfil ? asset('storage/' . $user->foto_de_perfil) : null
        ] : null) !!}
      };
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
