<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Entrenador;
use App\Models\Centro;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index()
    {
        // El modelo User ahora solo contiene clientes
        $users = User::orderBy('name')->get();
        // El modelo Entrenador contiene entrenadores (y admins)
        $entrenadores = Entrenador::role('entrenador')->orderBy('name')->get();
        $centros = Centro::all();
        return view("calendario.index", compact('users', 'entrenadores', 'centros'));
    }
}
