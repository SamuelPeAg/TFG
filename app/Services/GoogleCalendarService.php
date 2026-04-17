<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use App\Models\User;
use Carbon\Carbon;

class GoogleCalendarService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect'));
        $this->client->addScope(Calendar::CALENDAR);
        $this->client->setAccessType('offline');
        $this->client->setApprovalPrompt('force');
    }

    /**
     * Obtiene el cliente configurado para un usuario específico.
     */
    protected function getClientForUser(User $user)
    {
        if (!$user->google_token) {
            return null;
        }

        $this->client->setAccessToken($user->google_token);

        // Si el token ha expirado, refrescarlo
        if ($this->client->isAccessTokenExpired()) {
            if ($user->google_refresh_token) {
                $token = $this->client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
                
                if (isset($token['error'])) {
                   return null;
                }

                $user->update([
                    'google_token' => $token['access_token'],
                    'google_token_expires_at' => now()->addSeconds($token['expires_in']),
                ]);
            } else {
                return null;
            }
        }

        return $this->client;
    }

    /**
     * Sincroniza una sesión (Pago) con el calendario de Google de los entrenadores o usuarios.
     */
    public function syncSession($sessionData, User $user)
    {
        $client = $this->getClientForUser($user);
        if (!$client) return null;

        $service = new Calendar($client);

        $event = new Event([
            'summary' => $sessionData['nombre_clase'] . ' - ' . $sessionData['centro'],
            'location' => $sessionData['centro'],
            'description' => 'Tipo de clase: ' . $sessionData['tipo_clase'],
            'start' => [
                'dateTime' => Carbon::parse($sessionData['fecha_registro'])->toRfc3339String(),
                'timeZone' => config('app.timezone'),
            ],
            'end' => [
                'dateTime' => Carbon::parse($sessionData['fecha_registro'])->addHour()->toRfc3339String(),
                'timeZone' => config('app.timezone'),
            ],
        ]);

        $calendarId = 'primary';
        
        try {
            $event = $service->events->insert($calendarId, $event);
            return $event->id;
        } catch (\Exception $e) {
            \Log::error('Error sync Google Calendar: ' . $e->getMessage());
            return null;
        }
    }
}
