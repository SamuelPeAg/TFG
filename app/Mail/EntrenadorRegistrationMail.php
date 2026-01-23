<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EntrenadorRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $token;

    public function __construct(User $user, $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    public function build()
    {
        return $this->subject('Completa tu registro como Entrenador')
                    ->view('emails.email_entrenador')
                    ->with([
                        'url' => route('entrenadores.activar', ['token' => $this->token]),
                        'nombre' => $this->user->name,
                    ]);
    }
}
