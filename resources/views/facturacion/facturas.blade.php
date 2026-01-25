<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        .header-controls {
            display: flex;
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 30px;
            padding: 10px 0;
        }

        .title-section h1 {
            margin: 0;
            font-size: 1.8rem;
            color: #333;
            font-weight: 800; 
        }
        
        .main-content {
            padding: 20px 40px !important;
        }

        .content-wrapper {
            width: 100%;
        }
    </style>
</head>

<body>

    <div class="dashboard-container">
        @auth
            @if (auth()->user()->hasRole('admin'))
                @include('components.sidebar.sidebar_admin')
            @elseif(auth()->user()->hasRole('entrenador'))
                @include('components.sidebar.sidebar_entrenador')
            @endif
        @endauth

        <main class="main-content">

            <div class="header-controls">
                <div class="title-section">
                    <h1>Facturación Dashboard</h1>
                </div>
            </div>

            <div class="content-wrapper">
                <div class="facturacion-layout" style="display: flex; flex-direction: column; gap: 40px; width: 100%;">

                <!-- RESUMEN GLOBAL (Opcional, pero ayuda a la empresa) -->
                <section class="billing-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; width: 100%;">
                    <div class="billing-card">
                        <div class="billing-icon icon-cyan"><i class="fa-solid fa-cash-register"></i></div>
                        <div class="billing-info">
                            <span class="billing-label">Caja (Estimada)</span>
                            <span class="billing-value">€{{ number_format($stats['bruto'], 2, ',', '.') }}</span>
                        </div>
                    </div>
                    <div class="billing-card">
                        <div class="billing-icon icon-rose"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                        <div class="billing-info">
                            <span class="billing-label">Gasto Personal</span>
                            <span class="billing-value">€{{ number_format($stats['gastos'], 2, ',', '.') }}</span>
                        </div>
                    </div>
                    <div class="billing-card">
                        <div class="billing-icon icon-emerald"><i class="fa-solid fa-piggy-bank"></i></div>
                        <div class="billing-info">
                            <span class="billing-label">Margen Neto</span>
                            <span class="billing-value">€{{ number_format($stats['neto'], 2, ',', '.') }}</span>
                        </div>
                    </div>
                </section>

                <!-- BLOQUE 1: ENTRENADORES -->
                <div style="background: white; border-radius: 24px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f1f3f5;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;">
                        <div>
                            <h2 style="font-size: 26px; font-weight: 800; color: #111827; margin: 0; display: flex; align-items: center; gap: 15px;">
                                <div style="width: 45px; height: 45px; background: #e0f2f1; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fa-solid fa-user-tie" style="color:#4BB7AE;"></i>
                                </div>
                                Facturación Entrenadores
                            </h2>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 5px; margin-left: 60px;">Gestiona los pagos y sesiones generadas por cada entrenador.</p>
                        </div>
                        <a href="{{ route('facturas.invoice', ['type' => 'trainer', 'desde' => $e_desde, 'hasta' => $e_hasta, 'entrenador_id' => $e_entrenadorId]) }}" 
                           target="_blank" style="background:#4BB7AE; color: white; padding: 12px 24px; border-radius: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i class="fa-solid fa-file-invoice"></i> Generar Liquidación
                        </a>
                    </div>

                    <!-- Filtro Profesionales -->
                    <form method="GET" action="{{ route('facturas') }}" style="display: flex; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 18px; margin-bottom: 25px; align-items: flex-end; flex-wrap: wrap; border: 1px solid #edf2f7;">
                        <input type="hidden" name="c_desde" value="{{ $c_desde }}">
                        <input type="hidden" name="c_hasta" value="{{ $c_hasta }}">
                        <input type="hidden" name="c_centro" value="{{ $c_centro }}">
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #475569;">Rango de Liquidación</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="date" name="e_desde" value="{{ $e_desde }}" class="modern-input" style="max-width: 150px;">
                                <input type="date" name="e_hasta" value="{{ $e_hasta }}" class="modern-input" style="max-width: 150px;">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #475569;">Profesional</label>
                            <select name="e_entrenador_id" class="modern-input" style="min-width: 200px;">
                                <option value="">Todos los profesionales</option>
                                @foreach($entrenadores as $e)
                                    <option value="{{ $e->id }}" @selected($e_entrenadorId == $e->id)>{{ $e->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <button type="submit" class="btn-apply" style="height: 45px; margin-bottom: 0;">
                            <i class="fa-solid fa-magnifying-glass"></i> Actualizar Listado
                        </button>
                    </form>

                    <table class="modern-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th style="text-align: center;">Sesiones</th>
                                <th style="text-align: right;">Total Bruto</th>
                                <th style="text-align: right;">A pagar (50%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($resumenEntrenadores as $nombre => $info)
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div class="avatar-mini" style="background: linear-gradient(135deg, #4BB7AE, #EF5D7A);">{{ strtoupper(substr($nombre,0,1)) }}</div>
                                            <span style="font-weight: 700; color: #1f2937;">{{ $nombre }}</span>
                                        </div>
                                    </td>
                                    <td style="text-align: center; font-weight: 800; color: #374151;">{{ $info['sesiones'] }}</td>
                                    <td style="text-align: right; color: #9ca3af; font-size: 13px;">€{{ number_format($info['bruto'], 2, ',', '.') }}</td>
                                    <td style="text-align: right; font-weight: 800; color: #EF5D7A; font-size: 16px;">€{{ number_format($info['liquidacion'], 2, ',', '.') }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="4" style="text-align: center; padding: 40px; color: #9ca3af;">No hay actividad profesional registrada.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- BLOQUE 2: CENTROS -->
                <div style="background: white; border-radius: 24px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f1f3f5;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;">
                        <div>
                            <h2 style="font-size: 26px; font-weight: 800; color: #111827; margin: 0; display: flex; align-items: center; gap: 15px;">
                                <div style="width: 45px; height: 45px; background: #fff1f2; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fa-solid fa-building" style="color:#EF5D7A;"></i>
                                </div>
                                Facturación Centros
                            </h2>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 5px; margin-left: 60px;">Análisis de ingresos y márgenes netos por ubicación.</p>
                        </div>
                        <a href="{{ route('facturas.invoice', ['type' => 'center', 'desde' => $c_desde, 'hasta' => $c_hasta, 'centro' => $c_centro]) }}" 
                           target="_blank" style="background:#EF5D7A; color: white; padding: 12px 24px; border-radius: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i class="fa-solid fa-chart-line"></i> Reporte de Rentabilidad
                        </a>
                    </div>

                    <!-- Filtro Centros -->
                    <form method="GET" action="{{ route('facturas') }}" style="display: flex; gap: 15px; background: #fff5f7; padding: 20px; border-radius: 18px; margin-bottom: 25px; align-items: flex-end; flex-wrap: wrap; border: 1px solid #ffe4e6;">
                        <input type="hidden" name="e_desde" value="{{ $e_desde }}">
                        <input type="hidden" name="e_hasta" value="{{ $e_hasta }}">
                        <input type="hidden" name="e_entrenador_id" value="{{ $e_entrenadorId }}">
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #9f1239;">Periodo de Análisis</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="date" name="c_desde" value="{{ $c_desde }}" class="modern-input" style="max-width: 150px;">
                                <input type="date" name="c_hasta" value="{{ $c_hasta }}" class="modern-input" style="max-width: 150px;">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #9f1239;">Ubicación / Centro</label>
                            <select name="c_centro" class="modern-input" style="min-width: 200px;">
                                <option value="todos">Todos los centros</option>
                                @foreach($centros as $cen)
                                    <option value="{{ $cen }}" @selected($c_centro == $cen)>{{ $cen }}</option>
                                @endforeach
                            </select>
                        </div>
                        <button type="submit" class="btn-apply" style="height: 45px; margin-bottom: 0; background: #9f1239;">
                            <i class="fa-solid fa-sync"></i> Recalcular Rentabilidad
                        </button>
                    </form>

                    <table class="modern-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Centro</th>
                                <th style="text-align: center;">Nº Sesiones</th>
                                <th style="text-align: right;">Caja Bruta</th>
                                <th style="text-align: right;">Beneficio Limpio</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($resumenCentros as $centroName => $info)
                                <tr>
                                    <td style="font-weight: 700; color: #1f2937;">{{ $centroName }}</td>
                                    <td style="text-align: center; font-weight: 800; color: #374151;">{{ $info['sesiones'] }}</td>
                                    <td style="text-align: right; color: #9ca3af; font-size: 13px;">€{{ number_format($info['bruto'], 2, ',', '.') }}</td>
                                    <td style="text-align: right; font-weight: 800; color: #4BB7AE; font-size: 16px;">€{{ number_format($info['neto'], 2, ',', '.') }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="4" style="text-align: center; padding: 40px; color: #9ca3af;">No hay datos de centros registrados.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>

                <!-- BLOQUE 3: CLIENTES -->
                <div style="background: white; border-radius: 24px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f1f3f5;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;">
                        <div>
                            <h2 style="font-size: 26px; font-weight: 800; color: #111827; margin: 0; display: flex; align-items: center; gap: 15px;">
                                <div style="width: 45px; height: 45px; background: #fff7ed; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fa-solid fa-users" style="color:#f97316;"></i>
                                </div>
                                Facturación Clientes
                            </h2>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 5px; margin-left: 60px;">Gestiona los cobros y genera facturas detalladas para tus clientes.</p>
                        </div>
                    </div>

                    <!-- Filtro Clientes -->
                    <form method="GET" action="{{ route('facturas') }}" style="display: flex; gap: 15px; background: #fff7ed; padding: 20px; border-radius: 18px; margin-bottom: 25px; align-items: flex-end; flex-wrap: wrap; border: 1px solid #ffedd5;">
                        <input type="hidden" name="e_desde" value="{{ $e_desde }}">
                        <input type="hidden" name="e_hasta" value="{{ $e_hasta }}">
                        <input type="hidden" name="c_desde" value="{{ $c_desde }}">
                        <input type="hidden" name="c_hasta" value="{{ $c_hasta }}">
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #c2410c;">Periodo Facturación</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="date" name="u_desde" value="{{ $u_desde }}" class="modern-input" style="max-width: 150px;">
                                <input type="date" name="u_hasta" value="{{ $u_hasta }}" class="modern-input" style="max-width: 150px;">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 700; color: #c2410c;">Buscar Cliente</label>
                            <select name="u_cliente_id" class="modern-input" style="min-width: 200px;">
                                <option value="">Todos los clientes</option>
                                @foreach($clientes as $cli)
                                    <option value="{{ $cli->id }}" @selected($u_clienteId == $cli->id)>{{ $cli->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <button type="submit" class="btn-apply" style="height: 45px; margin-bottom: 0; background: #f97316;">
                            <i class="fa-solid fa-filter"></i> Filtrar
                        </button>
                    </form>

                    <table class="modern-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th style="text-align: center;">Sesiones</th>
                                <th>Entrenadores</th>
                                <th style="text-align: right;">Total Gastado</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($resumenClientes as $idCliente => $info)
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div class="avatar-mini" style="background: linear-gradient(135deg, #f97316, #fdba74);">{{ strtoupper(substr($info['nombre'],0,1)) }}</div>
                                            <span style="font-weight: 700; color: #1f2937;">{{ $info['nombre'] }}</span>
                                        </div>
                                    </td>
                                    <td style="text-align: center; font-weight: 800; color: #374151;">{{ $info['sesiones'] }}</td>
                                    <td style="font-size: 13px; color: #6b7280;">
                                        @foreach($info['entrenadores'] as $tName)
                                            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb; margin-right: 4px;">{{ $tName }}</span>
                                        @endforeach
                                    </td>
                                    <td style="text-align: right; font-weight: 800; color: #1f2937; font-size: 16px;">€{{ number_format($info['bruto'], 2, ',', '.') }}</td>
                                    <td style="text-align: right;">
                                        <a href="{{ route('facturas.invoice', ['type' => 'client', 'desde' => $u_desde, 'hasta' => $u_hasta, 'cliente_id' => $idCliente]) }}" 
                                           target="_blank" 
                                           style="color: #f97316; font-weight: 700; text-decoration: none; border: 1px solid #f97316; padding: 6px 12px; border-radius: 8px; font-size: 13px; transition: all 0.2s;"
                                           onmouseover="this.style.background='#fff7ed'" onmouseout="this.style.background='transparent'">
                                            <i class="fa-solid fa-file-pdf"></i> Factura
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="5" style="text-align: center; padding: 40px; color: #9ca3af;">No hay actividad de clientes en este periodo.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>

            </div>

        </main>
    </div>

</body>

</html>