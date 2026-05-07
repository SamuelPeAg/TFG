<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Centro extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = "centros";
    protected $primaryKey = "id";

    protected $fillable = [
        "nombre",
        "serie_facturacion",
        "ultimo_numero_factura",
        "cif",
        "direccion",
        "cp",
        "ciudad",
        "color_hex",
        "empresa_id",
        "google_maps_link",
        "lat",
        "lng",
        "tag",
        "icon"
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'id_centro', 'id');
    }
}