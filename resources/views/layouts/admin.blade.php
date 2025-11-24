<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factomove | @yield('title')</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}"> 
</head>
<body>

<div class="dashboard-container">
    
    <aside class="sidebar">
        <div class="logo">
            <i class="fa-solid fa-money-bill-transfer"></i> 
            <h2>Factomove</h2>
        </div>
        <nav class="main-menu">
            <a href="#" class="menu-item {{ request()->is('usuarios*') ? 'active' : '' }}">
                <i class="fa-solid fa-users"></i> USUARIOS
            </a>
            <a href="#" class="menu-item {{ request()->is('entrenadores*') ? 'active' : '' }}">
                <i class="fa-solid fa-dumbbell"></i> ENTRENADORES
            </a>
            <a href="#" class="menu-item {{ request()->is('facturacion*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-invoice"></i> FACTURACIÓN
            </a>
            <a href="#" class="menu-item {{ request()->is('precios*') ? 'active' : '' }}">
                <i class="fa-solid fa-tags"></i> PRECIOS
            </a>
            <a href="#" class="menu-item {{ request()->is('pago*') ? 'active' : '' }}">
                <i class="fa-solid fa-credit-card"></i> PAGO
            </a>
            <a href="#" class="menu-item {{ request()->is('horarios*') ? 'active' : '' }}">
                <i class="fa-solid fa-clock"></i> HORARIOS
            </a>
            
            <a href="{{ route('sesiones.index') }}" class="menu-item {{ request()->routeIs('sesiones.*') ? 'active' : '' }}">
                <i class="fa-solid fa-calendar-check"></i> SESIONES
            </a>
        </nav>
        <div class="utility-links">
             <a href="#" class="menu-item"><i class="fa-solid fa-comment-dots"></i> MESSAGES</a>
             <a href="#" class="menu-item"><i class="fa-solid fa-gear"></i> HELP CENTRE</a>
        </div>
    </aside>

    <main class="main-content">
        @yield('content')
    </main>

</div>

<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="{{ asset('js/sesiones.js') }}"></script>

@stack('scripts')

</body>
</html>