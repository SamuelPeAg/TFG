<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Financiero - Factomove</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  
  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <style>
    /* Estilos Específicos Dashboard */
    body { background-color: #f3f4f6; }
    
    .dashboard-container { display: flex; min-height: 100vh; }
    .main-content { flex: 1; padding: 30px; overflow-y: auto; }

    .header-section { margin-bottom: 30px; }
    .page-title { font-size: 28px; font-weight: 800; color: #111827; margin: 0; }
    .page-subtitle { color: #6b7280; font-size: 15px; margin-top: 5px; }

    /* Cards Selección Tipo */
    .selection-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    
    .card-type {
        background: white; border-radius: 16px; padding: 25px;
        cursor: pointer; transition: all 0.2s ease;
        border: 2px solid transparent; text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    
    .card-type:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .card-type.active { border-color: #0e7490; background: #ecfeff; }
    
    .card-icon { 
        width: 60px; height: 60px; border-radius: 50%; 
        background: #f3f4f6; display: flex; align-items: center; justify-content: center;
        font-size: 24px; color: #4b5563; margin: 0 auto 15px; transition: all 0.2s;
    }
    .card-type.active .card-icon { background: #0e7490; color: white; }
    
    .card-title { font-weight: 800; font-size: 16px; color: #1f2937; text-transform: uppercase; }

    /* Panel de Control */
    .control-panel {
        background: white; border-radius: 16px; padding: 30px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin-bottom: 30px;
    }

    .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 20px; align-items: end; }
    
    .input-group label { display: block; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
    .modern-input { 
        width: 100%; padding: 12px 15px; border-radius: 10px; 
        border: 1px solid #e5e7eb; background: #f9fafb; outline: none; transition: all 0.2s; 
    }
    .modern-input:focus { border-color: #0e7490; background: white; box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.1); }
    
    .search-wrapper { position: relative; }
    .search-icon { position: absolute; left: 15px; top: 14px; color: #9ca3af; }
    .search-input { padding-left: 40px; }

    .btn-generate {
        background: #0e7490; color: white; border: none; padding: 12px 25px;
        border-radius: 10px; font-weight: 700; cursor: pointer; height: 45px;
        display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;
    }
    .btn-generate:hover { opacity: 0.9; }

    /* Resultados */
    .results-section { display: none; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric-card { background: white; border-radius: 12px; padding: 25px; border-left: 5px solid #0e7490; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .metric-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; display: block; }
    .metric-value { font-size: 32px; font-weight: 800; color: #111827; margin-top: 5px; display: block; }

    .data-table-container { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
    .table-header { padding: 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb; }
    .table-title { font-weight: 700; color: #374151; font-size: 16px; margin: 0; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px 20px; font-size: 11px; text-transform: uppercase; color: #6b7280; background: #f9fafb; font-weight: 700; }
    td { padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; }
    
    .suggestions {
        position: absolute; top: 100%; left: 0; right: 0;
        background: white; border: 1px solid #e5e7eb; border-radius: 10px;
        z-index: 50; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-top: 5px;
    }
    .suggestion-item { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
    .suggestion-item:hover { background: #f3f4f6; }

    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr; }
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
        
        <div class="header-section">
            <h1 class="page-title">Panel de Reportes</h1>
            <p class="page-subtitle">Consulta histórica detallada por persona</p>
        </div>

        <!-- 1. Selección de Tipo -->
        <div class="selection-cards">
            <div class="card-type active" onclick="selectType('user', this)">
                <div class="card-icon"><i class="fa-solid fa-user"></i></div>
                <div class="card-title">Buscar Alumno</div>
            </div>
            <div class="card-type" onclick="selectType('trainer', this)">
                <div class="card-icon"><i class="fa-solid fa-dumbbell"></i></div>
                <div class="card-title">Buscar Entrenador</div>
            </div>
        </div>

        <!-- 2. Panel de Búsqueda -->
        <div class="control-panel">
            <div class="form-grid">
                
                <div class="input-group search-group">
                    <label id="lbl-search">BUSCAR ALUMNO</label>
                    <div class="search-wrapper">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" id="search-input" class="modern-input search-input" placeholder="Escribe el nombre..." autocomplete="off">
                        <input type="hidden" id="selected-id">
                        <div id="suggestions-box" class="suggestions" hidden></div>
                    </div>
                    <span id="search-error" style="color:#ef4444; font-size:11px; font-weight:700; display:none; margin-top:5px;">
                        <i class="fa-solid fa-circle-exclamation"></i> Debes seleccionar una persona de la lista.
                    </span>
                </div>

                <div class="input-group">
                    <label>DESDE</label>
                    <input type="date" id="date-start" class="modern-input">
                </div>

                <div class="input-group">
                    <label>HASTA</label>
                    <input type="date" id="date-end" class="modern-input">
                </div>

                <button id="btn-generate" class="btn-generate">
                    <i class="fa-solid fa-bolt"></i> GENERAR REPORTE
                </button>

            </div>
        </div>

        <!-- 3. Resultados -->
        <div id="results-area" class="results-section">
            
            <h3 style="margin-bottom:20px;">Resultados para: <span id="res-name" style="color:#0e7490;"></span></h3>

            <div class="summary-grid">
                <div class="metric-card">
                    <span class="metric-label">Total Sesiones</span>
                    <span class="metric-value" id="res-sesiones">0</span>
                </div>
                <div class="metric-card" style="border-left-color: #be123c;">
                    <span class="metric-label">Importe Total</span>
                    <span class="metric-value" id="res-total" style="color:#be123c;">€0.00</span>
                </div>
            </div>

            <div class="data-table-container">
                <div class="table-header">
                    <h4 class="table-title">Detalle de Actividad</h4>
                </div>
                <div style="overflow-x:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Clase</th>
                                <th>Centro</th>
                                <th>Alumno / Detalle</th>
                                <th>Método</th>
                                <th style="text-align:right;">Importe</th>
                            </tr>
                        </thead>
                        <tbody id="table-body">
                            <!-- Populated via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </main>
</div>

<!-- Datos para autocompletado -->
<script>
    window.usersData = @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values());
    window.trainersData = @json($entrenadores->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values());
</script>

<script>
    let currentType = 'user';
    const errorEl = document.getElementById('search-error');
    
    // Set default dates (Año actual completo para evitar ocultar sesiones futuras)
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Desde 1 de Enero
    document.getElementById('date-start').value = `${currentYear}-01-01`;
    // Hasta 31 de Diciembre
    document.getElementById('date-end').value = `${currentYear}-12-31`;

    function selectType(type, element) {
        currentType = type;
        document.querySelectorAll('.card-type').forEach(c => c.classList.remove('active'));
        element.classList.add('active');
        
        document.getElementById('lbl-search').textContent = type === 'user' ? 'BUSCAR ALUMNO' : 'BUSCAR ENTRENADOR';
        document.getElementById('search-input').value = '';
        document.getElementById('selected-id').value = '';
        document.getElementById('results-area').style.display = 'none';
        
        // Hide error
        errorEl.style.display = 'none';
        document.getElementById('search-input').style.borderColor = '#e5e7eb';
    }

    // Buscador
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('suggestions-box');
    const hiddenId = document.getElementById('selected-id');

    searchInput.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        
        // Reset valid selection
        hiddenId.value = '';
        errorEl.style.display = 'none';
        this.style.borderColor = '#e5e7eb';
        
        suggestionsBox.innerHTML = '';
        
        if(q.length < 1) {
            suggestionsBox.hidden = true;
            return;
        }

        const source = currentType === 'user' ? window.usersData : window.trainersData;
        const matches = source.filter(item => item.name.toLowerCase().includes(q));

        if(matches.length === 0) {
            suggestionsBox.hidden = true;
            return;
        }

        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = m.name;
            div.onclick = () => {
                searchInput.value = m.name;
                hiddenId.value = m.id;
                suggestionsBox.hidden = true;
                
                // Clear error state
                errorEl.style.display = 'none';
                searchInput.style.borderColor = '#0e7490';
            };
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.hidden = false;
    });

    document.addEventListener('click', e => {
        if(!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.hidden = true;
        }
    });

    // Generar Reporte
    document.getElementById('btn-generate').addEventListener('click', async () => {
        const id = hiddenId.value;
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;

        // Validación visual
        if(!id) { 
             errorEl.style.display = 'block';
             searchInput.style.borderColor = '#ef4444';
             return; 
        }
        
        if(!start || !end) { alert('Selecciona las fechas.'); return; }

        const btn = document.getElementById('btn-generate');
        btn.style.opacity = '0.7';
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> CARGANDO...';

        try {
            const res = await fetch(`/Pagos/reporte?type=${currentType}&id=${id}&start=${start}&end=${end}`);
            
            if (!res.ok) {
                const errData = await res.json().catch(() => ({})); 
                throw new Error(errData.message || `Error del servidor (${res.status})`);
            }
            
            const data = await res.json();

            // Render Summary
            document.getElementById('res-name').textContent = data.persona;
            document.getElementById('res-sesiones').textContent = data.resumen.sesiones;
            document.getElementById('res-total').textContent = '€' + data.resumen.total;

            // Render Table
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = '';
            
            if(data.detalles.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:30px; text-align:center; color:#9ca3af;">No se encontraron registros en este periodo.</td></tr>';
            } else {
                data.detalles.forEach(d => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${d.fecha}</td>
                        <td style="font-weight:600;">${d.clase}</td>
                        <td><span style="padding:4px 8px; background:#e0f2fe; color:#0369a1; border-radius:4px; font-size:11px; font-weight:700;">${d.centro}</span></td>
                        <td>${d.alumno}</td>
                        <td>${d.metodo}</td>
                        <td style="text-align:right; font-weight:700;">€${Number(d.importe).toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('results-area').style.display = 'block';

        } catch(e) {
            console.error(e);
            alert('Error al generar reporte: ' + e.message);
        } finally {
            btn.style.opacity = '1';
            btn.innerHTML = '<i class="fa-solid fa-bolt"></i> GENERAR REPORTE';
        }
    });
</script>

</body>
</html>