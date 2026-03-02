<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Financiero - Factomove</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  
  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/Pagos.css') }}">
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

<script src="{{ asset('js/pagos-reporte.js') }}"></script>

</body>
</html>