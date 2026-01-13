<style>
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        align-items: center; justify-content: center;
    }
    .modal-box {
        background-color: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        width: 90%; max-width: 400px;
        text-align: center;
        font-family: sans-serif; /* O la fuente que use tu web */
    }
    .modal-title { color: #333; font-size: 20px; margin-bottom: 10px; font-weight: bold; }
    .modal-text { color: #666; margin-bottom: 25px; font-size: 14px; }
    .modal-actions { display: flex; justify-content: center; gap: 15px; }
    .btn-modal { padding: 10px 20px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
    .btn-cancel { background-color: #e0e0e0; color: #333; }
    .btn-confirm { background-color: #00897b; color: white; } /* Tu color verde */
    .btn-modal:hover { opacity: 0.8; }
</style>

<aside class="sidebar" style="display: flex; flex-direction: column; height: 100vh;">
    <div class="logo">
        <a href="{{ route('welcome') }}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; width: 100%;">
            <img src="{{ asset('img/logopng.png') }}" alt="">
            <h2>Factomove</h2>
        </a>
    </div>

    <nav class="main-menu">
        <a href="{{ route("entrenadores.index") }}"  class="menu-item {{ request()->routeIs('entrenadores.*') ? 'active' : '' }}">
            <i class="fa-solid fa-dumbbell"></i> ENTRENADORES
        </a>
        <a href="{{ route("users.index") }}" class="menu-item {{ request()->routeIs('users.*') ? 'active' : '' }}">
            <i class="fa-solid fa-users"></i> USUARIOS
        </a>
        <a href="{{ route("sesiones") }}" class="menu-item {{ request()->routeIs('sesiones') || request()->routeIs('sesiones.*') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-check"></i> SESIONES
        </a>
        <a href="{{ route("facturas")}}" class="menu-item {{ request()->routeIs('facturas') ? 'active' : '' }}">
            <i class="fa-solid fa-file-invoice"></i> FACTURACIÓN
        </a>
    </nav>

    <div style="flex-grow: 1;"></div>

    <div style="display: flex; align-items: center; justify-content: flex-start; padding: 0 20px; gap: 10px; margin-bottom: 15px;">
        
        <div style="width: 40px; height: 40px; background-color: #ffffff; color: #00897b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0;">
            {{ substr(auth()->user()->name, 0, 1) }}
        </div>

        <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.3;">
            <span style="font-weight: 700; color: #ffffff; font-size: 14px;">
                {{ auth()->user()->name }}
            </span>
            <span style="font-size: 11px; color: #e0f2f1; opacity: 0.8;">
                Panel de Gestión
            </span>
        </div>
        
    </div>

    <div class="utility-links" style="margin-bottom: 20px;">
        
        {{-- CONFIGURACIÓN --}}
        <a href="{{ route('configuracion.edit') }}" class="menu-item {{ request()->routeIs('configuracion.*') ? 'active' : '' }}">
            <i class="fa-solid fa-gear"></i> CONFIGURACIÓN
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item" onclick="event.preventDefault(); openLogoutModal()">
            <i class="fa-solid fa-right-from-bracket"></i> SALIR
        </a>
        
    </div>

</aside>

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

<script>
    function openLogoutModal() {
        document.getElementById('customLogoutModal').style.display = 'flex';
    }

    function closeLogoutModal() {
        document.getElementById('customLogoutModal').style.display = 'none';
    }

    // Cierra el modal si clickan fuera de la cajita blanca
    window.onclick = function(event) {
        var modal = document.getElementById('customLogoutModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
</script>
