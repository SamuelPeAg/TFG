<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Suscripciones - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .modal-section-title {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #9CA3AF;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .modal-section-title i {
            color: #4BB7AE;
        }
        .info-box {
            background: #F9FAFB;
            padding: 1.5rem;
            border-radius: 1.5rem;
            border: 1px solid #F3F4F6;
            margin-bottom: 1.5rem;
        }
        .badge-tipo {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }
    </style>
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
            <div class="header-controls">
                <div class="title-section">
                    <h1>Gestión de Suscripciones</h1>
                </div>

                <div class="controls-bar">
                    <div class="search-container" style="position: relative; flex: 1; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #9CA3AF;"></i>
                        <input type="text" id="searchSuscripciones" class="search-input" placeholder="Buscar por nombre o tipo..." style="padding-left: 45px; width: 100%; height: 45px; border-radius: 12px; border: 1px solid #E5E7EB; outline: none; transition: border-color 0.2s;">
                    </div>
                    <button onclick="abrirModalCrearSuscripcion()" class="btn-design btn-solid-custom">
                        <i class="fas fa-plus"></i> <span>Añadir Suscripción</span>
                    </button>
                </div>
            </div>

            <div class="content-wrapper">
                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif
                
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo Clase</th>
                                <th>Centro</th>
                                <th>Créditos/Periodo</th>
                                <th>Límite</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($suscripciones as $s)
                            <tr>
                                <td>{{ $s->nombre }}</td>
                                <td>
                                    <span class="badge-tipo" style="background: {{ str_contains(strtolower($s->tipo_credito), 'ep') ? '#EF5D7A' : '#4BB7AE' }}; color: white;">
                                        {{ ucfirst($s->tipo_credito) }}
                                    </span>
                                </td>
                                <td>{{ $s->centro ? $s->centro->nombre : 'Global' }}</td>
                                <td>{{ $s->creditos_por_periodo }} / {{ $s->periodo }}</td>
                                <td>{{ $s->limite_acumulacion ?: 'Sin límite' }}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon btn-edit" 
                                                onclick='abrirModalEditarSuscripcion({!! json_encode($s) !!})'>
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>
                                        <form action="{{ route('suscripciones.destroy', $s->id) }}" method="POST" onsubmit="return confirm('¿Eliminar esta suscripción?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn-icon btn-delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="6" style="text-align:center">No hay suscripciones creadas.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Modal Crear/Editar -->
    <div id="modalSuscripcion" class="modal-overlay" style="display:none">
        <div class="modal-card">
            <button class="close-btn" onclick="cerrarModal()">&times;</button>
            <div class="modal-header-custom p-8 text-center bg-gray-50/50">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <i class="fas fa-crown text-2xl text-brandTeal"></i>
                </div>
                <h2 id="modalTitle" class="text-2xl font-black text-gray-900">Nueva Suscripción</h2>
                <p class="text-gray-500 text-sm mt-1">Configura las reglas de créditos para tus alumnos.</p>
            </div>
            <form id="formSuscripcion" method="POST" class="p-8">
                @csrf
                <div id="methodField"></div>
                
                <div class="modal-section-title">
                    <i class="fas fa-info-circle"></i> Información General
                </div>
                <div class="form-group">
                    <label class="form-label-custom">Nombre de la Suscripción</label>
                    <input type="text" name="nombre" id="s_nombre" class="form-control-custom" placeholder="Ej: Bono Mensual EP" required>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label-custom">Tipo de Clase/Servicio</label>
                        <select name="tipo_credito" id="s_tipo_credito" class="form-control-custom" required>
                            <option value="">-- Selecciona Tipo --</option>
                            @foreach($tipos_permitidos as $tipo)
                                <option value="{{ $tipo }}">{{ ucfirst($tipo) }}</option>
                            @endforeach
                        </select>
                        <small class="text-xs text-gray-400 block mt-1">Jerarquía: EP > Privado > Dúo > Trío > Especial > Grupo</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label-custom">Centro asignado</label>
                        <select name="id_centro" id="s_id_centro" class="form-control-custom">
                            <option value="">Global (Válido para todos)</option>
                            @foreach($centros as $c)
                                <option value="{{ $c->id }}">{{ $c->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Ciclo de Créditos</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label-custom">¿Cuántos créditos dar?</label>
                            <input type="number" name="creditos_por_periodo" id="s_creditos" class="form-control-custom" required min="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">¿Cuándo se entregan?</label>
                            <select name="periodo" id="s_periodo" class="form-control-custom">
                                <option value="semanal">Semanal (Cada Domingo noche)</option>
                                <option value="mensual">Mensual (Día 1 de cada mes)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-section-title mt-6">
                    <i class="fas fa-clock-rotate-left"></i> Ahorro y Caducidad
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label-custom">Límite de Ahorro (Acumulación)</label>
                        <input type="number" name="limite_acumulacion" id="s_limite" class="form-control-custom" value="0">
                        <small class="text-xs text-gray-400">Máximo de créditos que el usuario puede guardar (0 = sin límite).</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label-custom">Periodo de Caducidad</label>
                        <select name="meses_reset" id="s_reset" class="form-control-custom">
                            <option value="1">1 Mes (Solo el mes actual)</option>
                            <option value="2">2 Meses</option>
                            <option value="3">3 Meses</option>
                            <option value="6">6 Meses</option>
                            <option value="12">1 Año</option>
                            <option value="0">Nunca caducan (Siempre se acumulan)</option>
                        </select>
                        <small class="text-xs text-gray-400">Tiempo máximo de validez de los créditos.</small>
                    </div>
                </div>
                <button type="submit" class="btn-facto w-full">Guardar Configuración</button>
            </form>
        </div>
    </div>

    <script>
        function abrirModalCrearSuscripcion() {
            document.getElementById('modalTitle').innerText = 'Nueva Suscripción';
            document.getElementById('formSuscripcion').action = "{{ route('suscripciones.store') }}";
            document.getElementById('methodField').innerHTML = '';
            document.getElementById('formSuscripcion').reset();
            document.getElementById('modalSuscripcion').style.display = 'flex';
        }

        function abrirModalEditarSuscripcion(s) {
            document.getElementById('modalTitle').innerText = 'Editar Suscripción';
            document.getElementById('formSuscripcion').action = "/suscripciones/" + s.id;
            document.getElementById('methodField').innerHTML = '<input type="hidden" name="_method" value="PUT">';
            
            document.getElementById('s_nombre').value = s.nombre;
            document.getElementById('s_tipo_credito').value = s.tipo_credito;
            document.getElementById('s_id_centro').value = s.id_centro || '';
            document.getElementById('s_creditos').value = s.creditos_por_periodo;
            document.getElementById('s_periodo').value = s.periodo;
            document.getElementById('s_limite').value = s.limite_acumulacion;
            document.getElementById('s_reset').value = s.meses_reset || '';
            
            document.getElementById('modalSuscripcion').style.display = 'flex';
        }

        function cerrarModal() {
            document.getElementById('modalSuscripcion').style.display = 'none';
        }

        // Buscador reactivo
        document.getElementById('searchSuscripciones').addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            const rows = document.querySelectorAll('.facto-table tbody tr');

            rows.forEach(row => {
                if (row.cells.length < 2) return; // Saltarse "no hay suscripciones"
                const name = row.cells[0].innerText.toLowerCase();
                const type = row.cells[1].innerText.toLowerCase();
                
                if (name.includes(query) || type.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>
