<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

</head>
<body>

<div class="dashboard-container">
@auth
        @if(auth()->user()->hasRole('admin'))
            @include('components.sidebar.sidebar_admin')
        @elseif(auth()->user()->hasRole('entrenador'))
            @include('components.sidebar.sidebar_entrenador')
        @endif
    @endauth

    <main class="main-content">

        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>
        </div>

        <div class="facturacion-dashboard">

            {{-- el pilar --}}
            <div>
            </div>

            <div>

                {{-- Filtros: solo Entrenador y Cliente --}}
                        <div class="control-panel">
                    <form method="GET" action="{{ route('facturas') }}" class="form-grid">

                        <div class="input-group">
                            <label>Centro</label>
                            <select name="centro" class="modern-input">
                                <option value="todos" @selected(($centro ?? 'todos') == 'todos')>Todos</option>
                                @foreach($centros as $cen)
                                    <option value="{{ $cen->nombre }}" @selected(($centro ?? 'todos') == $cen->nombre)>{{ $cen->nombre }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="input-group">
                            <label>Año</label>
                            <select name="anio" class="modern-input">
                                @php
                                    $currentYear = date('Y');
                                    $selectedAnio = $anio ?? $currentYear;
                                @endphp
                                @for($year = $currentYear - 5; $year <= $currentYear + 1; $year++)
                                    <option value="{{ $year }}" @selected($selectedAnio == $year)>{{ $year }}</option>
                                @endfor
                            </select>
                        </div>

                        <div class="input-group">
                            <label>Mes</label>
                            <select name="mes" class="modern-input">
                                @php
                                    $selectedMes = $mes ?? '';
                                    $meses = [
                                        '01' => 'Enero',
                                        '02' => 'Febrero',
                                        '03' => 'Marzo',
                                        '04' => 'Abril',
                                        '05' => 'Mayo',
                                        '06' => 'Junio',
                                        '07' => 'Julio',
                                        '08' => 'Agosto',
                                        '09' => 'Septiembre',
                                        '10' => 'Octubre',
                                        '11' => 'Noviembre',
                                        '12' => 'Diciembre'
                                    ];
                                @endphp
                                <option value="">Todos</option>
                                @foreach($meses as $num => $nombre)
                                    <option value="{{ $num }}" @selected($selectedMes == $num)>{{ $nombre }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="input-group">
                            <label>Entrenador</label>
                            <select name="entrenador_id" class="modern-input">
                                <option value="">Todos</option>
                                @foreach($entrenadores as $e)
                                    <option value="{{ $e->id }}" @selected($entrenadorId == $e->id)>{{ $e->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="input-group">
                            <label>Cliente</label>
                            <div class="autocomplete-container" id="clientSearchContainer">
                                <input type="text" id="clientSearchInput" class="modern-input" 
                                       placeholder="Buscar cliente..." autocomplete="off"
                                       value="{{ $clienteId ? ($todosLosClientes->firstWhere('id', $clienteId)->name ?? '') : '' }}">
                                <input type="hidden" name="cliente_id" id="cliente_id" value="{{ $clienteId ?? '' }}">
                                <div class="autocomplete-results" id="clientSearchResults"></div>
                            </div>
                        </div>

                        <div class="input-group" style="align-self:center;">
                            <button class="btn-generate" type="submit"><i class="fa-solid fa-filter"></i> Aplicar filtros</button>
                        </div>
                    </form>
                </div>

                {{-- Resultados: Tabla de clientes x entrenadores mostrando número de clases --}}
                <div class="data-table-container">
                    <div class="table-header">
                        <h4 class="table-title">Clases por Entrenador / Cliente</h4>
                    </div>
                    <div class="matrix-container">
                        <div id="scrollbar-top" style="overflow-x: auto; height: 20px; width: 100%; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                            <div id="scrollbar-inner" style="height: 1px;"></div>
                        </div>
                        <div class="matrix-wrap">
                            <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th class="sticky-col-header">Cliente</th>
                                    @foreach($entrenadores as $e)
                                        <th class="trainer-header">{{ $e->name }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($clientes as $c)
                                    <tr>
                                        <td data-label="Cliente" class="sticky-col-cell" data-client-id="{{ $c->id }}">
                                            <div class="client-cell-content">
                                                <div class="client-meta">
                                                    <div>Total clases: {{ $clienteTotals[$c->id]['total_clases'] }}</div>
                                                    <div>Coste total: {{ $clienteTotals[$c->id]['total_coste'] }} €</div>
                                                </div>
                                                <div class="client-info">
                                                    {{ $c->name }}<br><small>{{ $c->email }}</small>
                                                </div>
                                            </div>
                                        </td>
                                        @foreach($entrenadores as $e)
                                            @php
                                                $count = $matrix[$c->id][$e->id] ?? 0;
                                            @endphp
                                            <td data-label="{{ $e->name }}" data-client-id="{{ $c->id }}" data-trainer-id="{{ $e->id }}" class="data-cell">
                                                <span class="count-value">{{ $count }}</span>
                                            </td>
                                        @endforeach
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>

                <!-- Modal detalles -->
                <div id="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:60; align-items:center; justify-content:center;">
                    <div id="modal" style="background:white; border-radius:12px; width:90%; max-width:720px; padding:18px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <h3 style="margin:0; font-size:16px;">Detalles de clases</h3>
                            <button id="modal-close" style="background:transparent; border:none; font-size:18px; cursor:pointer;">✕</button>
                        </div>
                        <div id="modal-body">
                            <p>Cargando...</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </main>
</div>

</body>
</html>
<script src="{{ asset('js/facturacion-modal.js') }}"></script>
<script>
    // Inicializar autocomplete con los datos de clientes
    const clientesData = @json($todosLosClientes->map(function($c) {
        return ['id' => $c->id, 'name' => $c->name, 'email' => $c->email];
    }));
    window.initFacturacionAutocomplete(clientesData);
</script>