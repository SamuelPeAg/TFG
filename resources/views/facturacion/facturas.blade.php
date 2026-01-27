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
                                <option value="todos">Todos</option>
                                @foreach($centros as $cen)
                                    <option value="{{ $cen }}" @selected(($centro ?? 'todos') == $cen)>{{ $cen }}</option>
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
                            <select name="cliente_id" class="modern-input">
                                <option value="">Todos</option>
                                @foreach($clientes as $c)
                                    <option value="{{ $c->id }}" @selected(($clienteId ?? '') == $c->id)>{{ $c->name }} - {{ $c->email }}</option>
                                @endforeach
                            </select>
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
                            <table class="matrix-table" style="min-width:600px; border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="position:sticky; left:0; background:#f7f7f7; border:1px solid #ddd; z-index:3;">Cliente</th>
                                    @foreach($entrenadores as $e)
                                        <th style="border:1px solid #ddd; text-align:center; white-space:nowrap;">{{ $e->name }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($clientes as $c)
                                    <tr>
                                        <td style="position:sticky; left:0; background:#fff; border:1px solid #ddd; cursor: pointer; z-index:3;" data-client-id="{{ $c->id }}">
                                            <div style="display: flex; align-items: center;">
                                                <div style="margin-right: 10px; font-size: 12px; color: #666;">
                                                    <div>Total clases: {{ $clienteTotals[$c->id]['total_clases'] }}</div>
                                                    <div>Coste total: {{ $clienteTotals[$c->id]['total_coste'] }} €</div>
                                                </div>
                                                <div>
                                                    {{ $c->name }}<br><small>{{ $c->email }}</small>
                                                </div>
                                            </div>
                                        </td>
                                        @foreach($entrenadores as $e)
                                            @php
                                                $count = $matrix[$c->id][$e->id] ?? 0;
                                            @endphp
                                            <td data-label="{{ $e->name }}" data-client-id="{{ $c->id }}" data-trainer-id="{{ $e->id }}" style="border:1px solid #ddd; text-align:center; cursor: pointer;">
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
                const res = await fetch('{{ route('facturas.clases') }}?' + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para esta selección.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px;">Método</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr><td style="padding:8px;">${d.cliente ?? '-'}</td><td style="padding:8px;">${d.entrenador ?? '-'}</td><td style="padding:8px;">${d.fecha ?? '-'}</td><td style="padding:8px;">${d.centro ?? '-'}</td><td style="padding:8px;">${d.metodo ?? '-'}</td><td style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td><td style="padding:8px;">${d.nombre_clase ?? '-'}</td></tr>`;
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
                const res = await fetch('{{ route('facturas.clases') }}?' + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para este cliente.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px;">Método</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr><td style="padding:8px;">${d.cliente ?? '-'}</td><td style="padding:8px;">${d.entrenador ?? '-'}</td><td style="padding:8px;">${d.fecha ?? '-'}</td><td style="padding:8px;">${d.centro ?? '-'}</td><td style="padding:8px;">${d.metodo ?? '-'}</td><td style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td><td style="padding:8px;">${d.nombre_clase ?? '-'}</td></tr>`;
                });
                html += '</tbody></table>';

                openModal(html);
            } catch (e) {
                openModal('<p>Error cargando datos.</p>');
            }
        });
    });
});
</script>