<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/facturacion.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pos-tickar.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <style>
        /* Base specific classes to avoid !important */
        .dashboard-container .pos-btn-icon { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .dashboard-container .pos-btn-icon:hover { background: #e2e8f0; color: #1e293b; }
        .dashboard-container .pos-btn-icon.active { background: #10b981; color: white; }
        
        /* Animations */
        .pos-item-btn.wiggling i:first-child { animation: wiggle-session 0.3s infinite; }
        @keyframes wiggle-session { 0% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 50% { transform: rotate(0deg); } 75% { transform: rotate(-3deg); } 100% { transform: rotate(0deg); } }
        
        /* Layout overlays */
        .dashboard-container .pos-item-edit-overlay { position: absolute; inset: 0; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #10b981; opacity: 0; transition: opacity 0.2s; border: 2px solid #10b981; border-radius: 12px; pointer-events: none; }
        .dashboard-container .pos-item-btn:hover .pos-item-edit-overlay { opacity: 1; }
        
        /* UI Elements */
        .dashboard-container .remove-custom { position: absolute; top: -8px; right: -8px; background: white; border-radius: 50%; color: #ef4444; font-size: 18px; cursor: pointer; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .dashboard-container .swal2-html-container { overflow-x: hidden; }
        
        .dashboard-container .gym-input { border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.2s; box-shadow: none; width: 100%; padding: 8px 12px; }
        .dashboard-container .gym-input:focus { border-color: #10b981; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        
        /* Select2 Theme Tweaks */
        .select2-container--default .select2-selection--single {
            border: 1px solid #e2e8f0; border-radius: 8px; height: 38px; display: flex; align-items: center;
        }
        .select2-container--default .select2-selection--single .select2-selection__arrow {
            height: 36px;
        }
        .select2-container--default .select2-selection--single:focus {
            border-color: #10b981; outline: none; 
        }
    </style>
    <meta name="csrf-token" content="{{ csrf_token() }}">

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
                                        <option value="{{ $cen->nombre }}" @selected(($centro ?? 'todos') == $cen->nombre)>
                                            {{ $cen->nombre }}</option>
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
                                        <option value="{{ $e->id }}" @selected($entrenadorId == $e->id)>{{ $e->nombre }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="input-group">
                                <label>Cliente</label>
                                <div class="autocomplete-container" id="clientSearchContainer">
                                    <input type="text" id="clientSearchInput" class="modern-input"
                                        placeholder="Buscar cliente..." autocomplete="off"
                                        value="{{ $clienteId ? ($todosLosClientes->firstWhere('id', $clienteId)->name ?? '') : '' }}">
                                    <input type="hidden" name="cliente_id" id="cliente_id"
                                        value="{{ $clienteId ?? '' }}">
                                    <div class="autocomplete-results" id="clientSearchResults"></div>
                                </div>
                            </div>

                            <div class="form-actions" style="margin-top: 20px; grid-column: 1 / -1; display: flex; gap: 12px; flex-wrap: wrap; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                <button class="btn-generate" type="submit">
                                    <i class="fa-solid fa-filter"></i> Aplicar filtros
                                </button>
                                <button class="btn-generate" type="button" id="open-pos-btn" style="background: #10b981;">
                                    <i class="fa-solid fa-receipt"></i> Tickar
                                </button>
                                <button class="btn-generate" type="button" id="export-xml-btn" style="background: #3b82f6;">
                                    <i class="fa-solid fa-file-code"></i> Exportar XML
                                </button>
                            </div>
                        </form>
                    </div>

                    {{-- Resultados: Tabla de clientes x entrenadores mostrando número de clases --}}
                    <div class="data-table-container">
                        <div class="table-header">
                            <h4 class="table-title">Clases por Entrenador / Cliente</h4>
                        </div>
                        <div class="matrix-container">
                            <div id="scrollbar-top"
                                style="overflow-x: auto; height: 20px; width: 100%; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                                <div id="scrollbar-inner" style="height: 1px;"></div>
                            </div>
                            <div class="matrix-wrap">
                                <table class="matrix-table">
                                    <thead>
                                        <tr>
                                            <th class="sticky-col-header">Cliente</th>
                                            @foreach($entrenadores as $e)
                                                <th class="trainer-header">{{ $e->nombre }}</th>
                                            @endforeach
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($clientes as $c)
                                            <tr>
                                                <td data-label="Cliente" class="sticky-col-cell"
                                                    data-client-id="{{ $c->id }}">
                                                    <div class="client-cell-content">
                                                        <div class="client-meta">
                                                            <div>Total clases: {{ $clienteTotals[$c->id]['total_clases'] }}
                                                            </div>
                                                            <div>Coste total: {{ $clienteTotals[$c->id]['total_coste'] }} €
                                                            </div>
                                                        </div>
                                                        <div class="client-info">
                                                            {{ $c->name }}<br><small>{{ $c->email }}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                @foreach($entrenadores as $e)
                                                    @php
                                                        $data = $matrix[$c->id][$e->id] ?? null;
                                                        $count = $data['count'] ?? 0;
                                                        $amount = $data['amount'] ?? 0;
                                                    @endphp
                                                    <td data-label="{{ $e->nombre }}" data-client-id="{{ $c->id }}"
                                                        data-trainer-id="{{ $e->id }}" class="data-cell">
                                                        @if($count > 0)
                                                            <div class="cell-stats">
                                                                <span class="count-value">{{ $count }} clases</span>
                                                                <span class="amount-value">{{ number_format($amount, 2) }} €</span>
                                                            </div>
                                                        @else
                                                            <span class="count-value">0</span>
                                                        @endif
                                                    </td>
                                                @endforeach
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {{-- Tabla de Saldos --}}
                    <div class="data-table-container" style="margin-top: 30px;">
                        <div class="table-header">
                            <h4 class="table-title">Saldos Positivos o Pendientes de Clientes</h4>
                        </div>
                        <div class="matrix-container" style="padding: 15px;">
                            <table class="matrix-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:left;">Cliente</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:right;">Saldo (A favor o Deuda)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($clientesConSaldo as $cs)
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">{{ $cs->name }} <br><span style="font-size:12px; color:#64748b;">{{ $cs->email }}</span></td>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; text-align:right; font-weight:bold; color: {{ $cs->saldo > 0 ? '#10b981' : '#ef4444' }}">
                                                {{ $cs->saldo > 0 ? '+ '.number_format($cs->saldo, 2) : number_format($cs->saldo, 2) }} €
                                            </td>
                                        </tr>
                                    @empty
                                        <tr><td colspan="2" style="padding:15px; text-align:center; color:#64748b;">No hay clientes con saldos pendientes a favor o en contra.</td></tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {{-- Tabla de XMLs --}}
                    <div class="data-table-container" style="margin-top: 30px;">
                        <div class="table-header">
                            <h4 class="table-title">Historial de Archivos XML Generados</h4>
                        </div>
                        <div class="matrix-container" style="padding: 15px;">
                            <table class="matrix-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:left;">Fecha Generado</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:left;">Nombre de Archivo</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:left;">Periodo (Desde - Hasta)</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align:center;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($archivosXml as $xml)
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">{{ $xml->created_at->format('d/m/Y H:i') }}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">{{ $xml->nombre_archivo }}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">{{ $xml->desde ?? 'N/A' }} / {{ $xml->hasta ?? 'N/A' }}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; text-align:center;">
                                                <a href="{{ asset('storage/xml/' . $xml->nombre_archivo) }}" target="_blank" class="pos-btn-icon" style="display:inline-flex; width:auto; padding:5px 10px; font-size:12px; text-decoration:none;"><i class="fa-solid fa-download" style="margin-right:5px;"></i> Descargar</a>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr><td colspan="4" style="padding:15px; text-align:center; color:#64748b;">No se han generado archivos XML anteriormente.</td></tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div id="modal-overlay"
                        style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:60; align-items:center; justify-content:center;">
                        <div id="modal"
                            style="background:white; border-radius:12px; width:90%; max-width:720px; padding:18px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                            <div
                                style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h3 style="margin:0; font-size:16px;">Detalles de clases</h3>
                                <button id="modal-close"
                                    style="background:transparent; border:none; font-size:18px; cursor:pointer;">✕</button>
                            </div>
                            <div id="modal-body">
                                <p>Cargando...</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- POS Tickar Modal -->
            <div id="pos-modal" class="pos-modal">
                <div class="pos-container">
                    <div class="pos-header">
                        <h2><i class="fa-solid fa-cash-register"></i> Nuevo Ticket - Factomove</h2>
                        <button id="pos-close-btn" class="pos-close">✕</button>
                    </div>
                    <div class="pos-main">
                        <div class="pos-menu" style="display:flex; flex-direction:column; gap:20px;">
                            <div>
                                <div class="pos-category-title">Seleccionar Sesión</div>
                                <div id="pos-items-grid" class="pos-grid">
                                    <!-- Items generated by JS -->
                                </div>
                            </div>
                            
                            <div>
                                <div class="pos-category-title" style="margin-top: 10px; padding-top: 15px; border-top: 1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
                                    Abonado / Entrega Rápida
                                    <button type="button" class="quick-money-btn pos-btn-icon" data-val="0" title="Reiniciar a 0" style="color:#ef4444; background:#fef2f2; width:auto; padding:0 12px; font-size:11px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase;">
                                        <i class="fa-solid fa-rotate-left" style="margin-right:6px;"></i> Empezar de 0
                                    </button>
                                </div>
                                <div class="pos-grid" style="grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 12px; margin-top:15px;">
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="5" style="min-height: 60px; padding:10px; background:#f0fdf4; border-color:#10b981; color:#047857; font-size:18px; font-weight:900;">+ 5€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="10" style="min-height: 60px; padding:10px; background:#f0fdf4; border-color:#10b981; color:#047857; font-size:18px; font-weight:900;">+ 10€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="20" style="min-height: 60px; padding:10px; background:#f0fdf4; border-color:#10b981; color:#047857; font-size:18px; font-weight:900;">+ 20€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="50" style="min-height: 60px; padding:10px; background:#f0fdf4; border-color:#10b981; color:#047857; font-size:18px; font-weight:900;">+ 50€</button>
                                    
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="0.10" style="min-height: 60px; padding:10px; background:#f0f9ff; border-color:#0ea5e9; color:#0369a1; font-size:16px; font-weight:700;">+ 0.10€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="0.20" style="min-height: 60px; padding:10px; background:#f0f9ff; border-color:#0ea5e9; color:#0369a1; font-size:16px; font-weight:700;">+ 0.20€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="0.50" style="min-height: 60px; padding:10px; background:#f0f9ff; border-color:#0ea5e9; color:#0369a1; font-size:16px; font-weight:700;">+ 0.50€</button>

                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="-5" style="min-height: 60px; padding:10px; background:#fef2f2; border-color:#ef4444; color:#b91c1c; font-size:18px; font-weight:900;">- 5€</button>
                                    <button type="button" class="quick-money-btn pos-item-btn" data-val="-10" style="min-height: 60px; padding:10px; background:#fef2f2; border-color:#ef4444; color:#b91c1c; font-size:18px; font-weight:900;">- 10€</button>
                                </div>
                            </div>
                        </div>
                        <div class="pos-sidebar">
                            <div class="pos-form-section">
                                <div class="pos-input-group">
                                    <label>Cliente</label>
                                    <select id="pos-cliente-id" class="pos-select">
                                        <option value="">Seleccionar cliente...</option>
                                        @foreach($todosLosClientes as $tc)
                                            <option value="{{ $tc->id }}">{{ $tc->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="pos-input-group">
                                    <label>Entrenador</label>
                                    <select id="pos-entrenador-id" class="pos-select">
                                        <option value="">Seleccionar entrenador...</option>
                                        @foreach($todosLosEntrenadores as $te)
                                            <option value="{{ $te->id }}">{{ $te->nombre }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="pos-input-group">
                                    <label>Centro</label>
                                    <select id="pos-centro" class="pos-select">
                                        @foreach($centros as $tcen)
                                            <option value="{{ $tcen->nombre }}">{{ $tcen->nombre }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="cart-header">
                                <strong>Detalle de la cuenta</strong>
                            </div>
                            <div id="cart-items-list" class="cart-items">
                                <!-- Cart items generated by JS -->
                            </div>
                            <div class="cart-footer">
                                <div class="cart-total" style="margin-bottom: 8px;">
                                    <span>Total Cuenta:</span>
                                    <span id="cart-total-value" style="font-weight:bold;">0.00 €</span>
                                </div>
                                <div class="cart-total" style="align-items:center; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
                                    <span>Abonado / Entregado:</span>
                                    <div style="display:flex; align-items:center;">
                                        <input type="number" id="pos-importe-entregado" step="0.01" class="gym-input" style="width:80px; text-align:right; padding:4px;" placeholder="0.00">
                                        <span style="margin-left:5px; font-weight:bold;">€</span>
                                    </div>
                                </div>
                                <div id="pos-cambio-container" style="display:none; text-align:right; font-size:12px; color:#64748b; margin-bottom:12px;">
                                    Diferencia al saldo: <span id="pos-cambio-value" style="font-weight:bold; color:#10b981;">0.00 €</span>
                                </div>
                                <button id="btn-checkout" class="btn-checkout">Cobrar Cuenta</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Success Modal -->
            <div id="success-modal" class="pos-modal">
                <div class="pos-container" style="max-width: 400px; height: auto; text-align: center; padding: 40px 24px;">
                    <div style="font-size: 4rem; color: #10b981; margin-bottom: 24px;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h2 style="margin-bottom: 16px; color: #1e293b;">¡Cobro Realizado!</h2>
                    <p style="color: #64748b; margin-bottom: 32px;">La cuenta ha sido registrada correctamente en el sistema y se ha actualizado la tabla de facturación.</p>
                    <button id="success-close-btn" class="btn-checkout" style="width: auto; padding: 12px 32px;">Entendido</button>
                </div>
            </div>

            <!-- Pre-rendered data to avoid IDE JS/Blade errors -->
            <div id="php-data" style="display:none;" 
                 data-clients-url="{{ route('facturas.clases') }}"
                 data-clients-json="{{ json_encode($todosLosClientes->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'email' => $c->email])) }}"
                 data-centros-json="{{ json_encode($centros->pluck('nombre', 'nombre')) }}">
            </div>

        </main>
    </div>

</body>

</html>
<script src="{{ asset('js/facturacion-modal.js') }}"></script>
<script src="{{ asset('js/pos-tickar.js') }}"></script>
<script>
    (function() {
        const dataNode = document.getElementById('php-data');
        if (!dataNode) return;

        window.clasesRelUrl = dataNode.getAttribute('data-clients-url');
        const clientsRaw = dataNode.getAttribute('data-clients-json');
        
        document.addEventListener('DOMContentLoaded', function() {
            try {
                const clientesData = JSON.parse(clientsRaw);
                const initWait = setInterval(() => {
                    if (typeof window.initFacturacionAutocomplete === 'function') {
                        window.initFacturacionAutocomplete(clientesData);
                        clearInterval(initWait);
                    }
                }, 100);
            } catch (e) {
                console.error('Error parsing client data');
            }

            // Lógica para exportar XML
            const exportBtn = document.getElementById('export-xml-btn');
            if (exportBtn) {
                const centrosOptions = JSON.parse(dataNode.getAttribute('data-centros-json') || '{}');
                
                exportBtn.addEventListener('click', function() {
                    const form = this.closest('form');
                    const formData = new FormData(form);
                    
                    Swal.fire({
                        title: 'Seleccionar Centro',
                        text: 'Elige el centro del cual deseas exportar la facturación:',
                        input: 'select',
                        inputOptions: {
                            'todos': 'Todos los centros',
                            ...centrosOptions
                        },
                        inputPlaceholder: 'Selecciona un centro',
                        showCancelButton: true,
                        confirmButtonText: 'Exportar XML',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#3b82f6',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Debes seleccionar una opción'
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const selectedCentro = result.value;
                            const params = new URLSearchParams();
                            
                            // Mantener año y mes de los filtros actuales
                            params.append('anio', formData.get('anio'));
                            params.append('mes', formData.get('mes'));
                            params.append('centro', selectedCentro);
                            
                            window.location.href = "{{ route('facturas.export_xml') }}?" + params.toString();
                        }
                    });
                });
            }
        });
    })();
</script>