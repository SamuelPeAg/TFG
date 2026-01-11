<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link href="{{ asset('css/entrenadores.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        /* --- ESTILOS EXACTOS FACTOMOVE (MANTENIDOS) --- */
        :root {
            --facto-teal: #39c5a7;
            --facto-pink: #eb567a;
            --facto-gray-bg: #f8fafc;
            --facto-text-label: #94a3b8;
        }

        /* Fondo oscuro (Overlay) */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            z-index: 9999;
            justify-content: center;
            align-items: center;
        }

        /* Tarjeta del Modal */
        .modal-card {
            background: white;
            width: 100%;
            max-width: 450px;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            position: relative;
            animation: slideUp 0.3s ease-out;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        /* Encabezado Modal */
        .modal-header-custom { text-align: center; margin-bottom: 25px; }
        
        .logo-simulado {
            font-size: 40px;
            margin-bottom: 10px;
            background: linear-gradient(180deg, var(--facto-pink) 0%, var(--facto-teal) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .modal-header-custom h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
        .modal-header-custom p { color: #64748b; font-size: 14px; margin-top: 5px; }

        /* Formulario */
        .form-label-custom {
            display: block; font-size: 11px; font-weight: 800; color: var(--facto-text-label);
            text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;
        }

        .input-group-custom { position: relative; margin-bottom: 20px; }

        .input-group-custom i {
            position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
            color: var(--facto-pink); font-size: 16px; z-index: 2;
        }

        .form-control-custom {
            width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #e2e8f0;
            border-radius: 10px; background-color: var(--facto-gray-bg);
            font-size: 14px; color: #334155; transition: all 0.3s;
        }

        .form-control-custom:focus {
            outline: none; border-color: var(--facto-teal); background-color: white;
            box-shadow: 0 0 0 3px rgba(57, 197, 167, 0.1);
        }

        /* Botón */
        .btn-facto {
            width: 100%; padding: 14px; border: none; border-radius: 8px;
            background: linear-gradient(90deg, var(--facto-teal) 0%, var(--facto-pink) 100%);
            color: white; font-weight: 800; font-size: 15px; text-transform: uppercase;
            cursor: pointer; box-shadow: 0 4px 15px rgba(235, 86, 122, 0.3);
            transition: transform 0.2s, box-shadow 0.2s; margin-top: 10px;
        }

        .btn-facto:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(235, 86, 122, 0.4); }
        
        .close-btn {
            position: absolute; top: 15px; right: 20px; background: none; border: none;
            font-size: 24px; color: #cbd5e1; cursor: pointer;
        }
        .close-btn:hover { color: #64748b; }

        /* --- ESTILOS PARA LA TABLA DE ENTRENADORES --- */
        .table-container {
            background: white; border-radius: 15px; padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 20px;
            overflow-x: auto;
        }

        .facto-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        
        .facto-table th {
            text-align: left; padding: 15px; font-size: 12px; font-weight: 800;
            color: var(--facto-text-label); text-transform: uppercase; letter-spacing: 0.5px;
            border-bottom: 2px solid #f1f5f9;
        }

        .facto-table td {
            padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;
        }

        .facto-table tr:last-child td { border-bottom: none; }
        
        .user-info { display: flex; align-items: center; gap: 10px; }
        
        .avatar-circle {
            width: 35px; height: 35px; border-radius: 50%;
            background: linear-gradient(135deg, var(--facto-teal), var(--facto-pink));
            color: white; display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 14px;
        }

        /* Botones de acción en la tabla */
        .action-buttons { display: flex; gap: 10px; }
        
        .btn-icon {
            background: none; border: none; cursor: pointer; font-size: 16px;
            transition: color 0.2s; padding: 5px;
        }
        
        .btn-edit { color: var(--facto-teal); }
        .btn-edit:hover { color: #2d9d85; }
        
        .btn-delete { color: var(--facto-pink); }
        .btn-delete:hover { color: #c03555; }

        /* Botón Header */
        .btn-success {
            background: var(--facto-teal); color: white; border: none;
            padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 8px;
        }
        .btn-success:hover { background: #2d9d85; }
        
        .header-controls {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .title-section h1 { font-size: 24px; color: #0f172a; font-weight: 800; }

        /* ALERTAS */
        .alert { padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; }
        .alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert-danger { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    </style>
</head>

<body>

    <div class="dashboard-container">

        @include('components.sidebars.sidebar_entrenadores')

        <main class="main-content">

            <div class="header-controls">
                <div class="title-section">
                    <h1>Gestión de Entrenadores</h1>
                </div>
                <div class="controls-bar">
                    <button id="btnAbrirModal" class="btn-success">
                        <i class="fas fa-plus"></i> Añadir Entrenador
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

                {{-- TABLA INTEGRADA CON EL DISEÑO FACTOMOVE --}}
                <div class="table-container">
                    <table class="facto-table">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th>Email</th>
                                <th>IBAN</th> {{-- Nueva columna --}}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($entrenadores as $entrenador)
                            <tr>
                                <td>
                                    <div class="user-info">
                                        {{-- Generar iniciales para el avatar --}}
                                        <div class="avatar-circle">
                                            {{ strtoupper(substr($entrenador->nombre, 0, 1)) }}
                                        </div>
                                        <span>{{ $entrenador->nombre }}</span>
                                    </div>
                                </td>
                                <td>{{ $entrenador->email }}</td>
                                <td style="font-family: monospace;">{{ $entrenador->iban }}</td>
                                <td>
                                    <div class="action-buttons">
                                        {{-- Botón Editar (Abre Modal JS) --}}
                                        <button type="button" class="btn-icon btn-edit" 
                                            onclick="abrirModalEditar(
                                                '{{ $entrenador->id }}', 
                                                '{{ $entrenador->nombre }}', 
                                                '{{ $entrenador->email }}', 
                                                '{{ $entrenador->iban }}'
                                            )">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>

                                        {{-- Botón Eliminar (Formulario) --}}
                                        <form action="{{ route('entrenadores.destroy', $entrenador->id) }}" method="POST" 
                                              onsubmit="return confirm('¿Estás seguro de que deseas eliminar a este entrenador?');">
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

    {{-- MODAL REGISTRO (CREAR) --}}
    <div id="modalRegistro" class="modal-overlay">
        <div class="modal-card">
            <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-layer-group"></i></div>
                <h2>Añadir Entrenador</h2>
                <p>Registra un profesional en Factomove.</p>
            </div>

            <form action="{{ route('entrenadores.store') }}" method="POST">
                @csrf
                <div class="form-group">
                    <label class="form-label-custom">Nombre Completo</label>
                    <div class="input-group-custom">
                        <i class="fas fa-user"></i>
                        <input type="text" name="nombre" class="form-control-custom" placeholder="Ej. Maria Garcia" required value="{{ old('nombre') }}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label-custom">Correo Electrónico</label>
                    <div class="input-group-custom">
                        <i class="fas fa-envelope"></i>
                        <input type="email" name="email" class="form-control-custom" placeholder="tucorreo@ejemplo.com" required value="{{ old('email') }}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label-custom">IBAN</label>
                    <div class="input-group-custom">
                        <i class="fas fa-credit-card"></i>
                        <input type="text" name="iban" class="form-control-custom" placeholder="ES00 0000..." required value="{{ old('iban') }}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label-custom">Contraseña</label>
                    <div class="input-group-custom">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="password" class="form-control-custom" placeholder="Mínimo 8 caracteres" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label-custom">Confirmar Contraseña</label>
                    <div class="input-group-custom">
                        <i class="fas fa-check-double"></i>
                        <input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite tu contraseña" required>
                    </div>
                </div>
                <button type="submit" class="btn-facto">Crear Entrenador</button>
            </form>
        </div>
    </div>

    {{-- MODAL EDITAR (ACTUALIZAR) --}}
    <div id="modalEditar" class="modal-overlay">
        <div class="modal-card">
            <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>
            <div class="modal-header-custom">
                <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
                <h2>Editar Entrenador</h2>
                <p>Actualiza los datos del profesional.</p>
            </div>

            {{-- El action se rellenará con JS --}}
            <form id="formEditar" method="POST">
                @csrf
                @method('PUT') 

                <div class="form-group">
                    <label class="form-label-custom">Nombre Completo</label>
                    <div class="input-group-custom">
                        <i class="fas fa-user"></i>
                        <input type="text" name="nombre" id="edit_nombre" class="form-control-custom" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">Correo Electrónico</label>
                    <div class="input-group-custom">
                        <i class="fas fa-envelope"></i>
                        <input type="email" name="email" id="edit_email" class="form-control-custom" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label-custom">IBAN</label>
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
        // --- LÓGICA MODAL REGISTRO ---
        const modal = document.getElementById('modalRegistro');
        const btnAbrir = document.getElementById('btnAbrirModal');
        const btnCerrar = document.getElementById('btnCerrarModal');

        if(btnAbrir) btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
        if(btnCerrar) btnCerrar.addEventListener('click', () => modal.style.display = 'none');

        // --- LÓGICA MODAL EDITAR ---
        const modalEdit = document.getElementById('modalEditar');
        const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
        const formEdit = document.getElementById('formEditar');

        // Función corregida para generar la URL perfectamente
        function abrirModalEditar(id, nombre, email, iban) {
            // 1. Rellenar inputs
            document.getElementById('edit_nombre').value = nombre;
            document.getElementById('edit_email').value = email;
            document.getElementById('edit_iban').value = iban;

            // 2. Generar URL segura
            // Usamos 'temp_id' como marcador de posición que NO será codificado extrañamente
            let urlBase = "{{ route('entrenadores.update', 'temp_id') }}";
            
            // 3. Reemplazar 'temp_id' por el ID real
            let urlFinal = urlBase.replace('temp_id', id);
            
            // 4. Asignar al formulario
            formEdit.action = urlFinal;

            // 5. Mostrar modal
            modalEdit.style.display = 'flex';
        }

        if(btnCerrarEdit) btnCerrarEdit.addEventListener('click', () => modalEdit.style.display = 'none');

        // Cerrar al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
            if (e.target === modalEdit) modalEdit.style.display = 'none';
        });
    </script>
</body>
</html>