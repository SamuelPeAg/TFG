<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    {{-- Layout original --}}
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    
    {{-- FontAwesome --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    {{-- Bootstrap 5 --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        /* COLOR PERSONALIZADO (Turquesa de la imagen) */
        :root {
            --custom-teal: #5BA8A0;       /* Color principal del botón */
            --custom-teal-dark: #4A8F88;  /* Color hover */
            --custom-teal-light: #E0F2F1; /* Fondo clarito de los totales */
            --custom-text-teal: #00695C;  /* Texto oscuro de los totales */
        }

        /* LAYOUT DE 3 COLUMNAS */
        .facturacion-dashboard {
            padding: 20px;
            display: grid;
            /* Col 1: Botón (220px) | Col 2: Centros (Flexible) | Col 3: Top (300px) */
            grid-template-columns: 220px 1fr 300px; 
            gap: 25px;
            min-height: 600px; /* Altura mínima para que se vea bien */
        }

        /* --- COLUMNA 1: BOTÓN GIGANTE --- */
        .btn-big-teal {
            background-color: var(--custom-teal);
            border: none;
            color: white;
            width: 100%;
            height: 400px; /* Altura fija similar a la imagen */
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.3rem;
            box-shadow: 0 4px 10px rgba(91, 168, 160, 0.3);
            transition: transform 0.2s;
            cursor: pointer;
        }

        .btn-big-teal:hover {
            background-color: var(--custom-teal-dark);
            transform: translateY(-3px);
            color: white;
        }

        .btn-big-teal i {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        /* --- COLUMNA 2: LISTA DE CENTROS --- */
        .centros-stack {
            display: flex;
            flex-direction: column; /* Uno debajo del otro */
            gap: 20px;
        }

        .centro-card {
            background: #fff;
            border-radius: 10px;
            border: 1px solid #eee;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            overflow: hidden;
        }

        .centro-header {
            background: #f8f9fa;
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .centro-name {
            font-weight: 700;
            color: #333;
            font-size: 1rem;
        }

        .badge-total {
            background-color: var(--custom-teal-light);
            color: var(--custom-text-teal);
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .table-custom td {
            padding: 12px 20px;
            vertical-align: middle;
            border-bottom: 1px solid #f5f5f5;
        }
        .table-custom tr:last-child td { border-bottom: none; }

        /* --- COLUMNA 3: TOP ENTRENADORES --- */
        .top-card {
            background: white;
            border-radius: 10px;
            border: 1px solid #eee;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            height: fit-content;
        }
        
        .top-header {
            background: #333; /* Oscuro como contraste */
            color: white;
            padding: 15px;
            border-radius: 10px 10px 0 0;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ranking-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .ranking-item:last-child { border-bottom: none; }
        
        .rank-number {
            background: var(--custom-teal);
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.8rem;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .trainer-info { display: flex; align-items: center; }
        .gold-trophy { color: #FFD700; }
        .silver-trophy { color: #C0C0C0; }
        .bronze-trophy { color: #CD7F32; }

    </style>
</head>
<body>

{{-- DATOS EXACTOS DE TU IMAGEN --}}
@php
    $centros_simulados = [
        [
            'nombre' => 'Centro A',
            'entrenadores' => [
                ['nombre' => 'Carlos', 'facturado' => 1250.50],
                ['nombre' => 'Ana', 'facturado' => 980.00],
            ]
        ],
        [
            'nombre' => 'Centro B',
            'entrenadores' => [
                ['nombre' => 'Laura', 'facturado' => 3450.75],
                ['nombre' => 'Carlos', 'facturado' => 1250.50],
            ]
        ],
        [
            'nombre' => 'Centro C',
            'entrenadores' => [
                ['nombre' => 'Elena', 'facturado' => 800.00],
                ['nombre' => 'Carlos', 'facturado' => 1250.50],
            ]
        ]
    ];

    // LÓGICA PARA CALCULAR EL TOP DE ENTRENADORES (Acumulado)
    $ranking = [];
    foreach($centros_simulados as $centro) {
        foreach($centro['entrenadores'] as $entrenador) {
            $nombre = $entrenador['nombre'];
            if (!isset($ranking[$nombre])) {
                $ranking[$nombre] = 0;
            }
            $ranking[$nombre] += $entrenador['facturado'];
        }
    }
    // Ordenar de mayor a menor
    arsort($ranking);
@endphp

<div class="dashboard-container">
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

            {{-- COLUMNA 2: CENTROS UNO DEBAJO DE OTRO --}}
            <div class="centros-stack">
                @foreach($centros_simulados as $centro)
                    @php
                        // Calcular total del centro actual
                        $total_centro = array_sum(array_column($centro['entrenadores'], 'facturado'));
                    @endphp

                    <div class="centro-card">
                        <div class="centro-header">
                            <span class="centro-name">{{ $centro['nombre'] }}</span>
                            <span class="badge-total">
                                {{ number_format($total_centro, 2, ',', '.') }} €
                            </span>
                        </div>
                        <table class="table table-borderless table-custom mb-0">
                            @foreach($centro['entrenadores'] as $entrenador)
                                <tr>
                                    <td>
                                        <i class="fa-solid fa-user" style="color: #666; margin-right: 8px;"></i>
                                        {{ $entrenador['nombre'] }}
                                    </td>
                                    <td class="text-end fw-bold">
                                        {{ number_format($entrenador['facturado'], 2, ',', '.') }} €
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                @endforeach
            </div>

            {{-- COLUMNA 3: TOP ENTRENADORES (NUEVO) --}}
           
    </main>
</div>

</body>
</html>