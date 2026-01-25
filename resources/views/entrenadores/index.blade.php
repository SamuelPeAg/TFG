<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <link rel="stylesheet" href="{{ asset('css/entrenadores.css') }}">
</head>

<body>

    <div class="dashboard-container">

        @auth
        @if(auth()->user()->hasRole('admin'))
            @include('components.sidebar.sidebar_admin')
        @elseif(auth()->user()->hasRole('entrenador'))
            @include('components.sidebar.sidebar_entrenador')
        @endif
    @endauth


        <main class="main-content">

            <div class="header-controls">
                
                <div class="title-section">
                    <h1>Gestión de Entrenadores</h1>
                </div>

                <div class="controls-bar">
                    <button id="btnAbrirModal" class="btn-design btn-solid-custom">
                        <i class="fas fa-plus"></i> <span>Añadir Entrenador</span>
                    </button>
                </div>

            </div>

            <div class="content-wrapper">

                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul style="margin:0; padding-left: 20px;">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @include('entrenadores.partials.table')

            </div>
        </main>
    </div>

    <x-modales.crear-entrenador />
    @include('entrenadores.partials.modals')

    <script src="{{ asset('js/entrenadores.js') }}"></script>

    <script>
        // Funciones de utilidad para el modal de eliminación que aún no están en el JS externo o requieren rutas dinámicas
        function cerrarModalEliminar() {
            document.getElementById('modalEliminar').style.display = 'none';
        }

        // El resto de la lógica de apertura ya está en los onclicks que llaman a funciones en entrenadores.js
    </script>
</body>
</html>