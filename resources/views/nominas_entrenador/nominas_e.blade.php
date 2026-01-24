v<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mis Nóminas - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <style>
      /* --- Estilos heredados (Mantengo los tuyos para consistencia) --- */
      .header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 10px 0; }
      .title-section h1 { margin: 0; font-size: 1.8rem; color: #333; font-weight: 800; }
      .controls-bar { display: flex; align-items: center; gap: 20px; }

      /* Botones Base */
      .btn-design { width: auto; min-width: 160px; padding: 0 20px; height: 45px; border: none; border-radius: 12px; color: white; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-decoration: none; letter-spacing: 0.5px; }
      .btn-design:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.15); }
      
      /* Colores Factomove */
      .btn-gradient-custom { background: linear-gradient(90deg, #38C1A3 0%, #E65C9C 100%); text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .btn-solid-custom { background-color: #38C1A3; }
      .btn-solid-custom:hover { background-color: #32ac91; }
      .btn-outline-custom { background-color: white; border: 2px solid #e2e8f0; color: #64748b; }
      .btn-outline-custom:hover { border-color: #38C1A3; color: #38C1A3; }

      /* --- NUEVOS ESTILOS PARA NÓMINAS --- */
      
      /* Grid Superior */
      .payroll-dashboard-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 25px;
          margin-bottom: 35px;
      }

      /* Tarjetas Blancas (Card Box) */
      .card-box {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.02);
      }

      /* Selector de Fecha */
      .filter-group label { display: block; font-weight: 700; color: #4a5568; margin-bottom: 10px; font-size: 0.9rem; }
      .custom-select {
          width: 100%;
          padding: 12px 15px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          font-size: 1rem;
          color: #333;
          background-color: #f8fafc;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
      }
      .custom-select:focus { border-color: #38C1A3; background: white; }

      /* Estado de Pago */
      .status-indicator { margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
      .badge-status {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
      }
      .badge-paid { background-color: #d1fae5; color: #059669; } /* Verde suave */
      .badge-pending { background-color: #fff7ed; color: #c2410c; } /* Naranja suave */

      /* Detalle de Nómina Actual */
      .current-payroll-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
      .payroll-period h3 { margin: 0 0 5px 0; font-size: 1.2rem; color: #1e293b; }
      .payroll-period span { font-size: 0.9rem; color: #64748b; }
      
      .payroll-amount { text-align: right; }
      .label-amount { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
      .value-amount { font-size: 2.2rem; font-weight: 800; color: #333; margin: 0; }
      .currency { color: #38C1A3; } /* Color corporativo para el euro */

      .payroll-actions { display: flex; gap: 15px; margin-top: 15px; }

      /* Tabla Historial (Simulando tablaCRUD.css pero limpia) */
      .table-container { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
      .section-subtitle { margin: 0 0 20px 0; font-size: 1.1rem; color: #333; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; }
      
      .custom-table { width: 100%; border-collapse: collapse; }
      .custom-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
      .custom-table td { padding: 15px; color: #333; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
      .custom-table tr:last-child td { border-bottom: none; }
      .custom-table tr:hover td { background-color: #f8fafc; }
      
      .action-link { color: #38C1A3; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
      .action-link:hover { color: #2d9680; text-decoration: underline; }

      /* Responsive */
      @media (max-width: 900px) {
          .payroll-dashboard-grid { grid-template-columns: 1fr; }
          .header-controls { flex-direction: column; align-items: flex-start; gap: 15px; }
      }
  </style>
</head>

<body>
  <div class="dashboard-container">
    
    @include('components.sidebar')

    <main class="main-content">
      
      <div class="header-controls">
        <div class="title-section">
          <h1>Mis Nóminas</h1>
        </div>

        <div class="controls-bar">
           <button class="btn-design btn-gradient-custom" type="button">
            <i class="fas fa-file-invoice"></i> <span>Certificado IRPF</span>
          </button>
        </div>
      </div>

      <div class="content-wrapper">
        
        <div class="payroll-dashboard-grid">
            
            <div class="card-box">
                <div class="filter-group">
                    <label for="mes-selector"><i class="far fa-calendar-alt"></i> Seleccionar Periodo</label>
                    <select id="mes-selector" class="custom-select">
                        <option value="2024-01" selected>Enero 2024</option>
                        <option value="2023-12">Diciembre 2023</option>
                        <option value="2023-11">Noviembre 2023</option>
                        <option value="2023-10">Octubre 2023</option>
                    </select>
                </div>

                <div class="status-indicator">
                    <label style="font-size: 0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">Estado del mes seleccionado:</label>
                    <span class="badge-status badge-paid">
                        <i class="fas fa-check-circle" style="margin-right: 5px;"></i> Pagado
                    </span>
                </div>
            </div>

            <div class="card-box" style="display: flex; flex-direction: column; justify-content: center;">
                <div class="current-payroll-header">
                    <div class="payroll-period">
                        <h3>Nómina Enero 2024</h3>
                        <span>Periodo de liquidación: 01/01/2024 - 31/01/2024</span>
                    </div>
                    <div class="payroll-amount">
                        <div class="label-amount">Total a percibir</div>
                        <h2 class="value-amount">1.450,00 <span class="currency">€</span></h2>
                    </div>
                </div>

                <div class="payroll-actions">
                    <button class="btn-design btn-solid-custom" style="width: 100%;">
                        <i class="fas fa-eye"></i> <span>Ver Detalle</span>
                    </button>
                    <button class="btn-design btn-outline-custom" style="width: 100%;">
                        <i class="fas fa-download"></i> <span>Descargar PDF</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="table-container">
            <h3 class="section-subtitle">Historial de Pagos</h3>
            
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Concepto</th>
                        <th>Fecha de Pago</th>
                        <th style="text-align: right;">Importe Líquido</th>
                        <th style="text-align: center;">Documento</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Diciembre 2023</strong></td>
                        <td>Nómina Mensual + Extra</td>
                        <td>30/12/2023</td>
                        <td style="text-align: right; font-weight: bold;">1.850,00 €</td>
                        <td style="text-align: center;">
                            <a href="#" class="action-link"><i class="fas fa-file-pdf"></i> PDF</a>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Noviembre 2023</strong></td>
                        <td>Nómina Mensual</td>
                        <td>28/11/2023</td>
                        <td style="text-align: right; font-weight: bold;">1.450,00 €</td>
                        <td style="text-align: center;">
                            <a href="#" class="action-link"><i class="fas fa-file-pdf"></i> PDF</a>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Octubre 2023</strong></td>
                        <td>Nómina Mensual</td>
                        <td>30/10/2023</td>
                        <td style="text-align: right; font-weight: bold;">1.450,00 €</td>
                        <td style="text-align: center;">
                            <a href="#" class="action-link"><i class="fas fa-file-pdf"></i> PDF</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </main>
  </div>
</body>
</html>