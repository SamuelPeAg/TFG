<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sessiones extends Model
{
    /** @use HasFactory<\Database\Factories\SessionesFactory> */
    use HasFactory;

    protected $table = 'sessiones'; // si quieres otro nombre, dímelo

    protected $fillable = [
        'user_id',
        'IBAN',
        'Pago',
        'Fecharegistro',
    ];

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
