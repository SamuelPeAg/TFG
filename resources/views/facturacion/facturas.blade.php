<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Sesiones Individuales</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        :root {
            --custom-teal: #5BA8A0;
            --custom-teal-dark: #4A8F88;
            --custom-teal-light: #E0F2F1;
            --custom-text-teal: #00695C;
        }

        .facturacion-dashboard {
            padding: 20px;
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 25px;
            min-height: 600px;
        }

        .btn-big-teal {
            background-color: white;
            border: 1px solid var(--custom-teal-light);
            color: var(--custom-text-teal);
            width: 100%;
            height: 150px;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s, background-color 0.2s;
            cursor: pointer;
        }

        .btn-big-teal:hover {
            background-color: var(--custom-teal-light);
            transform: translateY(-2px);
            color: var(--custom-text-teal);
        }

        .btn-big-teal i {
            font-size: 2rem;
            margin-bottom: 8px;
            color: var(--custom-teal);
        }

        .centros-stack { display: flex; flex-direction: column; gap: 20px; }

        .centro-card {
            background: #fff; border-radius: 10px; border: 1px solid #eee;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03); overflow: hidden;
        }
        .centro-header {
            background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
        }
        .centro-name { font-weight: 700; color: #333; font-size: 1rem; }
        .badge-total {
            background-color: var(--custom-teal-light); color: var(--custom-text-teal);
            padding: 5px 15px; border-radius: 20px; font-weight: 700; font-size: 0.9rem;
        }

        .trainer-summary-card {
            border: 1px solid #ddd;
            margin-top: 12px;
            border-radius: 8px;
            overflow: hidden;
            background-color: #f7f7f7;
            padding: 14px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .trainer-summary-header {
            font-weight: 700;
            font-size: 0.9rem;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .text-white { color: #fff !important; }
        .text-muted { color: rgba(0,0,0,.55) !important; }
        .text-center { text-align: center !important; }
        .small { font-size: .875rem !important; }

        .mb-0 { margin-bottom: 0 !important; }
        .mb-2 { margin-bottom: .5rem !important; }
        .mb-3 { margin-bottom: 1rem !important; }
        .mb-4 { margin-bottom: 1.5rem !important; }
        .mt-2 { margin-top: .5rem !important; }
        .mt-4 { margin-top: 1.5rem !important; }
        .mt-5 { margin-top: 3rem !important; }

        .me-1 { margin-right: .25rem !important; }
        .me-2 { margin-right: .5rem !important; }

        .w-100 { width: 100% !important; }

        .row { display: flex; flex-wrap: wrap; margin-left: -8px; margin-right: -8px; }
        .row > [class^="col-"] { padding-left: 8px; padding-right: 8px; }

        .col-4 { flex: 0 0 auto; width: 33.3333%; }

        .g-2 { gap: .5rem; }

        .form-label { display: inline-block; margin-bottom: .35rem; font-weight: 600; }

        .form-control {
            width: 100%;
            padding: .55rem .8rem;
            border-radius: 10px;
            border: 1px solid rgba(0,0,0,0.16);
            background: #fff;
            font-size: .95rem;
        }

        .form-control-sm { padding: .45rem .7rem; font-size: .875rem; }

        .form-select {
            width: 100%;
            padding: .6rem 2.2rem .6rem .9rem;
            border-radius: 10px;
            border: 1px solid rgba(0,0,0,0.16);
            background-color: #fff;
            color: #333;
            font-size: .95rem;
            line-height: 1.2;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image:
                linear-gradient(45deg, transparent 50%, #666 50%),
                linear-gradient(135deg, #666 50%, transparent 50%);
            background-position:
                calc(100% - 18px) 50%,
                calc(100% - 12px) 50%;
            background-size: 6px 6px, 6px 6px;
            background-repeat: no-repeat;
        }

        .form-select:focus,
        .form-control:focus {
            outline: none;
            border-color: var(--custom-teal);
            box-shadow: 0 0 0 3px rgba(91,168,160,.25);
        }

        .fw-bold { font-weight: 700 !important; }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: .35rem .65rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: .85rem;
            line-height: 1;
        }

        .btn-mini {
            border: 0;
            width: 100%;
            padding: .55rem .8rem;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            background-color: var(--custom-teal);
            color: #fff;
        }

        .btn-mini:hover { filter: brightness(0.97); }

        .filters-card { display: flex; flex-direction: column; gap: 14px; }
    </style>
</head>
<body>

<div class="dashboard-container">
    @include('components.sidebars.sidebar_facturacion')

    <main class="main-content">
        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>
        </div>

        <div class="facturacion-dashboard">

            <div class="action-col">
                <button class="btn-big-teal" type="button">
                    <i class="fa-solid fa-file-invoice"></i>
                    <span>Generar Reporte<br>Global</span>
                </button>
            </div>

            <div class="centros-stack">

                <div class="card p-3 shadow-sm">
                    <form class="filters-card" method="GET" action="{{ route('facturas') }}">
                        <div>
                            <label class="form-label fw-bold" style="color: var(--custom-text-teal);">
                                <i class="fa-solid fa-calendar-alt me-2"></i>Filtrar por Período
                            </label>

                            <div class="row g-2 align-items-end">
                                <div class="col-4">
                                    <label class="form-label small text-muted mb-0">Desde</label>
                                    <input type="date" name="desde" class="form-control form-control-sm" value="{{ $desde }}">
                                </div>
                                <div class="col-4">
                                    <label class="form-label small text-muted mb-0">Hasta</label>
                                    <input type="date" name="hasta" class="form-control form-control-sm" value="{{ $hasta }}">
                                </div>
                                <div class="col-4">
                                    <button class="btn-mini" type="submit">Aplicar</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="form-label fw-bold" style="color: var(--custom-text-teal);">
                                <i class="fa-solid fa-location-dot me-2"></i>Selecciona el Centro
                            </label>
                            <select class="form-select" name="centro">
                                <option value="todos" @selected(($centro ?? 'todos') === 'todos')>-- TODOS LOS CENTROS --</option>
                                @foreach($centros as $c)
                                    <option value="{{ $c }}" @selected(($centro ?? 'todos') === $c)>{{ $c }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="form-label fw-bold" style="color: var(--custom-text-teal);">
                                <i class="fa-solid fa-person-running me-2"></i>Selecciona el Entrenador
                            </label>
                            <select class="form-select" name="entrenador_id">
                                <option value="" @selected(empty($entrenadorId))>-- Ver Todos los Entrenadores --</option>
                                @foreach($entrenadores as $e)
                                    <option value="{{ $e->id }}" @selected(($entrenadorId ?? '') == $e->id)>{{ $e->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <button class="btn-mini" type="submit">Aplicar filtros</button>
                        </div>
                    </form>
                </div>

                <div id="detalle-facturacion" class="card p-3 shadow-sm">
                    @if(empty($resumen))
                        <p class="text-muted text-center mt-5 mb-0">
                            No hay sesiones con esos filtros.
                        </p>
                    @else
                        <div class="centro-card mb-3" style="border: 2px solid var(--custom-teal);">
                            <div class="centro-header" style="background-color: var(--custom-teal-dark); color: white;">
                                <span class="centro-name text-white">
                                    <i class="fa-solid fa-chart-column me-2"></i> RESUMEN POR ENTRENADOR
                                </span>
                                <span class="badge-total" style="background-color: white; color: var(--custom-text-teal);">
                                    TOTAL: {{ number_format(collect($resumen)->sum('facturacion'), 2, ',', '.') }} €
                                </span>
                            </div>
                            <div class="p-3 small text-muted">
                                <p class="mb-0">
                                    Se muestran sesiones y facturación según los filtros seleccionados.
                                </p>
                            </div>
                        </div>

                        @foreach($resumen as $nombre => $info)
                            <div class="trainer-summary-card">
                                <div class="trainer-summary-header">
                                    <i class="fa-solid fa-person-running" style="color: var(--custom-text-teal);"></i>
                                    ENTRENADOR: {{ strtoupper($nombre) }}
                                </div>

                                <div class="d-flex gap-2 align-items-center">
                                    <span class="badge" style="background-color: #d1e7dd; color: #0f5132;">
                                        SESIONES: {{ $info['sesiones'] }}
                                    </span>
                                    <span class="badge-total">
                                        FACTURACIÓN: {{ number_format($info['facturacion'], 2, ',', '.') }} €
                                    </span>
                                </div>
                            </div>
                        @endforeach
                    @endif
                </div>

            </div>

        </div>
    </main>
</div>

</body>
</html>
