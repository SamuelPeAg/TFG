<aside class="sidebar">
    <div class="logo">
        <img src="{{ asset('img/logopng.png') }}" alt="">
        <h2>Factomove</h2>
    </div>

      <nav class="main-menu">
        <a href="{{ route("entrenadores.index") }}"  class="menu-item active">
            <i class="fa-solid fa-dumbbell"></i> ENTRENADORES
        </a>
        <a href="{{ route("users.index") }}" class="menu-item ">
            <i class="fa-solid fa-users"></i> USUARIOS
        </a>
        <a href="{{ route("sesiones") }}" class="menu-item">
            <i class="fa-solid fa-calendar-check"></i> SESIONES
        </a>
        <a href="{{ route ("facturas")}}" class="menu-item">
            <i class="fa-solid fa-file-invoice"></i> FACTURACIÓN
        </a>
    </nav>

    <div class="utility-links">
        <a href="#" class="menu-item"><i class="fa-solid fa-comment-dots"></i> MESSAGES</a>
        <a href="#" class="menu-item"><i class="fa-solid fa-gear"></i> HELP CENTER</a>
    </div>
</aside>
