<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaseCredito extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_clase',
        'tipo_credito',
        'id_centro',
        'coste'
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'id_centro');
    }
}
