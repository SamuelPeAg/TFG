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
                                <th>iban</th>
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

    {{-- MODAL REGISTRO (CREAR) - AHORA COMO COMPONENTE --}}
    <x-modales.crear-entrenador />

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

                @if(auth()->check() && auth()->user()->hasRole('admin'))
                <div class="form-group" style="margin-top:10px;">
                    <label class="form-label-custom">Dar rol de admin</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" name="make_admin" id="edit_make_admin" value="1">
                        <small>Marcar para dar/quitar rol <strong>admin</strong></small>
                    </div>
                </div>
                @endif

                <button type="submit" class="btn-facto">Actualizar Datos</button>
            </form>
        </div>
    </div>

   <script>
        // --- LÓGICA MODAL REGISTRO ---
        // El componente x-modales.crear-entrenador renderiza el HTML con ID 'modalRegistro' y 'btnCerrarModal'
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
        function abrirModalEditar(id, nombre, email, iban, isAdmin) {
            // 1. Rellenar inputs
            document.getElementById('edit_nombre').value = nombre;
            document.getElementById('edit_email').value = email;
            document.getElementById('edit_iban').value = iban;

            // 2. Generar URL segura
            let urlBase = "{{ route('entrenadores.update', 'temp_id') }}";
            let urlFinal = urlBase.replace('temp_id', id);
            
            // 3. Asignar al formulario
            formEdit.action = urlFinal;

            // 4. Marcar checkbox si el entrenador ya tiene rol admin
            if(document.getElementById('edit_make_admin')) {
                document.getElementById('edit_make_admin').checked = (isAdmin == '1');
            }

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