<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index()
    {
        $users = User::role('cliente')->orderBy('name')->get();
        $entrenadores = \App\Models\Entrenador::orderBy('nombre')->get();
        $centros = \App\Models\Centro::all()->unique('nombre');
        return view("calendario.index", compact('users', 'entrenadores', 'centros'));
    }
}
