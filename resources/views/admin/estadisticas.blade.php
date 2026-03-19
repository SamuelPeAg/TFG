<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadísticas Admin - Factomove</title>
    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* Ajuste de escala global para la vista */
        .main-content {
            font-size: 0.85rem; /* Reducimos la base de fuente */
        }

        .main-content h1 { font-size: 1.5rem; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: white;
            padding: 15px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-soft);
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid var(--color-turquesa);
            transition: transform 0.3s ease;
            cursor: pointer;
        }

        .stat-card:hover {
            transform: translateY(-3px);
        }

        .stat-card.pink { border-left-color: var(--color-rojo-claro); }
        .stat-card.green { border-left-color: var(--color-verde-claro); }
        .stat-card.gray { border-left-color: var(--color-gris); }

        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: white;
            background: var(--color-turquesa);
        }

        .stat-card.pink .stat-icon { background: var(--color-rojo-claro); }
        .stat-card.green .stat-icon { background: var(--color-verde-claro); color: var(--color-texto-oscuro); }
        .stat-card.gray .stat-icon { background: var(--color-gris); }

        .stat-info h3 {
            font-size: 0.75rem;
            color: var(--color-gris);
            margin: 0;
            text-transform: uppercase;
        }

        .stat-info p {
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--color-texto-oscuro);
            margin: 0;
        }

        .charts-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .chart-card {
            background: white;
            padding: 15px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-soft);
            max-height: 500px;
            display: flex;
            flex-direction: column;
        }

        .chart-card canvas {
            max-height: 380px !important;
            width: 100% !important;
        }

        .chart-card h2 {
            font-size: 1rem;
            margin-bottom: 15px;
            color: var(--color-texto-oscuro);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .table th, .table td {
            padding: 8px 12px;
            font-size: 0.8rem;
        }

        @media (max-width: 1024px) {
            .charts-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        @include('components.sidebar.sidebar_admin')

        <main class="main-content">
            <div class="header-controls">
                <div class="title-section">
                    <h1>Panel de Estadísticas</h1>
                </div>
            </div>

            <!-- KPIs -->
            <div class="stats-grid">
                <a href="{{ route('users.index') }}" class="stat-card" style="text-decoration: none;">
                    <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-info">
                        <h3>Clientes Totales</h3>
                        <p>{{ $totalClientes }}</p>
                    </div>
                </a>
                <a href="{{ route('entrenadores.index') }}" class="stat-card pink" style="text-decoration: none;">
                    <div class="stat-icon"><i class="fa-solid fa-dumbbell"></i></div>
                    <div class="stat-info">
                        <h3>Entrenadores</h3>
                        <p>{{ $totalEntrenadores }}</p>
                    </div>
                </a>
                <a href="{{ route('facturas') }}" class="stat-card green" style="text-decoration: none;">
                    <div class="stat-icon"><i class="fa-solid fa-euro-sign"></i></div>
                    <div class="stat-info">
                        <h3>Ingresos del Mes</h3>
                        <p>{{ number_format($ingresosMes, 2) }}€</p>
                    </div>
                </a>
                <a href="{{ route('calendario') }}" class="stat-card gray" style="text-decoration: none;">
                    <div class="stat-icon"><i class="fa-solid fa-calendar-check"></i></div>
                    <div class="stat-info">
                        <h3>Sesiones del Mes</h3>
                        <p>{{ $sesionesMes }}</p>
                    </div>
                </a>
            </div>

            <!-- Gráficos -->
            <div class="charts-container">
                <div class="chart-card">
                    <h2><i class="fa-solid fa-chart-line"></i> Ingresos Mensuales (Últimos 6 meses)</h2>
                    <canvas id="revenueChart" height="100"></canvas>
                </div>
                <div class="chart-card">
                    <h2><i class="fa-solid fa-chart-pie"></i> Clases más Populares</h2>
                    <canvas id="classesChart"></canvas>
                </div>
            </div>

            <div class="charts-container" style="grid-template-columns: 1fr 1fr;">
                <div class="chart-card">
                    <h2><i class="fa-solid fa-house-medical"></i> Sesiones por Centro</h2>
                    <canvas id="centerChart" height="150"></canvas>
                </div>
                <div class="chart-card">
                    <h2><i class="fa-solid fa-clock-rotate-left"></i> Últimos Movimientos</h2>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Clase</th>
                                    <th>Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($ultimosPagos as $pago)
                                <tr>
                                    <td>{{ $pago->fecha_registro->format('d/m H:i') }}</td>
                                    <td>{{ $pago->user->name ?? 'N/A' }}</td>
                                    <td>{{ $pago->nombre_clase }}</td>
                                    <td>{{ number_format($pago->importe, 2) }}€</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Configuración de colores
        const colors = {
            turquesa: '#4BB7AE',
            rosa: '#EF5D7A',
            verdeClaro: '#A5EFE2',
            gris: '#959697',
            texto: '#53565A'
        };

        // Gráfico de Ingresos
        const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: {!! json_encode($ingresos6Meses->pluck('mes')) !!},
                datasets: [{
                    label: 'Ingresos (€)',
                    data: {!! json_encode($ingresos6Meses->pluck('total')) !!},
                    borderColor: colors.turquesa,
                    backgroundColor: 'rgba(75, 183, 174, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: colors.turquesa
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        bodyFont: { size: 14 },
                        titleFont: { size: 16 }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { color: colors.gris, font: { size: 12 } } 
                    },
                    x: { 
                        ticks: { color: colors.gris, font: { size: 12 } } 
                    }
                }
            }
        });

        // Gráfico de Clases Populares
        const ctxClasses = document.getElementById('classesChart').getContext('2d');
        new Chart(ctxClasses, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode($popularidadClases->pluck('nombre_clase')) !!},
                datasets: [{
                    data: {!! json_encode($popularidadClases->pluck('total')) !!},
                    backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro, colors.gris, '#FFCE56'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: colors.texto,
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        } 
                    },
                    tooltip: {
                        bodyFont: { size: 14 }
                    }
                }
            }
        });

        // Gráfico de Centros
        const ctxCenter = document.getElementById('centerChart').getContext('2d');
        new Chart(ctxCenter, {
            type: 'bar',
            data: {
                labels: {!! json_encode($sesionesPorCentro->pluck('centro')) !!},
                datasets: [{
                    label: 'Sesiones',
                    data: {!! json_encode($sesionesPorCentro->pluck('total')) !!},
                    backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        bodyFont: { size: 14 }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: { font: { size: 12 } }
                    },
                    x: { 
                        ticks: { color: colors.gris, font: { size: 12 } } 
                    }
                }
            }
        });
    </script>
</body>
</html>
