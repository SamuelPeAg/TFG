<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factomove - Conecta tu movimiento</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

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
