<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

\Illuminate\Support\Facades\Schedule::call(function () {
    // Eliminar tokens de activación de usuarios no activados después de 24 horas
    \App\Models\User::whereNotNull('activation_token')
        ->where('updated_at', '<', now()->subHours(24))
        ->update(['activation_token' => null]);

    // Opcional: si prefieres eliminar al usuario completo porque su cuenta nunca se activó,
    // puedes usar ->delete() en lugar de ->update(['activation_token' => null])
})->hourly();
