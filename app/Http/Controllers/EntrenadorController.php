<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use Illuminate\Http\Request;

class EntrenadorController extends Controller
{
   public function index()
    {
        $entrenadores = Entrenador::all();
        return view('trainers.index', compact('entrenadores'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required',
            'email' => 'required|email|unique:entrenadores',
        ]);

        Entrenador::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
        ]);

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador creado correctamente.');
    }

    public function update(Request $request, Entrenador $trainer)
    {
        $request->validate([
            'nombre' => 'required',
            'email' => 'required|email|unique:entrenadores,email,' . $trainer->id,

        ]);

        $trainer->update([
            'nombre' => $request->nombre,
            'email' => $request->email,

        ]);

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador actualizado correctamente.');
    }

    public function destroy(Entrenador $trainer)
    {
        $trainer->delete();
        return redirect()->route('entrenadores.index')->with('success', 'Entrenador eliminado correctamente.');
    }

}
