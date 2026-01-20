<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sessiones extends Model
{
    use HasFactory;

    protected $table = 'sessiones';

    protected $fillable = [
        'user_id',
        'entrenador_id',
        'iban',
        'Pago',
        'Fecharegistro',
        'centro',
        'nombre_clase',
        'metodo_pago',
    ];

    protected $casts = [
        'Fecharegistro' => 'datetime',
        'Pago'          => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
     public function entrenador()
    {
        return $this->belongsTo(User::class, 'entrenador_id');
    }
}
