<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mis Nóminas - Factomove</title>
  
  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <style>
      /* --- Estilos específicos para esta vista (puedes moverlos a tu CSS) --- */
      .payroll-dashboard-grid { display: grid; grid-template-columns: 350px 1fr; gap: 25px; margin-bottom: 35px; }
      
      .card-box { 
          background: white; 
          border-radius: 16px; 
          padding: 25px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.04); 
          border: 1px solid rgba(0,0,0,0.02); 
      }

      /* Badges de estado */
      .badge-status { padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }
      .badge-paid { background-color: #d1fae5; color: #059669; }
      .badge-pending { background-color: #fff7ed; color: #c2410c; }

      /* Botón de descarga */
      .btn-download {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: #38C1A3; color: white;
          padding: 12px 20px; border-radius: 10px;
          text-decoration: none; font-weight: bold;
          transition: background 0.3s;
          border: none; cursor: pointer; width: 100%;
      }
      .btn-download:hover { background: #2d9680; }

      /* Tabla */
      .custom-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .custom-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; }
      .custom-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #333; }
      .custom-table tr:hover td { background-color: #f8fafc; }

      /* Responsive */
      @media (max-width: 900px) {
          .payroll-dashboard-grid { grid-template-columns: 1fr; }
      }
      
      /* Alerta de error */
      .alert-error {
          background-color: #fee2e2; border: 1px solid #fecaca; color: #991b1b;
          padding: 15px; border-radius: 8px; margin-bottom: 20px;
      }
  </style>
</head>

<body>
  <div class="dashboard-container">
    
    @include('components.sidebar')

    <main class="main-content" style="padding: 20px;">
      
      <div class="header-controls">
        <h1>Mis Nóminas</h1>
      </div>
      
      @if(session('error'))
        <div class="alert-error">
            <i class="fas fa-exclamation-circle"></i> {{ session('error') }}
        </div>
      @endif

      <div class="content-wrapper">
        
        <div class="payroll-dashboard-grid">
            
            <div class="card-box">
                <div class="filter-group">
                    <label for="mes-selector" style="display:block; margin-bottom:10px; font-weight:bold; color:#4a5568;">
                        <i class="far fa-calendar-alt"></i> Seleccionar Periodo
                    </label>
                    
                    <form action="{{ route('nominas_e') }}" method="GET" id="formFiltro">
                        <select name="nomina_id" id="mes-selector" class="custom-select" style="width:100%; padding:10px; border-radius:8px; border:2px solid #e2e8f0;" onchange="document.getElementById('formFiltro').submit()">
                            @forelse($nominas_e as $nomina)
                                <option value="{{ $nomina->id }}" 
                                    {{ isset($nominaSeleccionada) && $nominaSeleccionada->id == $nomina->id ? 'selected' : '' }}>
                                    
                                    {{-- Formato: Mes/Año - Concepto --}}
                                    {{ $nomina->mes }}/{{ $nomina->anio }} - {{ $nomina->concepto }}
                                </option>
                            @empty
                                <option value="">No hay nóminas disponibles</option>
                            @endforelse
                        </select>
                    </form>
                </div>

                <div style="margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <label style="font-size: 0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">Estado del mes seleccionado:</label>
                    
                    @if(isset($nominaSeleccionada))
                        @if($nominaSeleccionada->estado == 'pagado')
                            <span class="badge-status badge-paid">
                                <i class="fas fa-check-circle"></i> Pagado
                            </span>
                        @else
                            <span class="badge-status badge-pending">
                                <i class="fas fa-clock"></i> Pendiente
                            </span>
                        @endif
                    @else
                        <span style="color:#aaa;">-</span>
                    @endif
                </div>
            </div>

            <div class="card-box" style="display: flex; flex-direction: column; justify-content: center;">
                @if(isset($nominaSeleccionada))
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                        <div>
                            <h3 style="margin:0; font-size:1.3rem; color:#1e293b;">
                                Nómina {{ $nominaSeleccionada->mes }}/{{ $nominaSeleccionada->anio }}
                            </h3>
                            <p style="color:#64748b; margin:5px 0;">{{ $nominaSeleccionada->concepto }}</p>
                            <small style="color:#94a3b8;">
                                Fecha de pago: {{ $nominaSeleccionada->fecha_pago ? $nominaSeleccionada->fecha_pago->format('d/m/Y') : 'Pendiente' }}
                            </small>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.8rem; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Total a percibir</div>
                            <h2 style="margin:0; font-size:2.2rem; font-weight:800; color:#333;">
                                {{ number_format($nominaSeleccionada->importe, 2, ',', '.') }} <span style="color:#38C1A3">€</span>
                            </h2>
                        </div>
                    </div>

                    <div style="margin-top:auto;">
                        <a href="{{ route('nominas_e.descargar', $nominaSeleccionada->id) }}" class="btn-download">
                            <i class="fas fa-download"></i> Descargar PDF
                        </a>
                    </div>
                @else
                    <div style="text-align:center; padding:20px; color:#64748b;">
                        <i class="far fa-folder-open" style="font-size:3rem; margin-bottom:10px; opacity:0.5;"></i>
                        <p>No se ha seleccionado ninguna nómina o no tienes historial.</p>
                    </div>
                @endif
            </div>
        </div>

        <div class="card-box">
            <h3 style="margin:0 0 20px 0; font-size:1.1rem; color:#333; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
                Historial de Pagos
            </h3>
            
            <div style="overflow-x: auto;">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Mes / Año</th>
                            <th>Concepto</th>
                            <th>Fecha de Pago</th>
                            <th style="text-align: right;">Importe Líquido</th>
                            <th style="text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($nominas_e as $nominaItem)
                            <tr>
                                <td><strong>{{ $nominaItem->mes }}/{{ $nominaItem->anio }}</strong></td>
                                <td>{{ $nominaItem->concepto }}</td>
                                <td>
                                    {{ $nominaItem->fecha_pago ? $nominaItem->fecha_pago->format('d/m/Y') : 'Pendiente' }}
                                </td>
                                <td style="text-align: right; font-weight: bold;">
                                    {{ number_format($nominaItem->importe, 2, ',', '.') }} €
                                </td>
                                <td style="text-align: center;">
                                    <a href="{{ route('nominas_e.descargar', $nominaItem->id) }}" title="Descargar PDF" style="color:#38C1A3; font-size:1.2rem; transition:color 0.2s;">
                                        <i class="fas fa-file-pdf"></i>
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 30px; color:#64748b;">
                                    No hay registros de nóminas.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </main>
  </div>
</body>
</html>