<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
        public function index()
    {
        $trainers = Entrenador::all();
        return view('trainers.index', compact('trainers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:trainers',
        ]);

        Entrenador::create([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->route('trainers.index')->with('success', 'Entrenador creado correctamente.');
    }

    public function update(Request $request, Entrenador $trainer)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:trainers,email,' . $trainer->id,

        ]);

        $trainer->update([
            'name' => $request->name,
            'email' => $request->email,

        ]);

        return redirect()->route('users.index')->with('success', 'Entrenador actualizado correctamente.');
    }

    public function destroy(Entrenador $trainer)
    {
        $trainer->delete();
        return redirect()->route('trainers.index')->with('success', 'Entrenador eliminado correctamente.');
    }
}
