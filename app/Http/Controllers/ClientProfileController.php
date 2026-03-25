<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ClientProfileController extends Controller
{
    public function show(User $user)
    {
        // El entrenador o admin pueden ver todo.
        // El propio cliente solo ve los archivos que no son privados.
        $canSeePrivate = Auth::user()->hasRole('admin') || Auth::user()->hasRole('entrenador');
        
        $files = $user->clientFiles()
            ->when(!$canSeePrivate, function($query) {
                return $query->where('is_private', false);
            })
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

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
            'subscriptions' => $user->suscripciones()->with('suscripcion')->get()
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'dni' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'codigo_postal' => 'nullable|string|max:10',
            'ciudad' => 'nullable|string|max:100',
            'additional_attributes' => 'nullable|array'
        ]);

        $user->update($validated);

        return response()->json(['message' => 'Ficha actualizada correctamente', 'user' => $user]);
    }

    public function uploadFile(Request $request, User $user)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'is_private' => 'required|boolean'
        ]);

        $file = $request->file('file');
        $path = $file->store('client-files/' . $user->id, 'public');

        $clientFile = ClientFile::create([
            'user_id' => $user->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'is_private' => $request->is_private,
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
