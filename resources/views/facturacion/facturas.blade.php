<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Sesiones Individuales</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    

    <style>
        :root {
            --custom-teal: #5BA8A0;
            --custom-teal-dark: #4A8F88;
            --custom-teal-light: #E0F2F1;
            --custom-text-teal: #00695C;
        }

        .facturacion-dashboard {
            padding: 20px;
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 25px;
            min-height: 600px; 
        }

        .btn-big-teal {
            background-color: white;
            border: 1px solid var(--custom-teal-light);
            color: var(--custom-text-teal);
            width: 100%;
            height: 150px;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s, background-color 0.2s;
            cursor: pointer;
        }

        .btn-big-teal:hover {
            background-color: var(--custom-teal-light);
            transform: translateY(-2px);
            color: var(--custom-text-teal);
        }

        .btn-big-teal i {
            font-size: 2rem;
            margin-bottom: 8px;
            color: var(--custom-teal);
        }

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
        
        .detalle-table-container {
            overflow-x: auto;
            max-width: 100%;
        }
        .tabla-dias-sesion {
            width: 100%;
            min-width: 1000px;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 0.7rem;
            margin-top: 10px;
        }
        .tabla-dias-sesion th {
            text-align: center;
            padding: 3px 2px;
            font-weight: 500;
            background-color: #e9ecef;
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
            background-color: #FF5757;
            color: white;
            font-weight: bold;
        }
        
        /* Estilo para el resumen de entrenador DENTRO del detalle de centro */
        .trainer-summary-card {
            border: 1px solid #ddd;
            margin-top: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
            background-color: #f7f7f7;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .trainer-summary-header {
            font-weight: bold;
            font-size: 0.9rem;
            color: #333;
        }
        /* Nueva clase para la lista de entrenadores */
        .trainer-list-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }
        /* --- helpers de texto --- */
        .text-white { color: #fff !important; }
        .text-muted { color: rgba(0,0,0,.55) !important; }
        .text-center { text-align: center !important; }
        .small { font-size: .875rem !important; }

        /* --- spacing (solo los que usas) --- */
        .mb-0 { margin-bottom: 0 !important; }
        .mb-2 { margin-bottom: .5rem !important; }
        .mb-3 { margin-bottom: 1rem !important; }
        .mb-4 { margin-bottom: 1.5rem !important; }
        .mt-2 { margin-top: .5rem !important; }
        .mt-5 { margin-top: 3rem !important; }

        .me-1 { margin-right: .25rem !important; }
        .me-2 { margin-right: .5rem !important; }

        .w-100 { width: 100% !important; }

        /* --- flex helpers --- */
        .align-items-end { align-items: flex-end !important; }
        .align-items-center { align-items: center !important; }

        /* --- grid (row + columnas col-2 / col-4) --- */
        .row {
        display: flex;
        flex-wrap: wrap;
        margin-left: -8px;
        margin-right: -8px;
        }

        .row > [class^="col-"] {
        padding-left: 8px;
        padding-right: 8px;
        }

        .col-2 { flex: 0 0 auto; width: 16.6667%; }
        .col-4 { flex: 0 0 auto; width: 33.3333%; }

        /* gaps g-2 (solo el que usas) */
        .g-2 { gap: .5rem; }

        /* --- labels --- */
        .form-label {
        display: inline-block;
        margin-bottom: .35rem;
        font-weight: 600;
        }

        /* --- inputs (por si no heredan de tu global) --- */
        .form-control {
        width: 100%;
        padding: .55rem .8rem;
        border-radius: 10px;
        border: 1px solid rgba(0,0,0,0.16);
        background: #fff;
        font-size: .95rem;
        }

        .form-control-sm {
        padding: .45rem .7rem;
        font-size: .875rem;
        }

        /* --- SELECT bonito (el “Carlos”) --- */
        .form-select {
        width: 100%;
        padding: .6rem 2.2rem .6rem .9rem;
        border-radius: 10px;
        border: 1px solid rgba(0,0,0,0.16);
        background-color: #fff;
        color: #333;
        font-size: .95rem;
        line-height: 1.2;

        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;

        /* flecha del select */
        background-image:
            linear-gradient(45deg, transparent 50%, #666 50%),
            linear-gradient(135deg, #666 50%, transparent 50%);
        background-position:
            calc(100% - 18px) 50%,
            calc(100% - 12px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
        }

        .form-select:focus,
        .form-control:focus {
        outline: none;
        border-color: var(--custom-teal);
        box-shadow: 0 0 0 3px rgba(91,168,160,.25);
        }

        /* --- fw-bold --- */
        .fw-bold { font-weight: 700 !important; }

        /* --- badge (por si usas .badge) --- */
        .badge {
        display: inline-flex;
        align-items: center;
        padding: .35rem .65rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: .85rem;
        line-height: 1;
        }


    </style>
</head>
<body>

@php
    $centros_simulados = [
        [
            'nombre' => 'CLINICA',
            'clientes' => [
                ['nombre' => 'Moises Godoy', 'entrenador' => 'Carlos', 'tipo_cobro' => 'TPV', 'precio_sesion' => 25.00, 'sesiones_mes' => 4, 'sesiones_dias' => [4, 6, 22, 24], 'precio_total' => 100.00, 'centro' => 'CLINICA'],
                ['nombre' => 'EMILIO Diaz', 'entrenador' => 'Carlos', 'tipo_cobro' => 'TPV', 'precio_sesion' => 25.00, 'sesiones_mes' => 4, 'sesiones_dias' => [4, 6, 22, 26], 'precio_total' => 100.00, 'centro' => 'CLINICA'],
                ['nombre' => 'Jose Albornoz', 'entrenador' => 'Ana', 'tipo_cobro' => 'TPV', 'precio_sesion' => 32.00, 'sesiones_mes' => 2, 'sesiones_dias' => [4, 6], 'precio_total' => 64.00, 'centro' => 'CLINICA'],
                ['nombre' => 'Ana Salto', 'entrenador' => 'Ana', 'tipo_cobro' => 'TPV', 'precio_sesion' => 30.00, 'sesiones_mes' => 1, 'sesiones_dias' => [4], 'precio_total' => 30.00, 'centro' => 'CLINICA']
            ]
        ],
        [
            'nombre' => 'AIRA',
            'clientes' => [
                ['nombre' => 'Luis Perez', 'entrenador' => 'Laura', 'tipo_cobro' => 'BIZUM', 'precio_sesion' => 45.00, 'sesiones_mes' => 4, 'sesiones_dias' => [2, 9, 16, 23], 'precio_total' => 180.00, 'centro' => 'AIRA'],
                ['nombre' => 'Elena Soto', 'entrenador' => 'Carlos', 'tipo_cobro' => 'TPV', 'precio_sesion' => 35.00, 'sesiones_mes' => 3, 'sesiones_dias' => [3, 10, 17], 'precio_total' => 105.00, 'centro' => 'AIRA']
            ]
        ],
        [
            'nombre' => 'OPEN',
            'clientes' => [
                ['nombre' => 'Pedro Jimenez', 'entrenador' => 'Ana', 'tipo_cobro' => 'TRANSFERENCIA', 'precio_sesion' => 28.00, 'sesiones_mes' => 8, 'sesiones_dias' => [1, 2, 8, 9, 15, 16, 22, 23], 'precio_total' => 224.00, 'centro' => 'OPEN'],
                ['nombre' => 'Sofia Vidal', 'entrenador' => 'Laura', 'tipo_cobro' => 'BIZUM', 'precio_sesion' => 30.00, 'sesiones_mes' => 4, 'sesiones_dias' => [5, 12, 19, 26], 'precio_total' => 120.00, 'centro' => 'OPEN']
            ]
        ],
        [
            'nombre' => 'VIRTUAL',
            'clientes' => [
                ['nombre' => 'Laura García', 'entrenador' => 'Laura', 'tipo_cobro' => 'BIZUM', 'precio_sesion' => 40.00, 'sesiones_mes' => 5, 'sesiones_dias' => [1, 5, 10, 15, 20], 'precio_total' => 200.00, 'centro' => 'VIRTUAL']
            ]
        ]
    ];

    $ranking_y_sesiones = [];
    $entrenadores_unicos = [];
    foreach($centros_simulados as $centro) {
        foreach($centro['clientes'] as $cliente) {
            $nombre = $cliente['entrenador'];
            if (!isset($ranking_y_sesiones[$nombre])) {
                $ranking_y_sesiones[$nombre] = ['facturacion' => 0, 'sesiones' => 0];
                $entrenadores_unicos[$nombre] = $nombre;
            }
            $ranking_y_sesiones[$nombre]['facturacion'] += $cliente['precio_total'];
            $ranking_y_sesiones[$nombre]['sesiones'] += $cliente['sesiones_mes'];
        }
    }
    
    $ranking = array_map(fn($item) => $item['facturacion'], $ranking_y_sesiones);
    arsort($ranking);
    ksort($entrenadores_unicos);
@endphp

<div class="dashboard-container">
    @include('components.sidebars.sidebar_facturacion')

    <main class="main-content">
        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>
        </div>

        <div class="facturacion-dashboard">
            
            <div class="action-col">
                <button class="btn-big-teal">
                    <i class="fa-solid fa-file-invoice"></i>
                    <span>Generar Reporte<br>Global</span>
                </button>
            </div>

            <div class="centros-stack">
                
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

                <div class="card p-3 shadow-sm">
                    <label for="centro-selector" class="form-label fw-bold" style="color: var(--custom-text-teal);">
                        <i class="fa-solid fa-location-dot me-2"></i>Selecciona el Centro
                    </label>
                    <select class="form-select" id="centro-selector" onchange="mostrarDetalleCentro(this.value)">
                        <option value="todos" selected>-- TODOS LOS CENTROS --</option> 
                        @foreach($centros_simulados as $index => $centro)
                            <option value="{{ $index }}">{{ $centro['nombre'] }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="card p-3 shadow-sm">
                    <label for="entrenador-selector" class="form-label fw-bold" style="color: var(--custom-text-teal);">
                        <i class="fa-solid fa-person-running me-2"></i>Selecciona el Entrenador
                    </label>
                    <select class="form-select" id="entrenador-selector" onchange="mostrarDetalleEntrenador(this.value)">
                        <option value="" selected>-- Ver Todos los Entrenadores --</option>
                        @foreach($entrenadores_unicos as $entrenador)
                            <option value="{{ $entrenador }}">{{ $entrenador }}</option>
                        @endforeach
                    </select>
                </div>

                <div id="detalle-facturacion">
                    <p class="text-muted text-center mt-5">
                        <i class="fa-solid fa-arrow-up"></i> Selecciona un centro o un entrenador para ver los detalles de facturación.
                    </p>
                </div>
            </div>

        </div>
    </main>
</div>

<script>
    const centrosData = @json($centros_simulados);
    const rankingYsesionesData = @json($ranking_y_sesiones);

    // Esta función ya no se usa en el detalle de centro, pero se mantiene si se necesita en otro contexto
    function generarTablaDias(dias) {
        let diasHtml = '';
        for (let i = 1; i <= 31; i++) {
            const clase = dias.includes(i) ? 'sesion-activa' : '';
            diasHtml += `<td class="${clase}"></td>`;
        }
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
     * Muestra la facturación agrupada SOLAMENTE por entrenador para el centro (o todos) seleccionado.
     */
    function mostrarDetalleCentro(index) {
        const contenedor = document.getElementById('detalle-facturacion');
        const selectorEntrenador = document.getElementById('entrenador-selector');

        contenedor.innerHTML = ''; 
        selectorEntrenador.value = "";

        if (index === "") {
            contenedor.innerHTML = `<p class="text-muted text-center mt-5"><i class="fa-solid fa-arrow-up"></i> Selecciona un centro o un entrenador para ver los detalles de facturación.</p>`;
            return;
        }

        let clientesDelCentro = [];
        let tituloResumen = "";
        let totalCentroFacturacion = 0;

        if (index === "todos") {
            tituloResumen = "TODOS LOS CENTROS";
            centrosData.forEach(centro => {
                clientesDelCentro.push(...centro.clientes);
                centro.clientes.forEach(cliente => {
                    totalCentroFacturacion += cliente.precio_total;
                });
            });
        } else {
            const centroSeleccionado = centrosData[index];
            tituloResumen = "CENTRO: " + centroSeleccionado.nombre;
            clientesDelCentro = centroSeleccionado.clientes;
            clientesDelCentro.forEach(cliente => {
                totalCentroFacturacion += cliente.precio_total;
            });
        }
        
        const totalFacturacionFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(totalCentroFacturacion);
        
        // 1. AGRUPAR CLIENTES POR ENTRENADOR Y SUMAR TOTALES
        const facturacionPorEntrenador = {};
        clientesDelCentro.forEach(cliente => {
            const entrenador = cliente.entrenador;
            if (!facturacionPorEntrenador[entrenador]) {
                facturacionPorEntrenador[entrenador] = {
                    total: 0,
                    sesiones: 0
                };
            }
            facturacionPorEntrenador[entrenador].total += cliente.precio_total;
            facturacionPorEntrenador[entrenador].sesiones += cliente.sesiones_mes;
        });
        
        let htmlContent = `
            <div class="centro-card mb-4" style="border: 2px solid var(--custom-teal);">
                <div class="centro-header" style="background-color: var(--custom-teal-dark); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <span class="centro-name text-white">
                        <i class="fa-solid fa-building me-2"></i> RESUMEN ${tituloResumen.toUpperCase()}
                    </span>
                    <span class="badge-total" style="background-color: white; color: var(--custom-text-teal);">
                        TOTAL GLOBAL: ${totalFacturacionFormato} €
                    </span>
                </div>
                <div class="p-3 small text-muted">
                    <p class="mb-2"><i class="fa-solid fa-info-circle me-1"></i> Resumen de la facturación por entrenador en ${tituloResumen}.</p>
                </div>
            </div>
            
            <div class="trainer-list-container">
        `;

        // 2. ITERAR POR ENTRENADOR Y MOSTRAR SOLO EL RESUMEN
        for (const [entrenador, data] of Object.entries(facturacionPorEntrenador)) {
            const totalEntrenadorFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(data.total);

            htmlContent += `
                <div class="trainer-summary-card card shadow-sm">
                    <div class="trainer-summary-header">
                        <i class="fa-solid fa-person-running me-2" style="color: var(--custom-text-teal);"></i> 
                        ENTRENADOR: ${entrenador.toUpperCase()}
                    </div>
                    <div class="d-flex gap-2 align-items-center">
                        <span class="badge badge-total" style="background-color: #d1e7dd; color: #0f5132;">
                            SESIONES: ${data.sesiones}
                        </span>
                        <span class="badge-total" style="background-color: var(--custom-teal-light); color: var(--custom-text-teal);">
                            FACTURACIÓN: ${totalEntrenadorFormato} €
                        </span>
                    </div>
                </div>
            `;
        }
        
        htmlContent += `</div>`; // Cierre trainer-list-container


        contenedor.innerHTML = htmlContent;
    }
    
    // El filtro por entrenador lateral se mantiene, mostrando el detalle por cliente
    function mostrarDetalleEntrenador(entrenador) {
        const contenedor = document.getElementById('detalle-facturacion');
        const selectorCentro = document.getElementById('centro-selector');

        contenedor.innerHTML = ''; 
        selectorCentro.value = "todos";

        if (entrenador === "" || entrenador === null) {
            contenedor.innerHTML = `<p class="text-muted text-center mt-5"><i class="fa-solid fa-arrow-up"></i> Selecciona un centro o un entrenador para ver los detalles de facturación.</p>`;
            return;
        }

        const datosEntrenador = rankingYsesionesData[entrenador];
        const totalFacturacion = datosEntrenador.facturacion;
        const totalSesiones = datosEntrenador.sesiones;

        const totalFacturacionFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(totalFacturacion);

        let clientesDelEntrenador = [];
        centrosData.forEach(centro => {
            centro.clientes.forEach(cliente => {
                if (cliente.entrenador === entrenador) {
                    clientesDelEntrenador.push(cliente); 
                }
            });
        });

        let htmlContent = `
            <div class="centro-card mb-4" style="border: 2px solid var(--custom-teal);">
                <div class="centro-header" style="background-color: var(--custom-teal-dark); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <span class="centro-name text-white">
                        <i class="fa-solid fa-person-running me-2"></i> RESUMEN ENTRENADOR: ${entrenador.toUpperCase()}
                    </span>
                    <div class="d-flex gap-2 align-items-center">
                        <span class="badge badge-total" style="background-color: white; color: var(--custom-text-teal); padding: 5px 15px;">
                            SESIONES TOTALES: ${totalSesiones}
                        </span>
                        <span class="badge badge-total" style="background-color: white; color: var(--custom-text-teal);">
                            TOTAL GLOBAL: ${totalFacturacionFormato} €
                        </span>
                    </div>
                </div>
                <div class="p-3 small text-muted">
                    <p class="mb-2"><i class="fa-solid fa-info-circle me-1"></i> Se muestran todos los clientes asociados a este entrenador en todos los centros.</p>
                </div>
            </div>
        `;

        clientesDelEntrenador.forEach(cliente => {
            const diasSesiones = cliente.sesiones_dias;
            const precioTotalFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(cliente.precio_total);
            const precioSesionFormato = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(cliente.precio_sesion);
            
            htmlContent += `
                <div class="centro-card mb-3">
                    <div class="centro-header" style="background-color: #f0fff0;">
                        <span class="centro-name" style="color: #4A8F88;">
                            <i class="fa-solid fa-user me-2"></i> CLIENTE: ${cliente.nombre.toUpperCase()}
                        </span>
                        <span class="badge-total">
                            Total Cliente: ${precioTotalFormato} €
                        </span>
                    </div>
                    
                    <div class="p-3">
                        <div class="row align-items-center mb-2 small">
                            <div class="col-2"><span class="fw-bold">Centro:</span> ${cliente.centro}</div>
                            <div class="col-2"><span class="fw-bold">Cobro:</span> ${cliente.tipo_cobro}</div>
                            <div class="col-2"><span class="fw-bold">Precio/Ses:</span> ${precioSesionFormato} €</div>
                            <div class="col-2 text-center"><span class="fw-bold">Ses/Mes:</span> ${cliente.sesiones_mes}</div>
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
        } else {
            alert("Por favor, selecciona las fechas 'Desde' y 'Hasta'.");
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        mostrarDetalleCentro('todos');
    });
</script>


</body>
</html>