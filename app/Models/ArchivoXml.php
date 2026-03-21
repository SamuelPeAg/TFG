<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArchivoXml extends Model
{
    protected $table = 'archivos_xml';

    protected $fillable = [
        'nombre_archivo',
        'ruta',
        'desde',
        'hasta'
    ];

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }
}
