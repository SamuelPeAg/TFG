<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $token;
    public string $url;

    public function __construct(User $user, string $token)
    {
        $this->user = $user;
        $this->token = $token;

        $this->url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $this->user->email,
        ], false));
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Restablecer contraseña - Factomove',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset_password',
            with: [
                'url' => $this->url,
                'nombre' => $this->user->name,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
