<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <style>
        .form-control-custom[readonly] {
            background-color: #e2e8f0; 
            color: #718096;            
            cursor: not-allowed;       
            border-color: #cbd5e0;
        }
        .header-controls {
            display: flex;
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 30px;
            padding: 10px 0;
        }

        .title-section h1 {
            margin: 0;
            font-size: 1.8rem;
            color: #333;
            font-weight: 800; 
        }

        .controls-bar {
            display: flex;
            align-items: center;
            gap: 20px;
        }

       
        .btn-design {
            height: 45px;            
            padding: 0 25px;
            border: none;
            border-radius: 12px;     
            color: white;
            font-size: 13px;
            font-weight: 800;        
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-decoration: none;
            letter-spacing: 0.5px;
            text-transform: uppercase; 
        }

        .btn-solid-custom {
            background-color: #38C1A3; 
        }

        .btn-solid-custom:hover {
            background-color: #32ac91;
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.15);
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
                    <h1>Gestión de Entrenadores</h1>
                </div>

                <div class="controls-bar">
                    <button id="btnAbrirModal" class="btn-design btn-solid-custom">
                        <i class="fas fa-plus"></i> <span>Añadir Entrenador</span>
                    </button>
                </div>

            </div>

            <div class="content-wrapper">

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

                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th>Email</th>
                                <th>iban</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($entrenadores as $entrenador)
                            <tr>
                                <td data-label="Entrenador">
                                    <div class="user-info">
                                        <div class="avatar-circle">
                                            {{ strtoupper(substr($entrenador->name, 0, 1)) }}
                                        </div>
                                        <span>{{ $entrenador->name }}</span>
                                    </div>
                                </td>
                                <td data-label="Email">{{ $entrenador->email }}</td>
                                <td data-label="IBAN" style="font-family: monospace;">{{ $entrenador->iban }}</td>
                                <td data-label="Acciones">
                                    <div class="action-buttons">
                                        @php
                                            $u = \App\Models\User::where('email', $entrenador->email)->first();
                                            $isAdmin = ($u && method_exists($u,'hasRole') && $u->hasRole('admin')) ? '1' : '0';
                                        @endphp
                                        <button type="button" class="btn-icon btn-edit" 
                                            onclick="abrirModalEditar(
                                                '{{ $entrenador->id }}', 
                                                '{{ $entrenador->name }}', 
                                                '{{ $entrenador->email }}', 
                                                '{{ $entrenador->iban }}',
                                                '{{ $isAdmin }}'
                                            )">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>

                                        <button type="button" class="btn-icon btn-delete" 
                                            onclick="abrirModalEliminar('{{ $entrenador->id }}', '{{ $entrenador->name }}')">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">
                                    No hay entrenadores registrados aún.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>

    <x-modales.crear-entrenador />

    {{-- Modal de Confirmación de Eliminación --}}
    <div id="modalEliminar" class="modal-overlay">
        <div class="modal-card" style="max-width: 400px;">
            <button type="button" class="close-btn" onclick="cerrarModalEliminar()">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado" style="color: #EF5D7A;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #EF5D7A;">¿Eliminar Entrenador?</h2>
                <p>Esta acción no se puede deshacer</p>
            </div>

            <div style="padding: 0 20px 20px; text-align: center;">
                <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                    Estás a punto de eliminar a:
                </p>
                <p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 25px;">
                    <i class="fas fa-user-circle" style="color: #4BB7AE; margin-right: 8px;"></i>
                    <span id="nombreEntrenadorEliminar"></span>
                </p>

                <form id="formEliminar" method="POST" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="button" onclick="cerrarModalEliminar()" 
                            style="padding: 12px 24px; border-radius: 10px; border: 1px solid #ddd; background: #f5f5f5; color: #555; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                            Cancelar
                        </button>
                        <button type="submit" 
                            style="padding: 12px 24px; border-radius: 10px; border: none; background: linear-gradient(90deg, #EF5D7A, #ff6b8a); color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 93, 122, 0.3); transition: all 0.2s;">
                            <i class="fas fa-trash-alt" style="margin-right: 6px;"></i>
                            Sí, Eliminar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="modalEditar" class="modal-overlay">
        <div class="modal-card">
            <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
                <h2>Editar Entrenador</h2>
                <p>Actualiza los datos del profesional.</p>
            </div>

            <form id="formEditar" method="POST">
                @csrf
                @method('PUT') 

                <div class="form-group">
                    <label class="form-label-custom">Nombre Completo</label>
                    <div class="input-group-custom">
                        <i class="fas fa-user"></i>
                        <input type="text" name="nombre" id="edit_nombre" class="form-control-custom" required readonly>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Correo Electrónico</label>
                    <div class="input-group-custom">
                        <i class="fas fa-envelope"></i>
                        <input type="email" name="email" id="edit_email" class="form-control-custom" required readonly>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">iban</label>
                    <div class="input-group-custom">
                        <i class="fas fa-credit-card"></i>
                        <input type="text" name="iban" id="edit_iban" class="form-control-custom" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Nueva Contraseña (Opcional)</label>
                    <div class="input-group-custom">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="password" class="form-control-custom" placeholder="Dejar en blanco para no cambiar">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Confirmar Nueva Contraseña</label>
                    <div class="input-group-custom">
                        <i class="fas fa-check-double"></i>
                        <input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite solo si cambiaste arriba">
                    </div>
                </div>

                <button type="submit" class="btn-facto">Actualizar Datos</button>
            </form>
        </div>
    </div>

    <script>
        const modal = document.getElementById('modalRegistro');
        const btnAbrir = document.getElementById('btnAbrirModal');
        const btnCerrar = document.getElementById('btnCerrarModal');

        if(btnAbrir) btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
        if(btnCerrar) btnCerrar.addEventListener('click', () => modal.style.display = 'none');

        const modalEdit = document.getElementById('modalEditar');
        const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
        const formEdit = document.getElementById('formEditar');

        function abrirModalEditar(id, nombre, email, iban, isAdmin) {
            document.getElementById('edit_nombre').value = nombre;
            document.getElementById('edit_email').value = email;
            document.getElementById('edit_iban').value = iban;

            let urlBase = "{{ route('entrenadores.update', 'temp_id') }}";
            let urlFinal = urlBase.replace('temp_id', id);
            
            formEdit.action = urlFinal;

            if(document.getElementById('edit_make_admin')) {
                document.getElementById('edit_make_admin').checked = (isAdmin == '1');
            }

            modalEdit.style.display = 'flex';
        }

        if(btnCerrarEdit) btnCerrarEdit.addEventListener('click', () => modalEdit.style.display = 'none');

        // Funciones para modal de eliminación
        function abrirModalEliminar(id, nombre) {
            document.getElementById('nombreEntrenadorEliminar').textContent = nombre;
            
            let urlBase = "{{ route('entrenadores.destroy', 'temp_id') }}";
            let urlFinal = urlBase.replace('temp_id', id);
            
            document.getElementById('formEliminar').action = urlFinal;
            document.getElementById('modalEliminar').style.display = 'flex';
        }

        function cerrarModalEliminar() {
            document.getElementById('modalEliminar').style.display = 'none';
        }

        // Cerrar modal al hacer click fuera
        document.getElementById('modalEliminar')?.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalEliminar();
            }
        });
    </script>
</body>
</html>