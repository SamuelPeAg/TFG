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
            gap: 15px;
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
                                <td><span class="badge" style="background: #4BB7AE; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">{{ $s->tipo_credito }}</span></td>
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
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-ticket-alt"></i></div>
                <h2 id="modalTitle">Nueva Suscripción</h2>
            </div>
            <form id="formSuscripcion" method="POST">
                @csrf
                <div id="methodField"></div>
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
                        <small>Jerarquía: EP > Dúo > Trío > G. Especial > Grupo</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label-custom">Centro</label>
                        <select name="id_centro" id="s_id_centro" class="form-control-custom">
                            <option value="">Global (Todos)</option>
                            @foreach($centros as $c)
                                <option value="{{ $c->id }}">{{ $c->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label-custom">Créditos a dar</label>
                        <input type="number" name="creditos_por_periodo" id="s_creditos" class="form-control-custom" required min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label-custom">Periodo de Recarga</label>
                        <select name="periodo" id="s_periodo" class="form-control-custom">
                            <option value="semanal">Semanal</option>
                            <option value="mensual">Mensual</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label-custom">Límite Acumulación</label>
                        <input type="number" name="limite_acumulacion" id="s_limite" class="form-control-custom" value="0">
                        <small>0 = sin límite de ahorros</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label-custom">Reset (Meses)</label>
                        <input type="number" name="meses_reset" id="s_reset" class="form-control-custom" min="1" max="12">
                        <small>Caducidad (Máx. 12 meses)</small>
                    </div>
                </div>
                <button type="submit" class="btn-facto">Guardar Configuración</button>
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
    </script>
</body>
</html>
