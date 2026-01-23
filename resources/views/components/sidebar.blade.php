<link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">

<aside class="sidebar-container">
    
    <div class="sidebar-logo">
        <a href="{{ route('welcome') }}">
            <img src="{{ asset('img/logopng.png') }}" alt="Logo Factomove">
            <h2>Factomove</h2>
        </a>
    </div>

    <div class="user-profile-card">
        <div class="user-avatar">
            {{ substr(auth()->user()->name, 0, 1) }}
        </div>
        <div class="user-info-text">
            <span class="name">{{ auth()->user()->name }}</span>
            <span class="role">Panel de Gestión</span>
        </div>
    </div>

    <nav class="main-menu">
        
        <a href="{{ route('entrenadores.index') }}" 
           class="menu-item {{ request()->routeIs('entrenadores.*') ? 'active' : '' }}">
            <i class="fa-solid fa-dumbbell"></i>
            <span>ENTRENADORES</span>
        </a>

        <a href="{{ route('users.index') }}" 
           class="menu-item {{ request()->routeIs('users.*') ? 'active' : '' }}">
            <i class="fa-solid fa-users"></i>
            <span>USUARIOS</span>
        </a>

        <a href="{{ route('Pagos') }}" 
           class="menu-item {{ request()->routeIs('Pagos') || request()->routeIs('Pagos.*') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-check"></i>
            <span>PAGOS</span>
        </a>

        <a href="{{ route('facturas') }}" 
           class="menu-item {{ request()->routeIs('facturas') ? 'active' : '' }}">
            <i class="fa-solid fa-file-invoice"></i>
            <span>FACTURACIÓN</span>
        </a>

    </nav>

    <div class="sidebar-footer">
        
        <a href="{{ route('configuracion.edit') }}" 
           class="menu-item {{ request()->routeIs('configuracion.*') ? 'active' : '' }}">
            <i class="fa-solid fa-gear"></i>
            <span>CONFIGURACIÓN</span>
        </a>

        <a href="{{ route('welcome') }}" class="menu-item">
            <i class="fa-solid fa-house"></i>
            <span>VOLVER</span>
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item logout-btn" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>SALIR</span>
        </a>
    </div>

</aside>