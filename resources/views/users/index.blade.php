<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Factomove</title>

    {{-- CSS principal de esta vista --}}
    <link href="{{ asset('css/global.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

<div class="dashboard-container">

    @include('components.sidebars.sidebar_usuarios')

    <main class="main-content">

        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Usuarios</h1>
            </div>

            <div class="controls-bar">
                <button id="toggleCrearUsuario" class="btn btn-success">
                    Añadir usuario
                </button>
            </div>
        </div>

        <div class="content-wrapper">

            @if(session('success'))
                <div class="alert alert-success text-center">
                    {{ session('success') }}
                </div>
            @endif

            {{-- Formulario crear usuario --}}
            <div id="crearUsuarioBox" class="card p-3 mb-4 shadow-sm" style="display: none;">
                <form action="{{ route('users.store') }}" method="POST">
                    @csrf
                    <div class="row g-3">
                        <div class="col-md-2">
                            <input type="text" name="name" class="form-control" placeholder="Nombre" required>
                        </div>
                        <div class="col-md-2">
                            <input type="email" name="email" class="form-control" placeholder="Email" required>
                        </div>
                        <div class="col-md-2">
                            <input type="password" name="password" class="form-control" placeholder="Contraseña" required>
                        </div>
                        <div class="col-md-2">
                            <input type="text" name="IBAN" class="form-control" placeholder="IBAN">
                        </div>
                        <div class="col-md-2">
                            <input type="text" name="firma_digital" class="form-control" placeholder="Firma Digital">
                        </div>
                        <div class="col-md-2 d-grid">
                            <button type="submit" class="btn btn-success">
                                Crear
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {{-- TABLA COMO COMPONENTE --}}
            <x-users_table :users="$users" />

        </div>
    </main>
</div>

<script>
document.getElementById('toggleCrearUsuario').addEventListener('click', () => {
    const box = document.getElementById('crearUsuarioBox');
    box.style.display = (box.style.display === 'none' || box.style.display === '') 
        ? 'block' 
        : 'none';
});
</script>

</body>
</html>
