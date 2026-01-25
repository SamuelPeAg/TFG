<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Empresarial - Factomove</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  
  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
  <style>
    /* Estilos Específicos Dashboard */
    body { background-color: #f3f4f6; font-family: 'Inter', system-ui, sans-serif; }
    
    .dashboard-container { display: flex; min-height: 100vh; }
    .main-content { flex: 1; overflow-y: auto; }

    .header-controls { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 30px; 
        padding: 10px 0;
    }
    .page-title, .title-section h1 { 
        font-size: 1.8rem; 
        font-weight: 800; 
        color: #000000 !important; 
        margin: 0; 
    }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .stat-card { 
        background: white; border-radius: 20px; padding: 30px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        display: flex; align-items: center; gap: 20px;
        transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-icon { 
        width: 60px; height: 60px; border-radius: 16px; 
        display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .icon-income { background: #ecfeff; color: #0891b2; }
    .icon-sessions { background: #fef2f2; color: #dc2626; }
    .icon-active { background: #f0fdf4; color: #16a34a; }
    
    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 28px; font-weight: 800; color: #111827; }

    /* Double Layout for Charts and Top */
    .dashboard-row { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px; }
    .chart-container { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .chart-title { font-size: 18px; font-weight: 800; color: #1f2937; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
    
    .top-trainers-card { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .trainer-rank-item { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f3f4f6; }
    .trainer-rank-item:last-child { border-bottom: none; }
    .rank-num { width: 30px; font-weight: 800; color: #9ca3af; font-size: 18px; }
    .trainer-img { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #4BB7AE, #EF5D7A); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    .trainer-info { flex: 1; }
    .t-name, #perf-trainer-name { font-weight: 800; color: #000000 !important; display: block; }
    .t-count { font-size: 12px; color: #6b7280; }

    /* Report Section (Existing functionality) */
    .report-section { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-top: 40px; }
    .section-header { margin-bottom: 25px; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px; }
    
    .flex-header { display: flex; justify-content: space-between; align-items: center; }
    
    .form-grid { display: grid; grid-template-columns: auto 1fr 1fr 1fr auto; gap: 15px; align-items: end; margin-bottom: 25px; }
    .card-toggle { display: flex; background: #f3f4f6; padding: 5px; border-radius: 12px; }
    .toggle-btn { padding: 8px 16px; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; color: #6b7280; }
    .toggle-btn.active { background: white; color: #0e7490; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

    .input-group label { display: block; font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; }
    .modern-input { width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f9fafb; outline: none; transition: all 0.2s; font-size: 14px; }
    .modern-input:focus { border-color: #0e7490; background: white; box-shadow: 0 0 0 4px rgba(14, 116, 144, 0.1); }
    
    .btn-action { background: #111827; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-action:hover { background: #1f2937; transform: scale(1.02); }

    /* Table Styles */
    .table-container { margin-top: 20px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px 20px; font-size: 11px; text-transform: uppercase; color: #9ca3af; background: #f9fafb; font-weight: 800; }
    td { padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 14px; }
    
    .centers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
    .center-mini-card { padding: 15px; border-radius: 16px; background: #f9fafb; border: 1px solid #f3f4f6; }
    .c-label { font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; }
    .c-val { display: block; font-size: 18px; font-weight: 800; color: #111827; margin-top: 2px; }

    @media (max-width: 1024px) {
        .dashboard-row { grid-template-columns: 1fr; }
        .form-grid { grid-template-columns: 1fr; }
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
                <h1 class="page-title">Estadísticas Factomove</h1>
            </div>
        </div>

        <!-- 1. RESUMEN DE MÉTRICAS -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon icon-income"><i class="fa-solid fa-euro-sign"></i></div>
                <div class="stat-info">
                    <span class="stat-label">Ingresos Totales</span>
                    <span class="stat-value">€{{ number_format($totalIngresos, 2) }}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon icon-sessions"><i class="fa-solid fa-calendar-check"></i></div>
                <div class="stat-info">
                    <span class="stat-label">Sesiones Totales</span>
                    <span class="stat-value">{{ $totalSesiones }}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon icon-active"><i class="fa-solid fa-building"></i></div>
                <div class="stat-info">
                    <span class="stat-label">Centro Top</span>
                    <span class="stat-value">{{ $statsPorCentro->sortByDesc('total')->first()->centro ?? 'N/A' }}</span>
                </div>
            </div>
        </div>

        <div class="dashboard-row">
            <!-- 2. GRÁFICOS -->
            <div class="chart-container">
                <h3 class="chart-title"><i class="fa-solid fa-chart-pie"></i> Distribución por Centro</h3>
                <div style="height: 300px; display: flex; justify-content: center;">
                    <canvas id="centersChart"></canvas>
                </div>
                
                <div class="centers-grid">
                    @foreach(['OPEN', 'AIRA', 'CLINICA'] as $c)
                        <div class="center-mini-card">
                            <span class="c-label">{{ $c }}</span>
                            <span class="c-val">€{{ number_format($statsPorCentro->get($c)->ingresos ?? 0, 0) }}</span>
                            <span style="font-size: 12px; color: #16a34a; font-weight: 700;">{{ $statsPorCentro->get($c)->total ?? 0 }} clases</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- 3. DESEMPEÑO ENTRENADOR -->
            <div class="top-trainers-card">
                <h3 class="chart-title"><i class="fa-solid fa-ranking-star"></i> Rendimiento por Entrenador</h3>
                
                <div class="modern-form-group" style="margin-bottom: 20px; position:relative;">
                    <label class="modern-label">Seleccionar Entrenador</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-magnifying-glass input-icon" style="top: 13px;"></i>
                        <input type="text" id="trainer-perf-search" class="modern-input" placeholder="Buscar entrenador..." autocomplete="off">
                        <input type="hidden" id="trainer-perf-id">
                    </div>
                    <div id="trainer-perf-suggestions" class="suggestions" style="top: 100%; border-radius: 12px; margin-top: 5px;" hidden></div>
                </div>

                <div id="trainer-perf-result" style="display:none; animation: fadeIn 0.3s;">
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom: 25px; padding: 15px; background: #f9fafb; border-radius: 16px;">
                        <div class="trainer-img" id="perf-trainer-avatar" style="width:50px; height:50px; font-size:20px;">-</div>
                        <div>
                            <span class="t-name" id="perf-trainer-name" style="font-size:18px;">-</span>
                            <span class="t-count" id="perf-trainer-total" style="font-size:14px; font-weight:700; color:#0e7490;">0 sesiones en total</span>
                        </div>
                    </div>

                    <div style="padding: 20px; background: #111827; border-radius: 20px; color: white;">
                        <span style="font-size:11px; font-weight:800; opacity:0.6; text-transform:uppercase;">Desglose por Tipo</span>
                        <div style="margin-top: 20px;" id="perf-types-list">
                            <!-- JS populated -->
                        </div>
                    </div>
                </div>

                <div id="trainer-perf-empty" style="text-align:center; padding: 40px 20px; color:#9ca3af;">
                    <i class="fa-solid fa-user-clock" style="font-size:32px; margin-bottom:15px; opacity:0.3;"></i>
                    <p style="font-size:13px;">Selecciona un entrenador para ver sus estadísticas de rendimiento.</p>
                </div>
            </div>
        </div>

        <!-- 4. GENERADOR DE REPORTES (EXISTENTE) -->
        <div class="report-section">
            <div class="section-header flex-header">
                <div>
                    <h3 class="chart-title" style="margin:0;"><i class="fa-solid fa-file-export"></i> Histórico Detallado</h3>
                    <p style="font-size:13px; color:#6b7280; margin-top:4px;">Genera un desglose personalizado para una persona específica</p>
                </div>
                <div class="card-toggle">
                    <button class="toggle-btn active" onclick="selectType('user', this)">Alumnos</button>
                    <button class="toggle-btn" onclick="selectType('trainer', this)">Entrenadores</button>
                </div>
            </div>

            <div class="form-grid">
                <div class="input-group" style="position:relative;">
                    <label id="lbl-search">Persona</label>
                    <input type="text" id="search-input" class="modern-input" placeholder="Buscar nombre..." autocomplete="off">
                    <input type="hidden" id="selected-id">
                    <div id="suggestions-box" style="position:absolute; top:100%; left:0; right:0; background:white; border:1px solid #e5e7eb; border-radius:12px; z-index:50; max-height:200px; overflow-y:auto; box-shadow:0 10px 15px rgba(0,0,0,0.1); margin-top:5px;" hidden></div>
                </div>

                <div class="input-group">
                    <label>Desde</label>
                    <input type="date" id="date-start" class="modern-input">
                </div>

                <div class="input-group">
                    <label>Hasta</label>
                    <input type="date" id="date-end" class="modern-input">
                </div>

                <div class="input-group">
                    <label>Método</label>
                    <select class="modern-input">
                        <option value="">Cualquiera</option>
                        @foreach($statsMetodos as $m)
                            <option value="{{ $m->metodo_pago }}">{{ $m->metodo_pago }}</option>
                        @endforeach
                    </select>
                </div>

                <button id="btn-generate" class="btn-action">
                    <i class="fa-solid fa-bolt"></i> GENERAR
                </button>
            </div>

            <div id="results-area" style="display:none; animation: fadeIn 0.3s ease-out;">
                <div style="padding: 20px; background: #f9fafb; border-radius: 16px; margin-bottom: 20px; display: flex; gap: 30px;">
                    <div>
                        <span style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Resultado para:</span>
                        <div id="res-name" style="font-size:20px; font-weight:800; color:#000000;"></div>
                    </div>
                    <div style="border-left: 1px solid #e5e7eb; padding-left: 30px;">
                        <span style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Total Cobrado:</span>
                        <div id="res-total" style="font-size:20px; font-weight:800; color:#0e7490;"></div>
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Clase</th>
                                <th>Centro</th>
                                <th>Detalle</th>
                                <th>Pago</th>
                                <th style="text-align:right;">Importe</th>
                            </tr>
                        </thead>
                        <tbody id="table-body">
                            <!-- JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </main>
</div>

<script>
    // Datos PHP a JS
    window.usersData = @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values());
    window.trainersData = @json($entrenadores->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values());
    
    // Gráfico de Centros
    const ctx = document.getElementById('centersChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['OPEN', 'AIRA', 'CLINICA'],
            datasets: [{
                data: [
                    {{ $statsPorCentro->get('OPEN')->total ?? 0 }},
                    {{ $statsPorCentro->get('AIRA')->total ?? 0 }},
                    {{ $statsPorCentro->get('CLINICA')->total ?? 0 }}
                ],
                backgroundColor: ['#4BB7AE', '#EF5D7A', '#111827'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: '700' } } }
            },
            cutout: '70%'
        }
    });

    // Lógica del Reporteador (Original Mejorada)
    let currentType = 'user';
    const today = new Date();
    document.getElementById('date-start').value = `${today.getFullYear()}-01-01`;
    document.getElementById('date-end').value = `${today.getFullYear()}-12-31`;

    function selectType(type, btn) {
        currentType = type;
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('search-input').value = '';
        document.getElementById('selected-id').value = '';
        document.getElementById('suggestions-box').hidden = true;
    }

    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('suggestions-box');
    const hiddenId = document.getElementById('selected-id');

    searchInput.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';
        if(q.length < 1) { suggestionsBox.hidden = true; return; }
        const source = currentType === 'user' ? window.usersData : window.trainersData;
        const matches = source.filter(i => i.name.toLowerCase().includes(q)).slice(0, 10);
        
        matches.forEach(m => {
            const div = document.createElement('div');
            div.style.padding = '12px 15px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #f3f4f6';
            div.textContent = m.name;
            div.onmouseover = () => div.style.background = '#f9fafb';
            div.onmouseout = () => div.style.background = 'white';
            div.onclick = () => {
                searchInput.value = m.name;
                hiddenId.value = m.id;
                suggestionsBox.hidden = true;
            };
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.hidden = matches.length === 0;
    });

    document.getElementById('btn-generate').addEventListener('click', async () => {
        const id = hiddenId.value;
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;
        if(!id) { alert('Selecciona una persona'); return; }

        try {
            const res = await fetch(`/Estadisticas/reporte?type=${currentType}&id=${id}&start=${start}&end=${end}`);
            const data = await res.json();
            
            document.getElementById('res-name').textContent = data.persona;
            document.getElementById('res-total').textContent = '€' + data.resumen.total;
            
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = '';
            data.detalles.forEach(d => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600;">${d.fecha}</td>
                        <td>${d.clase}</td>
                        <td><span style="font-size:11px; font-weight:800; background:#f3f4f6; padding:4px 8px; border-radius:6px;">${d.centro}</span></td>
                        <td>${d.alumno}</td>
                        <td>${d.metodo}</td>
                        <td style="text-align:right; font-weight:800;">€${Number(d.importe).toFixed(2)}</td>
                    </tr>
                `;
            });
            document.getElementById('results-area').style.display = 'block';
        } catch(e) { alert('Error al cargar datos'); }
    });

    // --- LÓGICA DESEMPEÑO ENTRENADOR (NUEVO) ---
    const trainerPerfSearch = document.getElementById('trainer-perf-search');
    const trainerPerfSuggestions = document.getElementById('trainer-perf-suggestions');
    const trainerPerfId = document.getElementById('trainer-perf-id');

    trainerPerfSearch.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        trainerPerfSuggestions.innerHTML = '';
        if(q.length < 1) { trainerPerfSuggestions.hidden = true; return; }
        
        const matches = window.trainersData.filter(i => i.name.toLowerCase().includes(q)).slice(0, 5);
        matches.forEach(m => {
            const div = document.createElement('div');
            div.style.padding = '12px 15px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #f3f4f6';
            div.textContent = m.name;
            div.onclick = () => {
                trainerPerfSearch.value = m.name;
                trainerPerfId.value = m.id;
                trainerPerfSuggestions.hidden = true;
                cargarStatsEntrenador(m.id);
            };
            trainerPerfSuggestions.appendChild(div);
        });
        trainerPerfSuggestions.hidden = matches.length === 0;
    });

    async function cargarStatsEntrenador(id) {
        try {
            const res = await fetch(`/Estadisticas/trainer-stats/${id}`);
            const data = await res.json();

            document.getElementById('perf-trainer-name').textContent = data.name;
            document.getElementById('perf-trainer-avatar').textContent = data.name.charAt(0);
            document.getElementById('perf-trainer-total').textContent = `${data.total} sesiones en total`;
            
            const list = document.getElementById('perf-types-list');
            list.innerHTML = '';
            
            data.tipos.forEach(tipo => {
                const percent = data.total > 0 ? (tipo.total / data.total * 100) : 0;
                list.innerHTML += `
                    <div style="margin-bottom:18px;">
                        <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;">
                            <span style="font-weight:600;">${tipo.tipo_clase}</span>
                            <span style="opacity:0.8;">${tipo.total} clases</span>
                        </div>
                        <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                            <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #4BB7AE, #A5EFE2); border-radius:4px;"></div>
                        </div>
                    </div>
                `;
            });

            if (data.tipos.length === 0) {
                list.innerHTML = '<p style="font-size:12px; opacity:0.5; text-align:center;">No hay registros de clases para este entrenador.</p>';
            }

            document.getElementById('trainer-perf-empty').style.display = 'none';
            document.getElementById('trainer-perf-result').style.display = 'block';
        } catch(e) { console.error(e); }
    }
</script>

</body>
</html>