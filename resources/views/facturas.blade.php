<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Sesiones Individuales</title>

    {{-- Layout original --}}
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    
    {{-- FontAwesome --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    {{-- Bootstrap 5 --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        /* COLOR PERSONALIZADO */
        :root {
            --custom-teal: #5BA8A0;
            --custom-teal-dark: #4A8F88;
            --custom-teal-light: #E0F2F1;
            --custom-text-teal: #00695C;
        }

        /* LAYOUT DE 3 COLUMNAS */
        /* LAYOUT DE 3 COLUMNAS: Ajustamos el ancho de la columna 1 si es necesario */
        .facturacion-dashboard {
            padding: 20px;
            display: grid;
            /* Reducimos el ancho de la primera columna de 220px a 180px */
            grid-template-columns: 180px 1fr 300px; 
            gap: 25px;
            min-height: 600px; 
        }

        /* --- COLUMNA 1: BOTÓN DE REPORTE (A TAMAÑO REDUCIDO) --- */
        .btn-big-teal {
            background-color: white; /* Color de fondo a blanco (menos importancia) */
            border: 1px solid var(--custom-teal-light); /* Borde suave */
            color: var(--custom-text-teal); /* Color del texto turquesa */
            width: 100%;
            height: 150px; /* Reducimos la altura drásticamente (de 400px a 150px) */
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem; /* Reducimos el tamaño de la fuente */
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05); /* Sombra muy sutil */
            transition: transform 0.2s, background-color 0.2s;
            cursor: pointer;
        }

        .btn-big-teal:hover {
            background-color: var(--custom-teal-light); /* Fondo suave al pasar el ratón */
            transform: translateY(-2px); /* Un pequeño levantamiento al pasar el ratón */
            color: var(--custom-text-teal);
        }

        .btn-big-teal i {
            font-size: 2rem; /* Reducimos el tamaño del icono */
            margin-bottom: 8px; /* Reducimos el margen */
            color: var(--custom-teal); /* Aseguramos que el icono mantenga el color principal */
        }

        /* --- COLUMNA 2: DETALLE POR CLIENTE --- */
        .centros-stack { display: flex; flex-direction: column; gap: 20px; }

        .centro-card {
            background: #fff; border-radius: 10px; border: 1px solid #eee;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03); overflow: hidden;
        }
        .centro-header {
            background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
        }
        .centro-name { font-weight: 700; color: #333; font-size: 1rem; }
        .badge-total {
            background-color: var(--custom-teal-light); color: var(--custom-text-teal);
            padding: 5px 15px; border-radius: 20px; font-weight: 700; font-size: 0.9rem;
        }
        
        /* Estilos de la tabla de 31 días (como en tu imagen) */
        .detalle-table-container {
            overflow-x: auto;
            max-width: 100%;
        }
        .tabla-dias-sesion {
            width: 100%;
            min-width: 1000px; /* Asegura que la tabla no se colapse en pantallas pequeñas */
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 0.7rem; /* Fuente más pequeña para que quepa todo */
            margin-top: 10px;
        }
        .tabla-dias-sesion th {
            text-align: center;
            padding: 3px 2px;
            font-weight: 500;
            background-color: #e9ecef; /* Fondo claro para los encabezados de días */
            border: 1px solid #ddd;
        }
        .tabla-dias-sesion td {
            height: 20px;
            width: 20px;
            padding: 0;
            border: 1px solid #ddd;
            text-align: center;
        }
        .sesion-activa {
            background-color: #FF5757; /* Fondo rojo para el día activo, como en tu imagen */
            color: white;
            font-weight: bold;
        }


        /* --- COLUMNA 3: TOP ENTRENADORES --- */
        .top-card {
            background: white; border-radius: 10px; border: 1px solid #eee;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); height: fit-content;
        }
        .top-header {
            background: #333; color: white; padding: 15px; border-radius: 10px 10px 0 0;
            font-weight: bold; display: flex; align-items: center; gap: 10px;
        }
        .ranking-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 15px; border-bottom: 1px solid #f0f0f0;
        }
        .ranking-item:last-child { border-bottom: none; }
        .rank-number {
            background: var(--custom-teal); color: white; width: 25px; height: 25px;
            border-radius: 50%; display: flex; justify-content: center; align-items: center;
            font-size: 0.8rem; font-weight: bold; margin-right: 10px;
        }
        .trainer-info { display: flex; align-items: center; }

    </style>
</head>
<body>

{{-- ================================================= --}}
{{-- BLOQUE DE DATOS PHP SIMULADOS (Facturación por Cliente) --}}
{{-- ================================================= --}}
@php
    $centros_simulados = [
        [
            'nombre' => 'CLINICA', // Nombre del centro
            'clientes' => [
                [
                    'nombre' => 'Moises Godoy', 
                    'entrenador' => 'Carlos', 
                    'tipo_cobro' => 'TPV',
                    'precio_sesion' => 25.00,
                    'sesiones_mes' => 4,
                    'sesiones_dias' => [4, 6, 22, 24], 
                    'precio_total' => 100.00
                ],
                [
                    'nombre' => 'EMILIO Diaz', 
                    'entrenador' => 'Carlos',
                    'tipo_cobro' => 'TPV',
                    'precio_sesion' => 25.00,
                    'sesiones_mes' => 4,
                    'sesiones_dias' => [4, 6, 22, 26],
                    'precio_total' => 100.00
                ],
                [
                    'nombre' => 'Jose Albornoz', 
                    'entrenador' => 'Ana',
                    'tipo_cobro' => 'TPV',
                    'precio_sesion' => 32.00,
                    'sesiones_mes' => 2,
                    'sesiones_dias' => [4, 6],
                    'precio_total' => 64.00
                ],
                [
                    'nombre' => 'Ana Salto', 
                    'entrenador' => 'Ana',
                    'tipo_cobro' => 'TPV',
                    'precio_sesion' => 30.00,
                    'sesiones_mes' => 1,
                    'sesiones_dias' => [4],
                    'precio_total' => 30.00
                ]
            ]
        ],
        [
            'nombre' => 'VIRTUAL',
            'clientes' => [
                [
                    'nombre' => 'Laura García', 
                    'entrenador' => 'Laura', 
                    'tipo_cobro' => 'BIZUM',
                    'precio_sesion' => 40.00,
                    'sesiones_mes' => 5,
                    'sesiones_dias' => [1, 5, 10, 15, 20], 
                    'precio_total' => 200.00
                ]
            ]
        ]
    ];

    // CÁLCULO DEL RANKING (Acumulado por Entrenador)
    $ranking = [];
    foreach($centros_simulados as $centro) {
        foreach($centro['clientes'] as $cliente) {
            $nombre = $cliente['entrenador'];
            if (!isset($ranking[$nombre])) {
                $ranking[$nombre] = 0;
            }
            $ranking[$nombre] += $cliente['precio_total'];
        }
    }
    arsort($ranking);
@endphp

{{-- ================================================= --}}
{{-- CUERPO PRINCIPAL DEL DASHBOARD --}}
{{-- ================================================= --}}
<div class="dashboard-container">
    {{-- SIDEBAR DE NAVEGACION (CONSERVADO) --}}
    @include('components.sidebar_facturacion')

    <main class="main-content">
        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>
        </div>

        <div class="facturacion-dashboard">
            
            {{-- COLUMNA 1: BOTÓN IZQUIERDA --}}
            <div class="action-col">
                <button class="btn-big-teal">
                    <i class="fa-solid fa-file-invoice"></i>
                    <span>Generar Reporte<br>Global</span>
                </button>
            </div>

            {{-- ================================================= --}}
            {{-- COLUMNA 2: FILTRO, SELECT Y DETALLE POR CLIENTE --}}
            {{-- ================================================= --}}
            <div class="centros-stack">
                
                {{-- 1. FILTRO DE RANGO DE FECHAS --}}
                <div class="card p-3 shadow-sm">
                    <label class="form-label fw-bold" style="color: var(--custom-text-teal);">
                        <i class="fa-solid fa-calendar-alt me-2"></i>Filtrar por Período
                    </label>
                    <div class="row g-2 align-items-end">
                        <div class="col-4">
                            <label for="fecha-desde" class="form-label small text-muted mb-0">Desde</label>
                            <input type="date" id="fecha-desde" class="form-control form-control-sm">
                        </div>
                        <div class="col-4">
                            <label for="fecha-hasta" class="form-label small text-muted mb-0">Hasta</label>
                            <input type="date" id="fecha-hasta" class="form-control form-control-sm">
                        </div>
                        <div class="col-4">
                            <button class="btn btn-sm w-100 text-white" style="background-color: var(--custom-teal);" onclick="aplicarFiltro()">
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>

                {{-- 2. EL CONTROL SELECT (Desplegable) --}}
                <div class="card p-3 shadow-sm">
                    <label for="centro-selector" class="form-label fw-bold" style="color: var(--custom-text-teal);">
                        <i class="fa-solid fa-location-dot me-2"></i>Selecciona el Centro
                    </label>
                    <select class="form-select" id="centro-selector" onchange="mostrarDetalleCentro(this.value)">
                        <option value="" selected>-- Ver Todos los Centros --</option>
                        @foreach($centros_simulados as $index => $centro)
                            <option value="{{ $index }}">{{ $centro['nombre'] }}</option>
                        @endforeach
                    </select>
                </div>

                {{-- 3. EL CONTENEDOR DONDE SE MOSTRARÁ LA TABLA POR CLIENTE --}}
                <div id="detalle-facturacion-entrenadores">
                    <p class="text-muted text-center mt-5">
                        <i class="fa-solid fa-arrow-up"></i> Selecciona un centro para ver las sesiones individuales por cliente.
                    </p>
                </div>
            </div>

            {{-- COLUMNA 3: TOP ENTRENADORES --}}
            <div class="top-col">
                <div class="top-card">
                    <div class="top-header">
                        <i class="fa-solid fa-trophy"></i>
                        TOP Entrenadores (Fact. Total)
                    </div>
                    <div>
                        @php $rank = 1; @endphp
                        @foreach($ranking as $nombre => $facturado)
                            <div class="ranking-item">
                                <div class="trainer-info">
                                    <span class="rank-number">{{ $rank++ }}</span>
                                    {{ $nombre }}
                                </div>
                                <div class="fw-bold">
                                    {{ number_format($facturado, 2, ',', '.') }} €
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            
        </div>
    </main>
</div>

{{-- ================================================= --}}
{{-- LÓGICA JAVASCRIPT --}}
{{-- ================================================= --}}
<script>
    const centrosData = @json($centros_simulados);

    /**
     * Genera la tabla de 31 días y marca los días activos.
     */
    function generarTablaDias(dias) {
        let diasHtml = '';
        for (let i = 1; i <= 31; i++) {
            // Marca con la clase 'sesion-activa' si el día está en la lista
            const clase = dias.includes(i) ? 'sesion-activa' : '';
            diasHtml += `<td class="${clase}"></td>`;
        }

        // Generar encabezados de días (1 a 31)
        let encabezadoDias = '';
        for (let i = 1; i <= 31; i++) {
            encabezadoDias += `<th>${i}</th>`;
        }

        return `
            <div class="detalle-table-container">
                <table class="tabla-dias-sesion">
                    <thead>
                        <tr>${encabezadoDias}</tr>
                    </thead>
                    <tbody>
                        <tr>${diasHtml}</tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Muestra la lista de clientes/sesiones para el centro seleccionado.
     */
    function mostrarDetalleCentro(index) {
        const contenedor = document.getElementById('detalle-facturacion-entrenadores');
        contenedor.innerHTML = ''; 

        if (index === "" || index === null) {
            contenedor.innerHTML = `<p class="text-muted text-center mt-5"><i class="fa-solid fa-arrow-up"></i> Selecciona un centro para ver las sesiones individuales por cliente.</p>`;
            return;
        }

        const centroSeleccionado = centrosData[index];
        let htmlContent = '';

        centroSeleccionado.clientes.forEach(cliente => {
            const diasSesiones = cliente.sesiones_dias;
            const precioTotalFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(cliente.precio_total);
            const precioSesionFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(cliente.precio_sesion);

            // Generar la fila de la tabla de clientes con el calendario
            htmlContent += `
                <div class="centro-card mb-3">
                    <div class="centro-header">
                        <span class="centro-name">
                            <i class="fa-solid fa-user me-2"></i> ${cliente.nombre.toUpperCase()}
                        </span>
                        <span class="badge-total">
                            Total: ${precioTotalFormato} €
                        </span>
                    </div>
                    
                    <div class="p-3">
                        <div class="row align-items-center mb-2 small">
                            <div class="col-2"><span class="fw-bold">Centro:</span> ${centroSeleccionado.nombre}</div>
                            <div class="col-2"><span class="fw-bold">Cobro:</span> ${cliente.tipo_cobro}</div>
                            <div class="col-2"><span class="fw-bold">Precio/Promo:</span> ${precioSesionFormato} €</div>
                            <div class="col-2 text-center"><span class="fw-bold">Ses/Mes:</span> ${cliente.sesiones_mes}</div>
                            <div class="col-2 text-center"><span class="fw-bold">Entrenador:</span> ${cliente.entrenador}</div>
                        </div>

                        <label class="form-label small fw-bold text-muted mt-2">FECHAS SESIONES:</label>
                        ${generarTablaDias(diasSesiones)}
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = htmlContent;
    }
    
    function aplicarFiltro() {
        const fechaDesde = document.getElementById('fecha-desde').value;
        const fechaHasta = document.getElementById('fecha-hasta').value;

        if (fechaDesde && fechaHasta) {
            alert(`Filtro aplicado: Desde ${fechaDesde} hasta ${fechaHasta}.\n\n(En un entorno real, esta acción enviaría estas fechas al servidor para que el controlador filtre los datos de facturación.)`);
            // Código real: Aquí se ejecutaría la lógica de recarga/filtrado de datos
        } else {
            alert("Por favor, selecciona las fechas 'Desde' y 'Hasta'.");
        }
    }
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>