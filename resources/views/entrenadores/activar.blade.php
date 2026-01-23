<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completar Registro</title>
</head>
<body>
    <h1>Completa tu registro</h1>

    <form action="{{ route('entrenadores.update', $user->id) }}" method="POST">
        @csrf
        @method('PUT')

        <input type="hidden" name="token" value="{{ $token }}">

        <label for="iban">IBAN:</label>
        <input type="text" name="iban" value="{{ old('iban') }}" required>

        <label for="password">Contraseña:</label>
        <input type="password" name="password" required>

        <label for="password_confirmation">Confirmar Contraseña:</label>
        <input type="password" name="password_confirmation" required>

        <button type="submit">Enviar</button>
    </form>
</body>
</html>

