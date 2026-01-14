<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

</head>
<body>

<div class="dashboard-container">
    @include('components.sidebars.sidebar_facturacion')

    <main class="main-content">

        <h1>Gestión de Facturación</h1>

        <div class="facturacion-dashboard">

            {{-- Acción --}}
            <div>
                <button class="btn-big" type="button">
                    <i class="fa-solid fa-file-invoice"></i>
                    Generar reporte global
                </button>
            </div>

            {{-- Contenido --}}
            <div>

                {{-- Filtros --}}
                <div class="card">
                    <form method="GET" action="{{ route('facturas') }}" class="filters">

                        <div>
                            <label>Periodo</label>
                            <div class="row">
                                <div class="col">
                                    <label class="small">Desde</label>
                                    <input type="date" name="desde" value="{{ $desde }}">
                                </div>
                                <div class="col">
                                    <label class="small">Hasta</label>
                                    <input type="date" name="hasta" value="{{ $hasta }}">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label>Centro</label>
                            <select name="centro">
                                <option value="todos" @selected($centro === 'todos')>Todos</option>
                                @foreach($centros as $c)
                                    <option value="{{ $c }}" @selected($centro === $c)>{{ $c }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label>Entrenador</label>
                            <select name="entrenador_id">
                                <option value="">Todos</option>
                                @foreach($entrenadores as $e)
                                    <option value="{{ $e->id }}" @selected($entrenadorId == $e->id)>
                                        {{ $e->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <button class="apply" type="submit">Aplicar filtros</button>
                    </form>
                </div>

                {{-- Resultados --}}
                <div class="card" style="margin-top:20px;">
                    @if(empty($resumen))
                        <p style="text-align:center;color:#777;margin:0;">
                            No hay datos para los filtros seleccionados
                        </p>
                    @else
                        <div class="summary-card" style="background:var(--teal-dark);color:#fff;">
                            <strong>Resumen por entrenador</strong>
                            <span class="badge" style="background:#fff;">
                                TOTAL:
                                {{ number_format(collect($resumen)->sum('facturacion'),2,',','.') }} €
                            </span>
                        </div>

                        @foreach($resumen as $nombre => $info)
                            <div class="summary-card">
                                <div>
                                    <strong>{{ strtoupper($nombre) }}</strong>
                                </div>
                                <div style="display:flex;gap:10px;">
                                    <span class="badge">
                                        Sesiones: {{ $info['sesiones'] }}
                                    </span>
                                    <span class="badge">
                                        {{ number_format($info['facturacion'],2,',','.') }} €
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
