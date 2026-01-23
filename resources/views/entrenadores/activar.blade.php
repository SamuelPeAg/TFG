<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completa tu Registro</title>
</head>
<body>
    <h1>Hola, {{ $user->name }}!</h1>
    <p>Gracias por registrarte en Factomove. Para completar tu registro, ingresa tu contraseña e IBAN:</p>

    <form action="{{ route('entrenadores.update', $user->id) }}" method="POST">
        @csrf
        @method('PUT')

        <input type="hidden" name="token" value="{{ $token }}">

        <div>
            <label for="nombre">Nombre:</label>
            <input type="text" name="nombre" value="{{ old('nombre', $user->name) }}" disabled>
        </div>

        <div>
            <label for="email">Correo:</label>
            <input type="email" name="email" value="{{ old('email', $user->email) }}" disabled>
        </div>

        <div>
            <label for="password">Contraseña:</label>
            <input type="password" name="password" required>
        </div>

        <div>
            <label for="password_confirmation">Confirmar Contraseña:</label>
            <input type="password" name="password_confirmation" required>
        </div>

        <div>
            <label for="iban">IBAN:</label>
            <input type="text" name="iban" required>
        </div>

        <button type="submit">Completar Registro</button>
    </form>
</body>
</html>
