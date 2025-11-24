<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes ;

    protected $fillable = [
        'name',
        'email',
        'password',
        'foto_de_perfil',
        'IBAN',
        'FirmaDigital',
    ];

    protected $hidden = [
        'password',
    ];
}
