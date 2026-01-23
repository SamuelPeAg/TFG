<link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">

<aside class="sidebar-container">
    
    {{-- LOGO CENTRADO --}}
    <div class="sidebar-logo">
        <a href="{{ route('welcome') }}">
            <img src="{{ asset('img/logopng.png') }}" alt="Logo Factomove">
            <h2>Factomove</h2>
        </a>
    </div>

    {{-- TARJETA DE USUARIO --}}
    <div class="user-profile-card">
        <div class="user-avatar">
            {{-- Primera letra del nombre --}}
            {{ substr(auth()->user()->name, 0, 1) }}
        </div>
        <div class="user-info-text">
            <span class="name">{{ auth()->user()->name }}</span>
            <span class="role">Panel de Gestión</span>
        </div>
    </div>

    {{-- MENÚ DE NAVEGACIÓN --}}
    <nav class="main-menu">
        
        {{-- Entrenadores --}}
        <a href="{{ route('entrenadores.index') }}" 
           class="menu-item {{ request()->routeIs('entrenadores.*') ? 'active' : '' }}">
            <i class="fa-solid fa-dumbbell"></i>
            <span>ENTRENADORES</span>
        </a>

        {{-- Usuarios --}}
        <a href="{{ route('users.index') }}" 
           class="menu-item {{ request()->routeIs('users.*') ? 'active' : '' }}">
            <i class="fa-solid fa-users"></i>
            <span>USUARIOS</span>
        </a>

        {{-- Pagos --}}
        <a href="{{ route('Pagos') }}" 
           class="menu-item {{ request()->routeIs('Pagos') || request()->routeIs('Pagos.*') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-check"></i>
            <span>PAGOS</span>
        </a>

        {{-- Facturación --}}
        <a href="{{ route('facturas') }}" 
           class="menu-item {{ request()->routeIs('facturas') ? 'active' : '' }}">
            <i class="fa-solid fa-file-invoice"></i>
            <span>FACTURACIÓN</span>
        </a>

    </nav>

    {{-- FOOTER (Configuración y Salir) --}}
    <div class="sidebar-footer">
        
        <a href="{{ route('configuracion.edit') }}" 
           class="menu-item {{ request()->routeIs('configuracion.*') ? 'active' : '' }}">
            <i class="fa-solid fa-gear"></i>
            <span>CONFIGURACIÓN</span>
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item logout-btn" onclick="event.preventDefault(); openLogoutModal()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>SALIR</span>
        </a>
    </div>

</aside>

{{-- MODAL LOGOUT --}}
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

{{-- SCRIPT PARA EL MODAL --}}
<script>
    function openLogoutModal() {
        document.getElementById('customLogoutModal').style.display = 'flex';
    }

    function closeLogoutModal() {
        document.getElementById('customLogoutModal').style.display = 'none';
    }

    // Cerrar modal si se hace clic fuera de la caja
    window.onclick = function(event) {
        const modal = document.getElementById('customLogoutModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
</script>