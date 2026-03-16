<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson() || $request->ajax()) {
            $users = User::role('cliente')->orderBy('name')->get();
            $entrenadores = User::role('entrenador')->orderBy('name')->get();
            $centros = \App\Models\Centro::all();
            return response()->json(compact('users', 'entrenadores', 'centros'));
        }
        
        return view('app');
    }
}
