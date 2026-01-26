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
        /* Layout alignment with other pages */
        body { background-color: #f3f4f6; font-family: 'Inter', system-ui, sans-serif; }
        .dashboard-container { display: flex; min-height: 100vh; }
        .main-content { flex: 1; padding: 30px; overflow-y: auto; }

        .header-controls { display:flex; align-items:center; margin-bottom:20px; }
        .title-section h1 { margin:0; font-size:1.8rem; color:#111827; font-weight:800; }

        /* Control panel / filters (same as Pagos) */
        .control-panel {
            background: white; border-radius: 16px; padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; align-items:end; }
        .input-group label { display:block; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; margin-bottom:6px; }
        .modern-input, select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; }
        .modern-input:focus, select:focus { outline:none; box-shadow:0 0 0 3px rgba(14,116,144,0.06); border-color:#0e7490; }
        .btn-generate {
            background: #0e7490; color: white; border: none; padding: 10px 18px;
            border-radius: 10px; font-weight:700; cursor:pointer; height:42px; display:inline-flex; align-items:center; gap:8px;
        }

        /* Data table styling consistent with other pages */
        .data-table-container { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
        .table-header { padding: 16px; border-bottom: 1px solid #f3f4f6; background: #f9fafb; }
        .table-title { font-weight:700; color:#374151; font-size:16px; margin:0; }

        .matrix-table th { text-align:center; padding:12px 14px; font-size:12px; text-transform:uppercase; color:#6b7280; background:#f9fafb; font-weight:700; }
        .matrix-table td { padding:12px 14px; border-bottom:1px solid #f3f4f6; color:#1f2937; font-size:14px; }

        /* Responsive matrix table */
        .matrix-table th, .matrix-table td { border:1px solid #e2e8f0; }
        .matrix-table thead th { position: sticky; top:0; z-index:2; }
        .matrix-wrap { overflow:auto; }

        @media (max-width: 720px) {
            .matrix-table, .matrix-table thead, .matrix-table tbody, .matrix-table th, .matrix-table td, .matrix-table tr { display:block; }
            .matrix-table thead { display:none; }
            .matrix-table tr { margin-bottom: 12px; border-bottom:1px solid #eee; }
            .matrix-table td { display:flex; justify-content:space-between; padding:10px; }
            .matrix-table td::before { content: attr(data-label); font-weight:600; }
        }
    </style>

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
                    <div class="matrix-wrap">
                        <table class="matrix-table" style="min-width:600px; border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="position:sticky; left:0; background:#f7f7f7; border:1px solid #ddd;">Cliente</th>
                                    @foreach($entrenadores as $e)
                                        <th style="border:1px solid #ddd; text-align:center; white-space:nowrap;">{{ $e->name }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($clientes as $c)
                                    <tr>
                                        <td style="position:sticky; left:0; background:#fff; border:1px solid #ddd;">
                                            {{ $c->name }}<br><small>{{ $c->email }}</small>
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

    document.querySelectorAll('.matrix-table td').forEach(td => {
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
});
</script>