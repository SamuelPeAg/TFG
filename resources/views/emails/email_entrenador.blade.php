<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completa tu registro</title>
</head>
<body>
    <h1>¡Hola, {{ $nombre }}!</h1>
    <p>Gracias por registrarte como entrenador en Factomove. Para completar tu registro, haz clic en el siguiente enlace:</p>
    <a href="{{ $url }}" target="_blank">Completa tu registro</a>
    <p>Si no te registraste en nuestro sistema, ignora este correo.</p>
</body>
</html>
