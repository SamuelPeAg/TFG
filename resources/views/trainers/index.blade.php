<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link href="{{ asset('css/entrenadores.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

<div class="dashboard-container">

    @include('components.sidebar_entrenadores')

    <main class="main-content">

        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Entrenadores</h1>
            </div>

            <div class="controls-bar">
                <button id="toggleCrearUsuario" class="btn btn-success">
                    Añadir Entrenador
                </button>
            </div>
        </div>

        <div class="content-wrapper">

            @if(session('success'))
                <div class="alert alert-success text-center">{{ session('success') }}</div>
            @endif

            <div id="crearUsuarioBox" class="card p-3 mb-4 shadow-sm" style="display: none;">
                <form action="{{ route('entrenadores.store') }}" method="POST">
                    @csrf
                    <div class="row g-3">
                        <div class="col-md-2">
                            <input type="text" name="nombre" class="form-control" placeholder="Nombre" required>
                        </div>
                        <div class="col-md-2">
                            <input type="email" name="email" class="form-control" placeholder="Email" required>
                        </div>
                        <div class="col-md-2 d-grid">
                            <button type="submit" class="btn btn-success">Crear</button>
                        </div>
                    </div>
                </form>
            </div>

           <x-trainers-table :entrenadores="$entrenadores" />

        </div>
    </main>
</div>

<script>
document.getElementById('toggleCrearUsuario').addEventListener('click', () => {
    const box = document.getElementById('crearUsuarioBox');
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
});
</script>

</body>
</html>
