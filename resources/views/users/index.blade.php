<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Administrador</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">

    <h2 class="mb-4 text-center">Gestión de Administrador</h2>

    {{-- Selector de sección --}}
    <form method="GET" action="{{ url('/users') }}" class="text-center mb-4">
        <label for="opcion" class="form-label fw-bold">Selecciona una opción:</label>
        <select id="opcion" name="opcion" class="form-select w-auto d-inline-block">
            <option value="usuarios" selected>Usuarios</option>
        </select>
    </form>

    {{-- Mensaje de éxito --}}
    @if(session('success'))
        <div class="alert alert-success text-center">{{ session('success') }}</div>
    @endif

    {{-- Formulario crear usuario --}}
    <form action="{{ route('users.store') }}" method="POST" class="card p-3 mb-4 shadow-sm">
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
                <button type="submit" class="btn btn-success">Añadir</button>
            </div>
        </div>
    </form>

    {{-- Tabla de usuarios --}}
    <table class="table table-bordered table-striped align-middle shadow-sm">
        <thead class="table-dark">
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
                <form action="{{ route('users.update', $user->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <td>{{ $user->id }}</td>
                    <td><input type="text" name="name" value="{{ $user->name }}" class="form-control"></td>
                    <td><input type="email" name="email" value="{{ $user->email }}" class="form-control"></td>
                    <td><input type="text" value="{{ $user->password }}" class="form-control" readonly></td>
                    <td><input type="text" name="IBAN" value="{{ $user->IBAN }}" class="form-control"></td>
                    <td><input type="text" name="firma_digital" value="{{ $user->firma_digital }}" class="form-control"></td>
                    <td class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
                </form>
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
</div>
</body>
</html>
