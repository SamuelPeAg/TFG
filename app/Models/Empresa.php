<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empresa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'cif_dni',
        'sepa_creditor_id',
        'sepa_bic',
        'direccion',
        'cp',
        'ciudad',
        'iva_configurable'
    ];
}
