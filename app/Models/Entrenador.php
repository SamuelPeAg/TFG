<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Entrenador extends Model
{
    use HasFactory, HasRoles;

    protected $table = 'entrenadores';

    protected $fillable = [
        'nombre',
        'email',
        'iban',     
        'password',  
        'rol',       
    ];

    protected $hidden = ['password'];
}