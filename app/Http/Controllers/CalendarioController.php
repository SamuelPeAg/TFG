<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            $users = User::role('cliente')->orderBy('name')->get();
            $entrenadores = User::role('entrenador')->orderBy('name')->get();
            $centros = \App\Models\Centro::all();
            return response()->json([
                'users' => $users,
                'entrenadores' => $entrenadores,
                'centros' => $centros
            ]);
        }

        return view('app');
    }
}
