<style>
  :root {
        --primary-color: #4BB7AE; /* Turquesa */
        --primary-dark: #EF5D7A;  /* Rojo/Rosa */
        --accent-color: #A5EFE2;  /* Aqua claro */
    }

    /* CONTENEDOR PRINCIPAL */
    .sidebar-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 260px;
        background: linear-gradient(180deg, var(--primary-color) 0%, #34495e 100%);
        padding: 30px 15px;
        color: white;
        position: fixed;
        left: 0;
        top: 0;
        box-shadow: 4px 0 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    /* LOGO */
    .sidebar-logo {
        text-align: center;
        margin-bottom: 25px;
    }

    .sidebar-logo img {
        width: 75px;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }

    .sidebar-logo h2 {
        font-size: 2rem;
        font-weight: 900;
        margin-top: 10px;
        letter-spacing: 1px;
        color: #fff;
    }

    /* PERFIL USUARIO */
    .user-profile-card {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(5px);
        border-radius: 15px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
        width: 42px;
        height: 42px;
        background-color: white;
        color: var(--primary-color);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.2rem;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        flex-shrink: 0;
    }

    .user-info-text {
        overflow: hidden;
    }

    .user-info-text .name {
        font-weight: 700;
        font-size: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        display: block;
    }

    .user-info-text .role {
        font-size: 0.75rem;
        color: var(--accent-color);
        font-weight: 600;
        text-transform: uppercase;
        opacity: 1;
    }

    /* MENÚ */
    .main-menu {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 18px;
        border-radius: 12px;
        text-decoration: none;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .menu-item i {
        font-size: 1.1rem;
        width: 20px;
        text-align: center;
    }

    .menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(5px);
        color: white;
    }

    .menu-item.active {
        background-color: white;
        color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    /* FOOTER */
    .sidebar-footer {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 25px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .logout-btn {
        color: var(--primary-dark) !important;
    }

    .logout-btn:hover {
        background: rgba(239, 93, 122, 0.1) !important;
    }

    /* MODAL */
    .modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 10000;
        align-items: center;
        justify-content: center;
    }

    .modal-box {
        background: white;
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        max-width: 380px;
        width: 90%;
        box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    }

    .modal-title {
        font-weight: 800;
        font-size: 1.4rem;
        color: #333;
        margin-bottom: 10px;
    }

    .modal-text {
        color: #666;
        margin-bottom: 25px;
        font-size: 0.95rem;
    }

    .modal-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
    }

    .btn-modal {
        padding: 10px 25px;
        border-radius: 10px;
        border: none;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s;
    }

    .btn-confirm {
        background: var(--primary-color);
        color: white;
    }

    .btn-cancel {
        background: #eee;
        color: #555;
    }

    .btn-modal:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
</style>

<aside class="sidebar-container">
    <div class="sidebar-logo">
        <a href="{{ route('welcome') }}" style="text-decoration: none; color: white;">
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

<div id="customLogoutModal" class="modal-overlay">
    <div class="modal-box">
        <div style="color: #333; font-size: 20px; font-weight: bold; margin-bottom: 10px;">Cerrar Sesión</div>
        <div style="color: #666; font-size: 14px; margin-bottom: 25px;">¿Estás seguro de que quieres salir de Factomove?</div>
        <div style="display: flex; justify-content: center; gap: 15px;">
            <button class="btn-modal btn-cancel" onclick="closeLogoutModal()">Cancelar</button>
            <button class="btn-modal btn-confirm" onclick="document.getElementById('logout-form').submit()">Sí, salir</button>
        </div>
    </div>
</div>

<script>
    function openLogoutModal() { document.getElementById('customLogoutModal').style.display = 'flex'; }
    function closeLogoutModal() { document.getElementById('customLogoutModal').style.display = 'none'; }
    window.onclick = function(event) {
        var modal = document.getElementById('customLogoutModal');
        if (event.target == modal) { modal.style.display = "none"; }
    }
</script>