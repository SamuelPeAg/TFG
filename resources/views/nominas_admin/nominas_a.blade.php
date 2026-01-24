<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Gestión de Nóminas</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <style>
      /* Reutilizando tus estilos base */
      .header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 10px 0; }
      .title-section h1 { margin: 0; font-size: 1.8rem; color: #333; font-weight: 800; }
      .controls-bar { display: flex; align-items: center; gap: 20px; }

      /* Botones */
      .btn-design { width: auto; min-width: 160px; padding: 0 20px; height: 45px; border: none; border-radius: 12px; color: white; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-decoration: none; }
      .btn-design:hover { transform: translateY(-3px); }
      .btn-solid-custom { background-color: #38C1A3; }
      .btn-solid-custom:hover { background-color: #32ac91; }

      /* Filtros Superiores */
      .filters-container {
          background: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 25px;
          display: flex;
          gap: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
      }
      .filter-input {
          padding: 10px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          color: #4a5568;
          font-size: 0.9rem;
      }
      .filter-input:focus { border-color: #38C1A3; }

      /* Tabla Personalizada (Estilo Users) */
      .table-wrapper { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
      .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; }
      .admin-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; font-weight: 700; }
      .admin-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #333; vertical-align: middle; }
      .admin-table tr:hover td { background-color: #f8fafc; }

      /* Badges y Avatares */
      .coach-info { display: flex; align-items: center; gap: 10px; }
      .avatar-circle { width: 35px; height: 35px; background: #38C1A3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
      
      .status-badge { padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
      .status-paid { background: #d1fae5; color: #059669; }
      .status-pending { background: #fff7ed; color: #c2410c; }

      /* Acciones */
      .action-btn { background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1.1rem; transition: color 0.2s; margin: 0 5px; }
      .action-btn.edit:hover { color: #38C1A3; }
      .action-btn.delete:hover { color: #ef4444; }
      .action-btn.download:hover { color: #3b82f6; }

      /* Modal Estilos (Iguales a tu User Edit) */
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 1000; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
      .modal-overlay.active { display: flex; opacity: 1; pointer-events: auto; }
      .modal-card { background: white; width: 100%; max-width: 500px; border-radius: 20px; padding: 30px; position: relative; transform: translateY(20px); transition: transform 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
      .modal-overlay.active .modal-card { transform: translateY(0); }
      .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
      
      /* Zona de Upload en Modal */
      .upload-area {
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin-bottom: 20px;
          cursor: pointer;
          transition: border-color 0.2s;
          background: #f8fafc;
      }
      .upload-area:hover { border-color: #38C1A3; background: #f0fdfa; }
      .upload-icon { font-size: 2rem; color: #38C1A3; margin-bottom: 10px; }
      
      .form-group { margin-bottom: 15px; }
      .form-label { display: block; margin-bottom: 5px; font-weight: 600; color: #4a5568; font-size: 0.9rem; }
      .form-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
      .form-input:focus { border-color: #38C1A3; }

  </style>
</head>

<body>
  <div class="dashboard-container">
    @include('components.sidebar')

    <main class="main-content">
      
      <div class="header-controls">
        <div class="title-section">
          <h1>Gestión de Nóminas</h1>
        </div>

        <div class="controls-bar">
          <button id="btnAbrirModalNomina" class="btn-design btn-solid-custom" type="button">
            <i class="fas fa-cloud-upload-alt"></i> <span>Subir Nómina</span>
          </button>
        </div>
      </div>

      <div class="content-wrapper">
        
        <div class="filters-container">
            <div style="flex: 1;">
                <input type="text" placeholder="Buscar entrenador..." class="filter-input" style="width: 100%;">
            </div>
            <div>
                <select class="filter-input">
                    <option>Enero 2024</option>
                    <option>Diciembre 2023</option>
                    <option>Noviembre 2023</option>
                </select>
            </div>
            <div>
                 <select class="filter-input">
                    <option>Todos los estados</option>
                    <option>Pagado</option>
                    <option>Pendiente</option>
                </select>
            </div>
        </div>

        <div class="table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th width="50"></th> <th>Entrenador</th>
                        <th>Periodo</th>
                        <th>Importe</th>
                        <th>Estado</th>
                        <th>Documento</th>
                        <th style="text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="checkbox" class="custom-checkbox"></td>
                        <td>
                            <div class="coach-info">
                                <div class="avatar-circle">JP</div>
                                <div>
                                    <div style="font-weight: bold;">Juan Pérez</div>
                                    <div style="font-size: 0.8rem; color: #94a3b8;">juan@factomove.com</div>
                                </div>
                            </div>
                        </td>
                        <td>Enero 2024</td>
                        <td style="font-weight: bold;">1.450,00 €</td>
                        <td><span class="status-badge status-paid">Pagado</span></td>
                        <td><i class="fas fa-file-pdf" style="color: #ef4444; margin-right: 5px;"></i> nomina_ene.pdf</td>
                        <td style="text-align: center;">
                            <button class="action-btn download" title="Descargar"><i class="fas fa-download"></i></button>
                            <button class="action-btn edit" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>

                    <tr>
                        <td><input type="checkbox" class="custom-checkbox"></td>
                        <td>
                            <div class="coach-info">
                                <div class="avatar-circle" style="background: #E65C9C;">MG</div>
                                <div>
                                    <div style="font-weight: bold;">María García</div>
                                    <div style="font-size: 0.8rem; color: #94a3b8;">maria@factomove.com</div>
                                </div>
                            </div>
                        </td>
                        <td>Enero 2024</td>
                        <td style="font-weight: bold;">1.600,00 €</td>
                        <td><span class="status-badge status-pending">Pendiente</span></td>
                        <td><i class="fas fa-file-pdf" style="color: #ef4444; margin-right: 5px;"></i> nomina_ene_maria.pdf</td>
                        <td style="text-align: center;">
                            <button class="action-btn download" title="Descargar"><i class="fas fa-download"></i></button>
                            <button class="action-btn edit" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </main>
  </div>

  <div id="modalSubirNomina" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>
        
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 50px; height: 50px; background: #d1fae5; color: #38C1A3; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 10px;">
                <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <h2 style="margin: 0; color: #333;">Subir Nueva Nómina</h2>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 5px;">Asigna el documento al entrenador correspondiente.</p>
        </div>

        <form action="#" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label class="form-label">Entrenador</label>
                <select class="form-input">
                    <option value="" disabled selected>Selecciona un entrenador...</option>
                    <option value="1">Juan Pérez</option>
                    <option value="2">María García</option>
                </select>
            </div>

            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Mes</label>
                    <select class="form-input">
                        <option>Enero</option>
                        <option>Febrero</option>
                    </select>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Año</label>
                    <select class="form-input">
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Importe Neto (€)</label>
                <input type="number" step="0.01" class="form-input" placeholder="Ej: 1450.00">
            </div>

            <div class="upload-area" id="dropZone">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <h4 style="margin: 0; color: #4a5568;">Arrastra el PDF aquí</h4>
                <p style="margin: 5px 0 0; color: #94a3b8; font-size: 0.8rem;">o haz clic para buscar en tu ordenador</p>
                <input type="file" id="fileInput" style="display: none;" accept=".pdf">
            </div>

            <button type="submit" class="btn-design btn-solid-custom" style="width: 100%;">Subir y Guardar</button>
        </form>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('modalSubirNomina');
        const btnAbrir = document.getElementById('btnAbrirModalNomina');
        const btnCerrar = document.getElementById('btnCerrarModal');
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        // Abrir Modal
        btnAbrir.addEventListener('click', () => {
            modal.classList.add('active');
        });

        // Cerrar Modal
        btnCerrar.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Simulación Click en Dropzone
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Cambio visual al seleccionar archivo
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                dropZone.style.borderColor = '#38C1A3';
                dropZone.style.background = '#f0fdfa';
                dropZone.querySelector('h4').textContent = e.target.files[0].name;
            }
        });
    });
  </script>

</body>
</html>