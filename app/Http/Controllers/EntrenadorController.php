<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;

class EntrenadorController extends Controller
{
    public function index()
    {
        $entrenadores = Entrenador::all();
        return view('entrenadores.index', compact('entrenadores'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'   => 'required|string|max:255',
            'email'    => 'required|email|unique:entrenadores,email',
            'iban'     => 'required|string|max:34',
            'password' => 'required|min:8|confirmed',
        ]);

        Entrenador::create([
            'nombre'   => $request->nombre,
            'email'    => $request->email,
            'iban'     => $request->iban,
            'password' => Hash::make($request->password),
            'rol'      => 'entrenador', 
        ]);

        return redirect()->route('entrenadores.index')
            ->with('success', 'Entrenador añadido correctamente.');
    }

    // --- AQUÍ ESTÁ LA CORRECCIÓN DEL UPDATE ---
    public function update(Request $request, $id)
    {
        // 1. Buscamos el entrenador manualmente por ID
        $entrenador = Entrenador::findOrFail($id);

        // 2. Validación (Usamos $id para ignorar el email actual de este usuario)
        $request->validate([
            'nombre'   => 'required|string|max:255',
            'email'    => 'required|email|unique:entrenadores,email,' . $id,
            'iban'     => 'required|string|max:34',
            'password' => 'nullable|min:8|confirmed',
        ]);

        // 3. Preparar datos
        $data = [
            'nombre' => $request->nombre,
            'email'  => $request->email,
            'iban'   => $request->iban,
        ];

        // 4. Solo actualizar contraseña si se escribió una nueva
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // 5. Guardar
        $entrenador->update($data);

        return redirect()->route('entrenadores.index')
            ->with('success', 'Entrenador actualizado correctamente.');
    }

    public function destroy($id)
    {
        try {
            $entrenador = Entrenador::findOrFail($id);
            $entrenador->delete();

            return redirect()->route('entrenadores.index')
                ->with('success', 'Entrenador eliminado correctamente.');

        } catch (QueryException $e) {
            if ($e->getCode() == "23000") {
                return back()->withErrors(['error' => 'No se puede eliminar: Este entrenador tiene sesiones asignadas.']);
            }
            return back()->withErrors(['error' => 'Error de base de datos: ' . $e->getMessage()]);
            
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ocurrió un error inesperado: ' . $e->getMessage()]);
        }
    }
}