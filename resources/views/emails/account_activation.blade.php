<x-mail::message>
# ¡Hola, {{ $user->name }}!

Tu cuenta en **Factomove** ha sido preparada por un administrador. 

Para empezar a usar la plataforma, necesitas activar tu cuenta y establecer una contraseña segura pulsando el siguiente botón:

<x-mail::button :url="$url">
Activar mi cuenta
</x-mail::button>

Este enlace de activación es personal y único.

Si no has solicitado el alta en Factomove, puedes ignorar este correo.

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
