<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="{{ asset('css/entrenadores.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>

    <div class="dashboard-container">

        @php
            $user = auth('entrenador')->user() ?: auth('web')->user();
        @endphp
        @if($user && $user->hasRole('admin'))
            @include('components.sidebar.sidebar_admin')
        @elseif($user && $user->hasRole('entrenador'))
            @include('components.sidebar.sidebar_entrenador')
        @endif


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

                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th>Email</th>
                                <th>iban</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($entrenadores as $entrenador)
                            <tr>
                                <td data-label="Entrenador">
                                    <div class="user-info">
                                        <div class="avatar-circle" style="display: flex; align-items: center; justify-content: center;">
                                            @if($entrenador->foto_de_perfil)
                                                <img src="{{ asset('storage/' . $entrenador->foto_de_perfil) }}" 
                                                     alt="{{ $entrenador->name }}" 
                                                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                                <span style="display:none;">{{ strtoupper(substr($entrenador->name, 0, 1)) }}</span>
                                            @else
                                                {{ strtoupper(substr($entrenador->name, 0, 1)) }}
                                            @endif
                                        </div>
                                        <span>{{ $entrenador->name }}</span>
                                    </div>
                                </td>
                                <td data-label="Email">{{ $entrenador->email }}</td>
                                <td data-label="IBAN" style="font-family: monospace;">{{ $entrenador->iban }}</td>
                                <td data-label="Acciones">
                                    <div class="action-buttons">
                                        @php
                                            $isAdmin = $entrenador->hasRole('admin') ? '1' : '0';
                                        @endphp
                                        <button type="button" class="btn-icon btn-edit" 
                                            onclick="abrirModalEditar(
                                                '{{ $entrenador->id }}', 
                                                '{{ $entrenador->name }}', 
                                                '{{ $entrenador->email }}', 
                                                '{{ $entrenador->iban }}',
                                                '{{ $isAdmin }}',
                                                '{{ $entrenador->foto_de_perfil }}'
                                            )">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>

                                        <button type="button" class="btn-icon btn-delete" 
                                            onclick="abrirModalEliminar('{{ $entrenador->id }}', '{{ $entrenador->name }}')">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">
                                    No hay entrenadores registrados aún.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>

    <x-modales.crear-entrenador />

    @include('entrenadores.modales.modal_eliminar')
    @include('entrenadores.modales.modal_editar')

    <script>
        window.routes = {
            update: "{{ route('entrenadores.update', 'temp_id') }}",
            destroy: "{{ route('entrenadores.destroy', 'temp_id') }}"
        };
    </script>
    <script src="{{ asset('js/entrenadores.js') }}"></script>
</body>
</html>