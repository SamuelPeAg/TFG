<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        .header-controls {
            display: flex;
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
    </style>

</head>
<body>

<div class="dashboard-container">
@include('components.sidebar')
    <main class="main-content">

        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>
        </div>

        <div class="facturacion-dashboard">

            {{-- Acción: Se queda EXACTAMENTE como estaba antes (btn-big) --}}
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

                {{-- Resultados: Componente extraído --}}
                <x-cards.trainer-summary :resumen="$resumen" />

            </div>
        </div>

    </main>
</div>

</body>
</html>