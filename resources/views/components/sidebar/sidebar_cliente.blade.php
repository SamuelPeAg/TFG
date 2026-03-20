<link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">

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
        <div class="user-avatar" style="display: flex; align-items: center; justify-content: center;">
            @if(auth()->user()->foto_de_perfil)
                <img src="{{ asset('storage/' . auth()->user()->foto_de_perfil) }}" alt="Avatar"
                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <span style="display:none;">{{ substr(auth()->user()->name, 0, 1) }}</span>
            @else
                {{ substr(auth()->user()->name, 0, 1) }}
            @endif
        </div>
        <div class="user-info-text">
            <span class="name">{{ auth()->user()->name }}</span>
            <span class="role">Cliente</span>
        </div>
    </div>

    <nav class="main-menu">
        <a href="{{ route('cliente.dashboard') }}"
            class="menu-item {{ request()->routeIs('cliente.dashboard') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-alt"></i>
            <span>MIS CLASES</span>
        </a>

        {{-- Aquí se podrían añadir más rutas para el cliente si existieran (ej: Mis Pagos, Mis Planes) --}}
    </nav>

    <div class="sidebar-footer">

        <a href="{{ route('welcome') }}" class="menu-item">
            <i class="fa-solid fa-house"></i>
            <span>VOLVER</span>
        </a>

        <a href="{{ route('configuracion.edit') }}"
            class="menu-item {{ request()->routeIs('configuracion.edit') ? 'active' : '' }}">
            <i class="fa-solid fa-user-gear"></i>
            <span>MI PERFIL</span>
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item logout-btn"
            onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>SALIR</span>
        </a>
    </div>

</aside>

{{-- Script para toggle del menú --}}
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebarContainer');
        const overlay = document.getElementById('sidebarOverlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');

                const icon = this.querySelector('i');
                if (sidebar.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });

            menuToggle.addEventListener('touchstart', function (e) {
                e.preventDefault();
                this.click();
            }, { passive: false });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');

                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        }

        const menuItems = sidebar.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                if (window.innerWidth < 1024) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');

                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    });
</script>