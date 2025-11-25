<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Factomove</title>

    {{-- CSS principal de esta vista --}}
    <link href="{{ asset('css/ususarios.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    {{-- Flatpickr para el calendario --}}

</head>
<body>

<div class="dashboard-container">

    {{-- Sidebar reutilizable --}}
    @include('components.sidebar_usuarios')

    <main class="main-content">

        {{-- Cabecera de la vista --}}
        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Usuarios</h1>
            </div>

            <div class="controls-bar">
                {{-- Botón para mostrar/ocultar formulario de alta --}}
                <button id="toggleCrearUsuario" class="btn btn-success">
                 Añadir usuario
                </button>
            </div>
        </div>

        {{-- Contenido principal --}}
        <div class="container py-5">

            {{-- Mensaje de éxito --}}
            @if(session('success'))
                <div class="alert alert-success text-center">{{ session('success') }}</div>
            @endif

            {{-- Formulario crear usuario (oculto por defecto) --}}
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
                            <button type="submit" class="btn btn-success">Crear</button>
                        </div>
                    </div>
                </form>
            </div>

            {{-- Tabla de usuarios --}}
            <table class="table table-striped align-middle shadow-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Contraseña (hash)</th>
                        <th>IBAN</th>
                        <th>Firma Digital</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($users as $user)
                    <tr>
                        {{-- Form actualizar --}}
                        <form action="{{ route('users.update', $user->id) }}" method="POST">
                            @csrf
                            @method('PUT')

                            <td>{{ $user->id }}</td>

                            <td>
                                <input type="text" name="name" value="{{ $user->name }}" class="form-control">
                            </td>

                            <td>
                                <input type="email" name="email" value="{{ $user->email }}" class="form-control">
                            </td>

                            <td>
                                <input type="text" value="{{ $user->password }}" class="form-control" readonly>
                            </td>

                            <td>
                                <input type="text" name="IBAN" value="{{ $user->IBAN }}" class="form-control">
                            </td>

                            <td>
                                <input type="text" name="firma_digital" value="{{ $user->firma_digital }}" class="form-control">
                            </td>

                            <td class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
                        </form>

                        {{-- Form eliminar --}}
                        <form action="{{ route('users.destroy', $user->id) }}" method="POST">
                            @csrf
                            @method('DELETE')
                                <button type="submit" class="btn btn-danger btn-sm">Eliminar</button>
                        </form>
                            </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

        </div> {{-- /.container --}}
    </main>
</div>

{{-- JS para mostrar / ocultar el formulario de creación --}}
<script>
document.getElementById('toggleCrearUsuario').addEventListener('click', () => {
    const box = document.getElementById('crearUsuarioBox');
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
});
</script>

</body>
</html>
