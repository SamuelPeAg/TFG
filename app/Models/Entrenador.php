<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TrainerGroup;

class Entrenador extends Model
{
    use HasFactory;

    protected $table = 'entrenadores';

    protected $fillable = [
        'nombre',
        'email',
        'iban',     
        'password',  
        'rol',       
    ];
    public function groups()
    {
        return $this->belongsToMany(TrainerGroup::class, 'entrenador_trainer_group');
    }
}