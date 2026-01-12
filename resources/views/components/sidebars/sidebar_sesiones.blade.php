<aside class="sidebar" style="display: flex; flex-direction: column; height: 100vh;">
    <div class="logo">
        <img src="{{ asset('img/logopng.png') }}" alt="">
        <h2>Factomove</h2>
    </div>

    <nav class="main-menu">
        <a href="{{ route("entrenadores.index") }}"  class="menu-item">
            <i class="fa-solid fa-dumbbell"></i> ENTRENADORES
        </a>
        <a href="{{ route("users.index") }}" class="menu-item">
            <i class="fa-solid fa-users"></i> USUARIOS
        </a>
        <a href="{{ route("sesiones") }}" class="menu-item active">
            <i class="fa-solid fa-calendar-check"></i> SESIONES
        </a>
        <a href="{{ route ("facturas")}}" class="menu-item">
            <i class="fa-solid fa-file-invoice"></i> FACTURACIÓN
        </a>
    </nav>

    <div style="flex-grow: 1;"></div>

    <div style="display: flex; align-items: center; justify-content: flex-end; padding: 0 20px; gap: 10px; margin-bottom: 15px;">
        <div style="display: flex; flex-direction: column; text-align: right; line-height: 1.3;">
            <span style="font-weight: 700; color: #ffffff; font-size: 14px;">
                {{ auth()->user()->name }}
            </span>
            <span style="font-size: 11px; color: #e0f2f1; opacity: 0.8;">
                Panel de Gestión
            </span>
        </div>
        
        <div style="width: 40px; height: 40px; background-color: #ffffff; color: #00897b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">
            {{ substr(auth()->user()->name, 0, 1) }} 
        </div>
    </div>


    <div class="utility-links" style="margin-bottom: 20px;">
        
        <a href="#" class="menu-item">
            <i class="fa-solid fa-circle-question"></i> AYUDA
        </a>

        <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">
            @csrf
        </form>

        <a href="#" class="menu-item" onclick="event.preventDefault(); if(confirm('¿Seguro que deseas cerrar sesión?')) { document.getElementById('logout-form').submit(); }">
            <i class="fa-solid fa-right-from-bracket"></i> SALIR
        </a>
        
    </div>
</aside>