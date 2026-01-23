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
        <a href="{{ route("Pagos") }}" class="menu-item {{ request()->routeIs('Pagos') || request()->routeIs('Pagos.*') ? 'active' : '' }}">
            <i class="fa-solid fa-calendar-check"></i> Pagos
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

        <a href="#" class="menu-item" id="btnSideLogout">
            <i class="fa-solid fa-right-from-bracket"></i> SALIR
        </a>
        
    </div>
</aside>