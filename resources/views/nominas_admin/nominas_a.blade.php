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
      /* --- Estilos mantenidos de tu diseño --- */
      .header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 10px 0; }
      .title-section h1 { margin: 0; font-size: 1.8rem; color: #333; font-weight: 800; }
      .controls-bar { display: flex; align-items: center; gap: 20px; }

      .btn-design { width: auto; min-width: 160px; padding: 0 20px; height: 45px; border: none; border-radius: 12px; color: white; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-decoration: none; }
      .btn-design:hover { transform: translateY(-3px); }
      .btn-solid-custom { background-color: #38C1A3; }
      .btn-solid-custom:hover { background-color: #32ac91; }

      .filters-container { background: white; padding: 20px; border-radius: 16px; margin-bottom: 25px; display: flex; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); }
      .filter-input { padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; color: #4a5568; font-size: 0.9rem; }
      .filter-input:focus { border-color: #38C1A3; }

      .table-wrapper { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
      .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; }
      .admin-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; font-weight: 700; }
      .admin-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #333; vertical-align: middle; }
      .admin-table tr:hover td { background-color: #f8fafc; }

      .coach-info { display: flex; align-items: center; gap: 10px; }
      .avatar-circle { width: 35px; height: 35px; background: #38C1A3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
      
      .status-badge { padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
      .status-paid { background: #d1fae5; color: #059669; }
      .status-pending { background: #fff7ed; color: #c2410c; }

      .action-btn { background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1.1rem; transition: color 0.2s; margin: 0 5px; }
      .action-btn.edit:hover { color: #38C1A3; }
      .action-btn.delete:hover { color: #ef4444; }
      .action-btn.download:hover { color: #3b82f6; }

      /* Modal */
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 1000; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
      .modal-overlay.active { display: flex; opacity: 1; pointer-events: auto; }
      .modal-card { background: white; width: 100%; max-width: 500px; border-radius: 20px; padding: 30px; position: relative; transform: translateY(20px); transition: transform 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
      .modal-overlay.active .modal-card { transform: translateY(0); }
      .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
      
      .upload-area { border: 2px dashed #cbd5e0; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px; cursor: pointer; transition: border-color 0.2s; background: #f8fafc; }
      .upload-area:hover { border-color: #38C1A3; background: #f0fdfa; }
      .upload-icon { font-size: 2rem; color: #38C1A3; margin-bottom: 10px; }
      
      .form-group { margin-bottom: 15px; }
      .form-label { display: block; margin-bottom: 5px; font-weight: 600; color: #4a5568; font-size: 0.9rem; }
      .form-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
      .form-input:focus { border-color: #38C1A3; }
      
      /* Alertas */
      .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; }
      .alert-success { background: #d1fae5; color: #065f46; }
      .alert-error { background: #fee2e2; color: #991b1b; }
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

        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif
        @if(session('error'))
            <div class="alert alert-error">{{ session('error') }}</div>
        @endif

        @if($errors->any())
            <div class="alert alert-error">
                <ul style="margin:0; padding-left:20px;">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        
        <div class="filters-container">
            <div style="flex: 1;">
                <input type="text" placeholder="Buscar entrenador..." class="filter-input" style="width: 100%;">
            </div>
            <div>
                <select class="filter-input">
                    <option>2024</option>
                    <option>2023</option>
                </select>
            </div>
        </div>

        <div class="table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th width="50">#</th> 
                        <th>Entrenador</th>
                        <th>Periodo</th>
                        <th>Importe</th>
                        <th>Estado</th>
                        <th>Documento</th>
                        <th style="text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($historial as $nomina)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                <div class="coach-info">
                                    <div class="avatar-circle">
                                        {{ substr($nomina->user->name ?? '?', 0, 2) }}
                                    </div>
                                    <div>
                                        <div style="font-weight: bold;">
                                            {{ $nomina->user->name ?? 'Usuario Eliminado' }}
                                        </div>
                                        <div style="font-size: 0.8rem; color: #94a3b8;">
                                            {{ $nomina->user->email ?? '-' }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {{-- Convertir número de mes a texto --}}
                                @php
                                    $meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                                    $nombreMes = $meses[$nomina->mes - 1] ?? 'Mes ' . $nomina->mes;
                                @endphp
                                {{ $nombreMes }} {{ $nomina->anio }}
                            </td>
                            <td style="font-weight: bold;">{{ number_format($nomina->importe, 2, ',', '.') }} €</td>
                            <td>
                                <span class="status-badge status-paid">Pagado</span>
                            </td>
                            <td>
                                <i class="fas fa-file-pdf" style="color: #ef4444; margin-right: 5px;"></i> 
                                {{ $nomina->concepto }}
                            </td>
                            <td style="text-align: center;">
                                <a href="{{ asset('storage/' . $nomina->archivo_path) }}" target="_blank" class="action-btn download" title="Ver PDF">
                                    <i class="fas fa-eye"></i>
                                </a>

                                <form action="{{ route('admin.nominas.destroy', $nomina->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('¿Seguro que quieres eliminar esta nómina?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="action-btn delete" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" style="text-align:center; padding: 30px; color: #888;">
                                No hay nóminas subidas todavía.
                            </td>
                        </tr>
                    @endforelse
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

        <form action="{{ route('admin.nominas.store') }}" method="POST" enctype="multipart/form-data">
            @csrf

            <div class="form-group">
                <label class="form-label">Entrenador</label>
                <select name="user_id" class="form-input" required>
                    <option value="" disabled selected>Selecciona un entrenador...</option>
                    @foreach($entrenadores as $user)
                        <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
                    @endforeach
                </select>
            </div>

            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Mes</label>
                    <select name="mes" class="form-input">
                        @php
                            $meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                        @endphp
                        @foreach($meses as $index => $mes)
                            <option value="{{ $index + 1 }}" {{ date('n') == ($index + 1) ? 'selected' : '' }}>
                                {{ $mes }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Año</label>
                    <input type="number" name="anio" value="{{ date('Y') }}" class="form-input">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Concepto (Opcional)</label>
                <input type="text" name="concepto" class="form-input" placeholder="Ej: Nómina Enero">
            </div>

            <div class="form-group">
                <label class="form-label">Importe Neto (€)</label>
                <input type="number" name="importe" step="0.01" class="form-input" placeholder="Ej: 1450.00" required>
            </div>

            <div class="upload-area" id="dropZone">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <h4 style="margin: 0; color: #4a5568;">Arrastra el PDF aquí</h4>
                <p style="margin: 5px 0 0; color: #94a3b8; font-size: 0.8rem;">o haz clic para buscar</p>
                <input type="file" name="archivo" id="fileInput" style="display: none;" accept=".pdf" required>
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
        if(btnAbrir) {
            btnAbrir.addEventListener('click', () => { modal.classList.add('active'); });
        }

        // Cerrar Modal
        if(btnCerrar) {
            btnCerrar.addEventListener('click', () => { modal.classList.remove('active'); });
        }

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