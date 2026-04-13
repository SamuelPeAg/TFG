<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pago;
use App\Models\ClientFile;
use Illuminate\Http\Request;
use App\Models\UserMeasurement;
use App\Models\SuscripcionUsuario;
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

        $files = $user->clientFiles()
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $sessions = Pago::with(['entrenadores'])
            ->where('user_id', $user->id)
            ->orderBy('fecha_registro', 'asc')
            ->get()
            ->map(function ($pago) {
                // Encontrar a otros alumnos inscritos en la misma sesión
                // Una sesión se identifica unívocamente por nombre, centro y fecha exacta
                $allParticipants = Pago::where('fecha_registro', $pago->fecha_registro)
                    ->where('nombre_clase', $pago->nombre_clase)
                    ->where('centro', $pago->centro)
                    ->with('user:id,name,foto_de_perfil')
                    ->get();

                $alumnos = $allParticipants->map(function($p) {
                    return [
                        'id' => $p->user->id,
                        'name' => $p->user->name,
                        'foto' => $p->user->foto_de_perfil ? \Illuminate\Support\Facades\Storage::url($p->user->foto_de_perfil) : null
                    ];
                });

                return [
                    'id' => $pago->id,
                    'user_id' => $pago->user_id,
                    'fecha_registro' => $pago->fecha_registro?->toDateTimeString(),
                    'nombre_clase' => $pago->nombre_clase,
                    'centro' => $pago->centro,
                    'tipo_clase' => $pago->tipo_clase,
                    'capacidad_maxima' => $pago->capacidad_maxima,
                    'entrenadores' => $pago->entrenadores->map(fn($t) => [
                        'id' => $t->id,
                        'name' => $t->name,
                        'foto' => $t->foto_de_perfil ? \Illuminate\Support\Facades\Storage::url($t->foto_de_perfil) : null
                    ])->toArray(),
                    'alumnos' => $alumnos,
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
                'foto_de_perfil' => $user->foto_de_perfil ? \Illuminate\Support\Facades\Storage::url($user->foto_de_perfil) : null,
                'additional_attributes' => (Auth::user()->hasRole('cliente') && !Auth::user()->hasRole('admin') && !Auth::user()->hasRole('entrenador'))
                    ? collect($user->additional_attributes ?? [])->filter(fn($attr) => ($attr['visibility'] ?? 'public') !== 'private')->values()->toArray()
                    : ($user->additional_attributes ?? []),
                'peso' => $user->peso,
                'altura' => $user->altura,
            ],
            'files' => $files,
            'subscriptions' => $user->suscripciones()->with(['suscripcion', 'lotes'])->get(),
            'subscriptionPayments' => Pago::where('user_id', $user->id)
                ->where('tipo_clase', 'Suscripción')
                ->orderBy('fecha_registro', 'desc')
                ->get(),
            'sessions' => $sessions,
            'measurements' => $user->measurements()->orderBy('measured_at', 'desc')->get(),
        ]);
    }

    /**
     * Devuelve las estadísticas dinámicas del cliente vinculadas a la DB.
     */
    public function statistics(User $user)
    {
        // Seguridad: El cliente solo ve sus propias estadísticas
        if (Auth::user()->hasRole('cliente') && Auth::id() !== $user->id) {
            return abort(403);
        }

        // 1. Asistencia mensual (últimos 6 meses)
        $attendance = Pago::where('user_id', $user->id)
            ->where('fecha_registro', '>', now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(fecha_registro, "%Y-%m") as mes, COUNT(*) as total')
            ->groupBy('mes')
            ->orderBy('mes', 'asc')
            ->get();

        // 2. Distribución de tipos de clase
        $sessionTypes = Pago::where('user_id', $user->id)
            ->selectRaw('tipo_clase, COUNT(*) as total')
            ->groupBy('tipo_clase')
            ->get();

        // 3. Resumen de créditos (Lotes actuales)
        $creditBatches = \App\Models\CreditoLote::whereHas('suscripcionUsuario', function($q) use ($user) {
                $q->where('id_usuario', $user->id);
            })
            ->where('cantidad_actual', '>', 0)
            ->where('fecha_vencimiento', '>=', now())
            ->orderBy('fecha_vencimiento', 'asc')
            ->get();

        // 4. KPIs rápidos
        $clasesMes = Pago::where('user_id', $user->id)
            ->whereMonth('fecha_registro', now()->month)
            ->whereYear('fecha_registro', now()->year)
            ->count();

        $totalCredits = $creditBatches->sum('cantidad_actual');
        
        $nextExpiration = $creditBatches->first() ? $creditBatches->first()->fecha_vencimiento->toDateString() : 'N/A';

        // 5. Historial de Suscripciones (Trayectoria)
        $subscriptionHistory = SuscripcionUsuario::where('id_usuario', $user->id)
            ->with('suscripcion')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($su) {
                return [
                    'nombre' => $su->suscripcion->nombre ?? 'Plan Externo',
                    'fecha_inicio' => $su->created_at->toDateString(),
                    'meses' => (int) $su->created_at->diffInMonths(now()),
                ];
            });

        // 6. Historial Físico (Peso/IMC)
        $measurements = UserMeasurement::where('user_id', $user->id)
            ->orderBy('measured_at', 'asc')
            ->get();

        return response()->json([
            'attendance' => $attendance,
            'sessionTypes' => $sessionTypes,
            'creditBatches' => $creditBatches,
            'subscriptionHistory' => $subscriptionHistory,
            'measurements' => $measurements,
            'kpis' => [
                'clasesMes' => $clasesMes,
                'totalCredits' => $totalCredits,
                'nextExpiration' => $nextExpiration,
                'primerDia' => $subscriptionHistory->first() ? $subscriptionHistory->first()['fecha_inicio'] : null,
                'mesesTotales' => $subscriptionHistory->first() ? (int) $user->created_at->diffInMonths(now()) : 0,
            ],
            'additional_attributes' => collect($user->additional_attributes ?? [])->filter(fn($attr) => ($attr['visibility'] ?? 'public') !== 'private')->values()->toArray()
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

    public function saveProgress(Request $request, User $user)
    {
        if (Auth::user()->hasRole('cliente') && Auth::id() !== $user->id) {
            return abort(403);
        }

        $validated = $request->validate([
            'peso' => 'required|numeric|min:20',
            'altura' => 'required|numeric|min:0.5',
            'date' => 'nullable|date',
        ], [
            'peso.required' => 'Tienes que introducir el peso para guardar tu avance.',
            'altura.required' => 'Tienes que introducir la altura para calcular tu IMC.',
            'peso.numeric' => 'El peso debe ser un número válido.',
            'altura.numeric' => 'La altura debe ser un número válido.',
        ]);

        $peso = $validated['peso'];
        $altura = $validated['altura'];
        // Calcular IMC
        $imc = $peso / ($altura * $altura);

        // Actualizar datos actuales en User (si es la más reciente)
        // Por simplicidad actualizamos siempre, pero idealmente solo si es la fecha más nueva
        $user->update([
            'peso' => $peso,
            'altura' => $altura,
        ]);

        // Crear registro en el historial
        $measurement = UserMeasurement::create([
            'user_id' => $user->id,
            'peso' => $peso,
            'altura' => $altura,
            'imc' => round($imc, 2),
            'measured_at' => $validated['date'] ?? now()->toDateString(),
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Progreso guardado correctamente',
            'measurement' => $measurement
        ]);
    }

    public function deleteMeasurement(UserMeasurement $measurement)
    {
        // Seguridad: Dueño o staff
        if (Auth::user()->hasRole('cliente') && Auth::id() !== $measurement->user_id) {
            return abort(403);
        }

        $measurement->delete();
        return response()->json(['success' => true, 'message' => 'Medida eliminada']);
    }

    public function updateMeasurement(Request $request, UserMeasurement $measurement)
    {
        // Seguridad: Dueño o staff
        if (Auth::user()->hasRole('cliente') && Auth::id() !== $measurement->user_id) {
            return abort(403);
        }

        $validated = $request->validate([
            'peso' => 'required|numeric|min:20',
            'altura' => 'required|numeric|min:0.5',
            'measured_at' => 'required|date',
        ], [
            'peso.required' => 'Tienes que introducir el peso.',
            'altura.required' => 'Tienes que introducir la altura.',
        ]);

        $imc = $validated['peso'] / ($validated['altura'] * $validated['altura']);
        
        $measurement->update([
            'peso' => $validated['peso'],
            'altura' => $validated['altura'],
            'imc' => round($imc, 2),
            'measured_at' => $validated['measured_at'],
        ]);

        return response()->json(['success' => true, 'message' => 'Medida actualizada', 'measurement' => $measurement]);
    }
}
