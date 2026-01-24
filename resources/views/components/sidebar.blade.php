<link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">
{{-- Estilos extra para el Scroll --}}
<style>
    /* Aseguramos que el sidebar ocupe toda la altura y use Flexbox */
    .sidebar-container {
        display: flex;
        flex-direction: column;
        height: 100vh; /* Altura completa de la ventana */
        max-height: 100vh;
        overflow: hidden; /* Evita scroll doble */
    }

    /* El menú principal crece para ocupar el espacio y hace scroll si es necesario */
    .main-menu {
        flex: 1;
        overflow-y: auto;
        padding-right: 5px; /* Espacio para que el scroll no pegue al texto */
        
        /* Estilizando la barra de scroll (Chrome/Safari/Edge) */
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: #cbd5e0 transparent; /* Firefox */
    }

    /* Webkit Scrollbar */
    .main-menu::-webkit-scrollbar {
        width: 6px;
    }
    .main-menu::-webkit-scrollbar-track {
        background: transparent;
    }
    .main-menu::-webkit-scrollbar-thumb {
        background-color: #cbd5e0;
        border-radius: 20px;
    }
    .main-menu::-webkit-scrollbar-thumb:hover {
        background-color: #38C1A3; /* Color corporativo al pasar el mouse */
    }

    /* El footer se queda fijo abajo */
    .sidebar-footer {
        flex-shrink: 0; /* No se encoge */
        padding-top: 15px;
        border-top: 1px solid rgba(0,0,0,0.05);
    }
</style>

{{-- Botón Hamburguesa (solo visible en móvil/tablet) --}}
<button class="menu-toggle" id="menuToggle" aria-label="Abrir menú">
    <i class="fa-solid fa-bars"></i>
</button>

{{-- Overlay oscuro (solo visible cuando sidebar está abierto en móvil) --}}
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<aside class="sidebar-container" id="sidebarContainer">
    
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

        {{-- NUEVO BOTÓN AÑADIDO: NÓMINAS --}}
        <a href="{{ route('nominas.index') }}" 
           class="menu-item {{ request()->routeIs('nominas.*') ? 'active' : '' }}">
            <i class="fa-solid fa-file-invoice-dollar"></i>
            <span>MIS NÓMINAS</span>
        </a>

        <a href="{{ route('admin.nominas') }}" 
   class="menu-item {{ request()->routeIs('admin.nominas') ? 'active' : '' }}">
    <i class="fa-solid fa-file-invoice-dollar"></i>
    <span>NÓMINAS-A</span>
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

{{-- Script para toggle del menú --}}
<script>
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebarContainer');
    const overlay = document.getElementById('sidebarOverlay');
    
    console.log('Sidebar script loaded');
    
    // Abrir/cerrar sidebar
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Cambiar icono
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // También añadir evento táctil para móviles
        menuToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    }
    
    // Cerrar al hacer click en overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            
            // Restaurar icono
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    }
    
    // Cerrar al hacer click en un enlace del menú (solo en móvil)
    const menuItems = sidebar.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth < 1024) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                
                // Restaurar icono
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
});
</script>