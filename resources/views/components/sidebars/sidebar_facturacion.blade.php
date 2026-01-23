<link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">

<aside class="sidebar-container">
    {{-- LOGO --}}
    <div class="sidebar-logo">
        <a href="{{ route('welcome') }}" style="text-decoration: none; color: white;">
            <img src="{{ asset('img/logopng.png') }}" alt="Logo Factomove">
            <h2>Factomove</h2>
        </a>
    </div>

    {{-- PERFIL DE USUARIO --}}
    <div class="user-profile-card">
        <div class="user-avatar">
            {{ substr(auth()->user()->name, 0, 1) }}
        </div>
        <div class="user-info-text">
            <span class="name">{{ auth()->user()->name }}</span>
            <span class="role">Panel de Gestión</span>
        </div>
    </div>

    {{-- MENÚ PRINCIPAL --}}
    <nav class="main-menu">
        <a href="{{ route('entrenadores.index') }}" class="menu-item {{ request()->routeIs('entrenadores.*') ? 'active' : '' }}">
            <i class="fa-solid fa-dumbbell"></i> ENTRENADORES
        </a>
        <a href="{{ route('users.index') }}" class="menu-item {{ request()->routeIs('users.*') ? 'active' : '' }}">
            <i class="fa-solid fa-users"></i> USUARIOS
        </a>
        <a href="{{ route('Pagos') }}" class="menu-item {{ request()->routeIs('Pagos') || request()->routeIs('Pagos.*') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-check"></i> PAGOS
        </a>
        <a href="{{ route('facturas') }}" class="menu-item {{ request()->routeIs('facturas') ? 'active' : '' }}">
            <i class="fa-solid fa-file-invoice"></i> FACTURACIÓN
        </a>
    </nav>

    {{-- FOOTER (Configuración y Salir) --}}
    <div class="sidebar-footer">
        <a href="{{ route('configuracion.edit') }}" class="menu-item {{ request()->routeIs('configuracion.*') ? 'active' : '' }}">
            <i class="fa-solid fa-gear"></i> CONFIGURACIÓN
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item logout-btn" onclick="event.preventDefault(); openLogoutModal()">
            <i class="fa-solid fa-right-from-bracket"></i> SALIR
        </a>
    </div>
</aside>

{{-- MODAL DE CIERRE DE SESIÓN --}}
<div id="customLogoutModal" class="modal-overlay">
    <div class="modal-box">
        <div class="modal-title">Cerrar Sesión</div>
        <div class="modal-text">¿Estás seguro de que quieres salir de Factomove?</div>
        <div class="modal-actions">
            <button class="btn-modal btn-cancel" onclick="closeLogoutModal()">Cancelar</button>
            <button class="btn-modal btn-confirm" onclick="document.getElementById('logout-form').submit()">Sí, salir</button>
        </div>
    </div>
</div>

{{-- SCRIPT --}}
{{-- Asegúrate de que public/js/sidebar.js exista. Si no, copia el script abajo --}}
<script src="{{ asset('js/sidebar.js') }}"></script>