<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pago;
use App\Models\ClientFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ClientProfileController extends Controller
{
    public function show(User $user)
    {
        // El cliente solo puede ver su propia ficha.
        if (Auth::user()->hasRole('cliente') && !Auth::user()->hasRole('admin') && !Auth::user()->hasRole('entrenador')) {
            if (Auth::id() !== $user->id) {
                return abort(403, 'No tienes permiso para ver esta ficha.');
            }
        }

        // El propio cliente solo ve los archivos que no son privados.
        /* Desactivado por ahora a petición del usuario
        $canSeePrivate = Auth::user()->hasRole('admin') || Auth::user()->hasRole('entrenador');
        
        $files = $user->clientFiles()
            ->when(!$canSeePrivate, function($query) {
                return $query->where('is_private', false);
            })
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();
        */

        $files = $user->clientFiles()
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $sessions = Pago::with(['entrenadores'])
            ->where('user_id', $user->id)
            ->orderBy('fecha_registro', 'asc')
            ->get()
            ->map(function ($pago) {
                return [
                    'id' => $pago->id,
                    'fecha_registro' => $pago->fecha_registro?->toDateTimeString(),
                    'nombre_clase' => $pago->nombre_clase,
                    'centro' => $pago->centro,
                    'tipo_clase' => $pago->tipo_clase,
                    'capacidad_maxima' => $pago->capacidad_maxima,
                    'entrenadores' => $pago->entrenadores->map(fn($t) => $t->name)->toArray(),
                    'importe' => $pago->importe,
                    'metodo_pago' => $pago->metodo_pago,
                ];
            });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'dni' => $user->dni,
                'direccion' => $user->direccion,
                'codigo_postal' => $user->codigo_postal,
                'ciudad' => $user->ciudad,
                'additional_attributes' => $user->additional_attributes ?? [],
            ],
            'files' => $files,
            'subscriptions' => $user->suscripciones()->with('suscripcion')->get(),
            'sessions' => $sessions,
        ]);
    }

    public function update(Request $request, User $user)
    {
        // El cliente solo puede actualizar su propia ficha.
        if (Auth::user()->hasRole('cliente') && !Auth::user()->hasRole('admin') && !Auth::user()->hasRole('entrenador')) {
            if (Auth::id() !== $user->id) {
                return abort(403, 'No tienes permiso para actualizar esta ficha.');
            }
        }

        $validated = $request->validate([
            'dni' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'codigo_postal' => 'nullable|string|max:10',
            'ciudad' => 'nullable|string|max:100',
            'additional_attributes' => 'nullable|array'
        ], [
            'dni.max' => 'El DNI/NIE no puede tener más de 20 caracteres.',
            'direccion.max' => 'La dirección es demasiado larga (máx. 255).',
            'codigo_postal.max' => 'El código postal no es válido.',
            'ciudad.max' => 'El nombre de la ciudad es demasiado largo.',
        ]);

        $user->update($validated);

        return response()->json(['message' => 'Ficha actualizada correctamente', 'user' => $user]);
    }

    public function uploadFile(Request $request, User $user)
    {
        // El cliente solo puede subir archivos a su propia ficha.
        if (Auth::user()->hasRole('cliente') && !Auth::user()->hasRole('admin') && !Auth::user()->hasRole('entrenador')) {
            if (Auth::id() !== $user->id) {
                return abort(403, 'No tienes permiso para subir archivos a esta ficha.');
            }
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'is_private' => 'nullable' // Desactivado por ahora
        ]);

        $file = $request->file('file');
        $path = $file->store('client-files/' . $user->id, 'public');

        $clientFile = ClientFile::create([
            'user_id' => $user->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'is_private' => $request->is_private ?? 0,
            'uploaded_by' => Auth::id(),
        ]);

        return response()->json(['message' => 'Archivo subido correctamente', 'file' => $clientFile->load('uploader:id,name')]);
    }

    public function toggleFilePrivacy(ClientFile $file)
    {
        $file->update(['is_private' => !$file->is_private]);
        return response()->json(['message' => 'Privacidad actualizada', 'is_private' => $file->is_private]);
    }

    public function deleteFile(ClientFile $file)
    {
        Storage::disk('public')->delete($file->file_path);
        $file->delete();
        return response()->json(['message' => 'Archivo eliminado']);
    }

    public function downloadFile(ClientFile $file)
    {
        // Check if user has permission
        if ($file->is_private && !(Auth::user()->hasRole('admin') || Auth::user()->hasRole('entrenador'))) {
            return abort(403);
        }
        
        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }
}
