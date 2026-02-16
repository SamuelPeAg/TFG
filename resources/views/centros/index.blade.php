<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Centros - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="{{ asset('css/entrenadores.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
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
                    <h1>Gestión de Centros</h1>
                </div>

                <div class="controls-bar">
                    <button id="btnAbrirModal" class="btn-design btn-solid-custom">
                        <i class="fas fa-plus"></i> <span>Añadir Centro</span>
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

                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Google Maps</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($centros as $centro)
                            <tr>
                                <td data-label="Nombre">
                                    <div class="user-info">
                                        <div class="avatar-circle" style="display: flex; align-items: center; justify-content: center; background-color: #e0f2f1; color: #00897b;">
                                            <i class="fas fa-building"></i>
                                        </div>
                                        <span>{{ $centro->nombre }}</span>
                                    </div>
                                </td>
                                <td data-label="Dirección">{{ $centro->direccion }}</td>
                                <td data-label="Google Maps">
                                    @if($centro->google_maps_link)
                                        <a href="{{ $centro->google_maps_link }}" target="_blank" class="btn-icon">
                                            <i class="fas fa-map-marker-alt" style="color: #e53935;"></i> Ver Mapa
                                        </a>
                                    @else
                                        <span style="color: #94a3b8;">No disponible</span>
                                    @endif
                                </td>
                                <td data-label="Acciones">
                                    <div class="action-buttons">
                                        <button type="button" class="btn-icon btn-edit" 
                                            onclick="abrirModalEditar(
                                                '{{ $centro->id }}', 
                                                '{{ $centro->nombre }}', 
                                                '{{ $centro->direccion }}', 
                                                '{{ $centro->google_maps_link }}'
                                            )">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>

                                        <button type="button" class="btn-icon btn-delete" 
                                            onclick="abrirModalEliminar('{{ $centro->id }}', '{{ $centro->nombre }}')">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">
                                    No hay centros registrados aún.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>

    <x-modales.crear-centro />

    @include('centros.modales.modal_eliminar')
    @include('centros.modales.modal_editar')

    <script>
        window.routes = {
             update: "{{ route('centros.update', 'temp_id') }}",
             destroy: "{{ route('centros.destroy', 'temp_id') }}"
        };
    </script>
    <script src="{{ asset('js/centros.js') }}"></script>
</body>
</html>
