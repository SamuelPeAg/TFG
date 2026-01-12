<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Entrenadores - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
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