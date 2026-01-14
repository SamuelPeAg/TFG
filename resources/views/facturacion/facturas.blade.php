<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        :root{
            --teal:#5BA8A0;
            --teal-dark:#4A8F88;
            --teal-light:#E0F2F1;
        }

        .facturacion-dashboard{
            padding:20px;
            display:grid;
            grid-template-columns:220px 1fr;
            gap:24px;
        }

        .btn-big{
            height:150px;
            border-radius:12px;
            border:1px solid var(--teal-light);
            background:#fff;
            color:#00695C;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            font-weight:700;
            cursor:pointer;
        }

        .btn-big i{
            font-size:2rem;
            margin-bottom:8px;
            color:var(--teal);
        }

        .card{
            background:#fff;
            border-radius:12px;
            border:1px solid #eee;
            padding:16px;
        }

        .filters{
            display:flex;
            flex-direction:column;
            gap:16px;
        }

        .row{
            display:flex;
            gap:12px;
        }

        .col{
            flex:1;
        }

        label{
            font-weight:600;
            font-size:.9rem;
            margin-bottom:4px;
            display:block;
        }

        input,select{
            width:100%;
            padding:.55rem .7rem;
            border-radius:10px;
            border:1px solid rgba(0,0,0,.2);
        }

        button.apply{
            background:var(--teal);
            color:#fff;
            border:0;
            border-radius:10px;
            padding:.6rem;
            font-weight:700;
            cursor:pointer;
        }

        .summary-card{
            display:flex;
            justify-content:space-between;
            align-items:center;
            background:#f7f7f7;
            border-radius:10px;
            padding:14px;
            margin-bottom:12px;
        }

        .badge{
            background:var(--teal-light);
            color:#00695C;
            padding:4px 12px;
            border-radius:999px;
            font-weight:700;
            font-size:.85rem;
        }
    </style>
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
