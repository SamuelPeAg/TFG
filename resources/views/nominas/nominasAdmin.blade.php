<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Nóminas - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>

    <div class="dashboard-container">

        {{-- Asumo que usas el mismo sidebar, o puedes crear uno 'sidebar_nominas' --}}
        @include('components.sidebars.sidebar_entrenadores')

        <main class="main-content">

            <div class="header-controls">
                <div class="title-section">
                    <h1>Gestión de Nóminas</h1>
                </div>
                <div class="controls-bar">
                    {{-- Botón para abrir modal de crear --}}
                    <button id="btnAbrirModal" class="btn-success">
                        <i class="fas fa-file-invoice-dollar"></i> Subir Nómina
                    </button>
                </div>
            </div>

            <div class="content-wrapper">

                {{-- Mensajes Flash --}}
                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul style="margin:0; padding-left: 20px;">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                {{-- TABLA DE NÓMINAS --}}
                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th>Concepto / Mes</th>
                                <th>Importe</th>
                                <th>Documento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($nominas as $nomina)
                            <tr>
                                <td>
                                    {{-- Asumiendo que $nomina tiene relación 'user' o 'entrenador' --}}
                                    <div class="user-info">
                                        <div class="avatar-circle" style="background-color: #e0f2fe; color: #0369a1;">
                                            {{ strtoupper(substr($nomina->user->nombre ?? 'U', 0, 1)) }}
                                        </div>
                                        <div style="display:flex; flex-direction:column;">
                                            <span style="font-weight:600;">{{ $nomina->user->nombre ?? 'Usuario eliminado' }}</span>
                                            <span style="font-size:0.8rem; color:#64748b;">{{ $nomina->user->email ?? '' }}</span>
                                        </div>
                                    </div>
                                </td>
                                
                                <td>
                                    {{-- Ejemplo: "Enero 2024" o el concepto guardado --}}
                                    <span style="font-weight: 500;">{{ ucfirst(\Carbon\Carbon::parse($nomina->fecha_emision)->isoFormat('MMMM YYYY')) }}</span>
                                </td>

                                <td style="font-family: monospace; font-weight: bold; color: #0f172a;">
                                    {{ number_format($nomina->importe, 2, ',', '.') }} €
                                </td>

                                <td>
                                    @if($nomina->archivo_path)
                                        <a href="{{ asset('storage/' . $nomina->archivo_path) }}" target="_blank" class="btn-icon" style="color: #ef4444; text-decoration: none;" title="Ver PDF">
                                            <i class="fas fa-file-pdf fa-lg"></i> Ver PDF
                                        </a>
                                    @else
                                        <span style="color: #94a3b8; font-size: 0.85rem;">Sin archivo</span>
                                    @endif
                                </td>

                                <td>
                                    <div class="action-buttons">
                                        {{-- Botón Editar --}}
                                        <button type="button" class="btn-icon btn-edit" 
                                            onclick="abrirModalEditar(
                                                '{{ $nomina->id }}', 
                                                '{{ $nomina->user_id }}', 
                                                '{{ $nomina->importe }}', 
                                                '{{ $nomina->fecha_emision }}',
                                                '{{ $nomina->concepto }}'
                                            )">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>

                                        {{-- Botón Eliminar --}}
                                        <form action="{{ route('nominas.destroy', $nomina->id) }}" method="POST" 
                                              onsubmit="return confirm('¿Seguro que quieres eliminar esta nómina? El archivo PDF también se borrará.');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn-icon btn-delete">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">
                                    No hay nóminas registradas.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>

    {{-- MODAL CREAR NÓMINA (Lo he puesto aquí directo en lugar de componente para que te funcione ya) --}}
    <div id="modalRegistro" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-file-invoice"></i></div>
                <h2>Nueva Nómina</h2>
                <p>Registra un pago y sube el comprobante.</p>
            </div>

            <form action="{{ route('nominas.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                
                {{-- Selector de Entrenador --}}
                <div class="form-group">
                    <label class="form-label-custom">Entrenador / Empleado</label>
                    <div class="input-group-custom">
                        <i class="fas fa-user"></i>
                        <select name="user_id" class="form-control-custom" required>
                            <option value="">Selecciona un entrenador...</option>
                            @foreach($users as $user)
                                <option value="{{ $user->id }}">{{ $user->nombre }} ({{ $user->email }})</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                {{-- Fecha / Mes --}}
                <div class="form-group">
                    <label class="form-label-custom">Fecha de Emisión</label>
                    <div class="input-group-custom">
                        <i class="fas fa-calendar-alt"></i>
                        <input type="date" name="fecha_emision" class="form-control-custom" required>
                    </div>
                </div>

                {{-- Importe --}}
                <div class="form-group">
                    <label class="form-label-custom">Importe Neto (€)</label>
                    <div class="input-group-custom">
                        <i class="fas fa-euro-sign"></i>
                        <input type="number" step="0.01" name="importe" class="form-control-custom" placeholder="0.00" required>
                    </div>
                </div>

                 {{-- Concepto (Opcional) --}}
                 <div class="form-group">
                    <label class="form-label-custom">Concepto</label>
                    <div class="input-group-custom">
                        <i class="fas fa-tag"></i>
                        <input type="text" name="concepto" class="form-control-custom" placeholder="Ej: Nómina Enero 2024">
                    </div>
                </div>

                {{-- Archivo PDF --}}
                <div class="form-group">
                    <label class="form-label-custom">Archivo PDF</label>
                    <div class="input-group-custom">
                        <i class="fas fa-file-upload"></i>
                        <input type="file" name="archivo" class="form-control-custom" accept=".pdf" required>
                    </div>
                </div>

                <button type="submit" class="btn-facto">Guardar Nómina</button>
            </form>
        </div>
    </div>

    {{-- MODAL EDITAR NÓMINA --}}
    <div id="modalEditar" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-edit"></i></div>
                <h2>Editar Nómina</h2>
                <p>Modifica los datos del pago.</p>
            </div>

            <form id="formEditar" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT') 

                <div class="form-group">
                    <label class="form-label-custom">Entrenador</label>
                    <div class="input-group-custom">
                        <i class="fas fa-user"></i>
                        <select name="user_id" id="edit_user_id" class="form-control-custom" required>
                            @foreach($users as $user)
                                <option value="{{ $user->id }}">{{ $user->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Fecha</label>
                    <div class="input-group-custom">
                        <i class="fas fa-calendar"></i>
                        <input type="date" name="fecha_emision" id="edit_fecha" class="form-control-custom" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Importe (€)</label>
                    <div class="input-group-custom">
                        <i class="fas fa-euro-sign"></i>
                        <input type="number" step="0.01" name="importe" id="edit_importe" class="form-control-custom" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Concepto</label>
                    <div class="input-group-custom">
                        <i class="fas fa-tag"></i>
                        <input type="text" name="concepto" id="edit_concepto" class="form-control-custom">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Sustituir Archivo (Opcional)</label>
                    <div class="input-group-custom">
                        <i class="fas fa-file-pdf"></i>
                        <input type="file" name="archivo" class="form-control-custom" accept=".pdf">
                    </div>
                    <small style="color: #64748b;">Deja en blanco para mantener el archivo actual.</small>
                </div>

                <button type="submit" class="btn-facto">Actualizar Nómina</button>
            </form>
        </div>
    </div>

   <script>
        // --- MODAL CREAR ---
        const modal = document.getElementById('modalRegistro');
        const btnAbrir = document.getElementById('btnAbrirModal');
        const btnCerrar = document.getElementById('btnCerrarModal');

        if(btnAbrir) btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
        if(btnCerrar) btnCerrar.addEventListener('click', () => modal.style.display = 'none');

        // --- MODAL EDITAR ---
        const modalEdit = document.getElementById('modalEditar');
        const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
        const formEdit = document.getElementById('formEditar');

        function abrirModalEditar(id, userId, importe, fecha, concepto) {
            // 1. Rellenar inputs
            document.getElementById('edit_user_id').value = userId;
            document.getElementById('edit_importe').value = importe;
            document.getElementById('edit_fecha').value = fecha;
            document.getElementById('edit_concepto').value = concepto;

            // 2. Generar URL (Asegúrate de tener la ruta 'nominas.update' en web.php)
            let urlBase = "{{ route('nominas.update', 'temp_id') }}";
            let urlFinal = urlBase.replace('temp_id', id);
            
            formEdit.action = urlFinal;

            modalEdit.style.display = 'flex';
        }

        if(btnCerrarEdit) btnCerrarEdit.addEventListener('click', () => modalEdit.style.display = 'none');

        // Cerrar al hacer clic fuera (para ambos modales)
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
            if (e.target === modalEdit) modalEdit.style.display = 'none';
        });
    </script>
</body>
</html>