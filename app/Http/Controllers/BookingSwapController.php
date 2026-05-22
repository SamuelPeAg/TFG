<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Services\BookingSwapService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class BookingSwapController extends Controller
{
    /**
     * @var BookingSwapService
     */
    protected $swapService;

    /**
     * Inyecta el servicio de negocio.
     */
    public function __construct(BookingSwapService $swapService)
    {
        $this->swapService = $swapService;
    }

    /**
     * Obtiene clases candidatas para un intercambio.
     */
    public function getCandidates(Request $request, Pago $pago)
    {
        // Seguridad: el pago debe pertenecer al usuario
        if ($pago->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
            $result = $this->swapService->getCandidates($pago, Auth::id());
            return response()->json($result);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error al buscar candidatas: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Ejecuta el intercambio de clase.
     */
    public function executeSwap(Request $request)
    {
        $request->validate([
            'original_pago_id' => 'required|exists:pagos,id',
            'new_session' => 'required|array',
            'new_session.fecha_hora' => 'required|date',
            'new_session.nombre_clase' => 'required|string',
            'new_session.centro' => 'required|string',
        ]);

        try {
            $this->swapService->executeSwap(
                (int) $request->original_pago_id,
                $request->new_session,
                (int) Auth::id()
            );

            return response()->json([
                'success' => true, 
                'message' => 'Clase intercambiada correctamente.'
            ]);

        } catch (Exception $e) {
            $code = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $code);
        }
    }
}

