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
        .autocomplete-container {
            position: relative;
            width: 100%;
        }
        .autocomplete-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 100;
            max-height: 250px;
            overflow-y: auto;
            display: none;
        }
        .autocomplete-item {
            padding: 10px 15px;
            cursor: pointer;
            font-size: 14px;
            border-bottom: 1px solid #f3f4f6;
            transition: all 0.2s;
        }
        .autocomplete-item:last-child {
            border-bottom: none;
        }
        .autocomplete-item:hover {
            background: #f0fdfa;
            padding-left: 20px;
            color: #0d9488;
        }
        .autocomplete-item strong {
            display: block;
            color: #1f2937;
        }
        .autocomplete-item small {
            display: block;
            color: #6b7280;
            font-size: 12px;
        }
        .autocomplete-item:hover strong {
            color: #0d9488;
        }
    </style>

</head>
<body>

<div class="dashboard-container">
@php
    $user = auth('entrenador')->user() ?: auth('web')->user();
@endphp
@if($user && $user->hasRole('admin'))
    @include('components.sidebar.sidebar_admin')
@elseif($user && $user->hasRole('entrenador'))
    @include('components.sidebar.sidebar_entrenador')
@endif

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
<script>
document.addEventListener('DOMContentLoaded', function(){
    const overlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    function openModal(html){
        modalBody.innerHTML = html;
        overlay.style.display = 'flex';
    }
    function closeModal(){ overlay.style.display = 'none'; }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });

    // Synchronize scrollbar
    const table = document.querySelector('.matrix-table');
    const scrollbarInner = document.getElementById('scrollbar-inner');
    if (table && scrollbarInner) {
        scrollbarInner.style.width = table.scrollWidth + 'px';
        const matrixWrap = document.querySelector('.matrix-wrap');
        const scrollbarTop = document.getElementById('scrollbar-top');
        if (matrixWrap && scrollbarTop) {
            scrollbarTop.addEventListener('scroll', () => {
                matrixWrap.scrollLeft = scrollbarTop.scrollLeft;
            });
            matrixWrap.addEventListener('scroll', () => {
                scrollbarTop.scrollLeft = matrixWrap.scrollLeft;
            });
        }
    }

    document.querySelectorAll('.matrix-table td[data-trainer-id]').forEach(td => {
        td.addEventListener('click', async function(){
            const clientId = this.dataset.clientId;
            const trainerId = this.dataset.trainerId;
            const count = parseInt(this.textContent.trim()) || 0;
            if (!count) {
                openModal('<p>No hay información disponible para esta selección.</p>');
                return;
            }

            openModal('<p>Cargando...</p>');

            const params = new URLSearchParams();
            if (clientId) params.append('cliente_id', clientId);
            if (trainerId) params.append('entrenador_id', trainerId);

            try {
                const centroSel = document.querySelector('select[name="centro"]');
                if (centroSel && centroSel.value) params.append('centro', centroSel.value);
                const res = await fetch("{{ route('facturas.clases') }}?" + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para esta selección.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px;">Método</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr>
                        <td data-label="Cliente" style="padding:8px;">${d.cliente ?? '-'}</td>
                        <td data-label="Entrenador" style="padding:8px;">${d.entrenador ?? '-'}</td>
                        <td data-label="Fecha" style="padding:8px;">${d.fecha ?? '-'}</td>
                        <td data-label="Centro" style="padding:8px;">${d.centro ?? '-'}</td>
                        <td data-label="Método" style="padding:8px;">${d.metodo ?? '-'}</td>
                        <td data-label="Coste" style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td>
                        <td data-label="Clase" style="padding:8px;">${d.nombre_clase ?? '-'}</td>
                    </tr>`;
                });
                html += '</tbody></table>';

                openModal(html);
            } catch (e) {
                openModal('<p>Error cargando datos.</p>');
            }
        });
    });

    // Event listener for client cells (without trainer-id)
    document.querySelectorAll('.matrix-table td[data-client-id]:not([data-trainer-id])').forEach(td => {
        td.addEventListener('click', async function(){
            const clientId = this.dataset.clientId;
            const params = new URLSearchParams();
            if (clientId) params.append('cliente_id', clientId);

            const centroSel = document.querySelector('select[name="centro"]');
            if (centroSel && centroSel.value !== 'todos') params.append('centro', centroSel.value);

            openModal('<p>Cargando...</p>');

            try {
                const res = await fetch("{{ route('facturas.clases') }}?" + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para este cliente.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px;">Método</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr>
                        <td data-label="Cliente" style="padding:8px;">${d.cliente ?? '-'}</td>
                        <td data-label="Entrenador" style="padding:8px;">${d.entrenador ?? '-'}</td>
                        <td data-label="Fecha" style="padding:8px;">${d.fecha ?? '-'}</td>
                        <td data-label="Centro" style="padding:8px;">${d.centro ?? '-'}</td>
                        <td data-label="Método" style="padding:8px;">${d.metodo ?? '-'}</td>
                        <td data-label="Coste" style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td>
                        <td data-label="Clase" style="padding:8px;">${d.nombre_clase ?? '-'}</td>
                    </tr>`;
                });
                html += '</tbody></table>';

                openModal(html);
            } catch (e) {
                openModal('<p>Error cargando datos.</p>');
            }
        });
    });

    // --- AUTOCOMPLETE CLIENTES ---
    const clients = @json($todosLosClientes->map(function($c) {
        return ['id' => $c->id, 'name' => $c->name, 'email' => $c->email];
    }));

    const searchInput = document.getElementById('clientSearchInput');
    const resultsContainer = document.getElementById('clientSearchResults');
    const hiddenIdInput = document.getElementById('cliente_id');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        
        if (query.length < 1) {
            resultsContainer.style.display = 'none';
            // Si borran todo, reseteamos el ID a vacío (equivale a "Todos")
            hiddenIdInput.value = '';
            return;
        }

        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.email.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = `<strong>${c.name}</strong><small>${c.email}</small>`;
                div.addEventListener('click', () => {
                    searchInput.value = c.name;
                    hiddenIdInput.value = c.id;
                    resultsContainer.style.display = 'none';
                });
                resultsContainer.appendChild(div);
            });
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    });

    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!document.getElementById('clientSearchContainer').contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    // Mostrar resultados si ya hay texto y hacen foco
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            // Disparar input para regenerar resultados si hay contenido
            this.dispatchEvent(new Event('input'));
        }
    });
});
</script>