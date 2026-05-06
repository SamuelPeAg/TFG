    public function removeClientFromSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->id != $request->user_id) {
                return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);
        $fechaStart = $fecha->copy()->startOfMinute();
        $fechaEnd = $fecha->copy()->endOfMinute();

        $nombreClase = trim($request->nombre_clase);
        $centro = trim($request->centro);

        $pago = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
            ->where('user_id', $request->user_id)
            ->first();

        if ($pago) {
            $isSelf = ($request->user()->id == $request->user_id);
            $mainMessage = $isSelf ? 'Te has dado de baja de la clase.' : 'El cliente ha sido dado de baja de la clase.';
            $messageSuffix = '';

            // 3. LOGICA RE-ABONO (CRÉDITOS)
            $diffHours = now()->diffInHours($fecha, false); 
            $horasCancelacion = $pago->horas_cancelacion ?? 0;
            
            $tipoInfo = \App\Models\TipoSesion::where('nombre', $pago->tipo_clase)
                ->orWhere('slug', strtolower($pago->tipo_clase))
                ->orWhere('slug', $pago->tipo_clase)
                ->first();

            if ($diffHours >= $horasCancelacion) {
                $allowedCreditIds = $pago->tiposCredito->pluck('id')->toArray();
                if (empty($allowedCreditIds) && $tipoInfo) {
                    $allowedCreditIds = $tipoInfo->tiposCredito->pluck('id')->toArray();
                }

                $userSub = \App\Models\SuscripcionUsuario::where('id_usuario', $request->user_id)
                    ->where('estado', 'activo')
                    ->first();
                
                if ($userSub && !empty($allowedCreditIds)) {
                    $tipoCreditoId = $allowedCreditIds[0];
                    app(\App\Services\CreditService::class)->allocate($userSub, $tipoCreditoId, 1, 30, $pago->id);
                    $messageSuffix = $isSelf ? ' El crédito ha sido devuelto a tu cuenta.' : ' El crédito ha sido devuelto a la cuenta del cliente.';
                }
            } else {
                $messageSuffix = ' Cancelación fuera de plazo: no se ha devuelto el crédito.';
            }

            $pago->delete();
            return response()->json(['success' => true, 'message' => $mainMessage . $messageSuffix]);
        } else {
            return response()->json(['error' => 'No se encontró el registro para eliminar'], 404);
        }
    }
