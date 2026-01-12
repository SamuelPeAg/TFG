<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestión de Usuarios - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>
  <div class="dashboard-container">
    @include('components.sidebars.sidebar_usuarios')

    <main class="main-content">
      <div class="header-controls">
        <div class="title-section">
          <h1>Gestión de Usuarios</h1>
        </div>

        <div class="controls-bar">
          <button id="toggleCrearUsuario" class="btn-success" type="button">
            <i class="fas fa-plus"></i> Añadir usuario
          </button>
        </div>
      </div>

      <div class="content-wrapper">

        {{-- Flash --}}
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

        {{-- Tabla usuarios --}}
        <div class="table-container">
          <table class="facto-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>IBAN</th>
                <th>Firma digital</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              @forelse($users as $user)
                <tr>
                  <td>
                    <div class="user-info">
                      <div class="avatar-circle">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                      </div>
                      <span>{{ $user->name }}</span>
                    </div>
                  </td>

                  <td>{{ $user->email }}</td>
                  <td style="font-family: monospace;">{{ $user->IBAN }}</td>
                  <td style="font-family: monospace;">{{ $user->firma_digital }}</td>

                  <td>
                    <div class="action-buttons">
                      {{-- EDITAR (sin onclick, todo por JS) --}}
                      <button
                        type="button"
                        class="btn-icon btn-edit js-edit-user"
                        data-id="{{ $user->id }}"
                        data-name="{{ $user->name }}"
                        data-email="{{ $user->email }}"
                        data-iban="{{ $user->IBAN }}"
                        data-firma="{{ $user->firma_digital }}"
                      >
                        <i class="fas fa-pencil-alt"></i>
                      </button>

                      {{-- ELIMINAR --}}
                      <form
                        action="{{ route('users.destroy', $user->id) }}"
                        method="POST"
                        onsubmit="return confirm('¿Estás seguro de que deseas eliminar este usuario?');"
                      >
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
                  <td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

      </div>
    </main>
  </div>

  {{-- MODAL CREAR USUARIO --}}
  <div id="modalCrearUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalCrearUsuario" aria-label="Cerrar">&times;</button>

      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-user-plus"></i></div>
        <h2>Crear Usuario</h2>
        <p>Registra un usuario en Factomove.</p>
      </div>

      <form action="{{ route('users.store') }}" method="POST">
        @csrf

        <div class="form-group">
          <label class="form-label-custom">Nombre</label>
          <div class="input-group-custom">
            <i class="fas fa-user"></i>
            <input type="text" name="name" class="form-control-custom" placeholder="Nombre" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Email</label>
          <div class="input-group-custom">
            <i class="fas fa-envelope"></i>
            <input type="email" name="email" class="form-control-custom" placeholder="Email" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Contraseña</label>
          <div class="input-group-custom">
            <i class="fas fa-lock"></i>
            <input type="password" name="password" class="form-control-custom" placeholder="Contraseña" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">IBAN</label>
          <div class="input-group-custom">
            <i class="fas fa-credit-card"></i>
            <input type="text" name="IBAN" class="form-control-custom" placeholder="IBAN">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Firma digital</label>
          <div class="input-group-custom">
            <i class="fas fa-pen-nib"></i>
            <input type="text" name="firma_digital" class="form-control-custom" placeholder="Firma Digital">
          </div>
        </div>

        <button type="submit" class="btn-facto">Crear</button>
      </form>
    </div>
  </div>

  {{-- MODAL EDITAR USUARIO --}}
  <div id="modalEditarUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalEditarUsuario" aria-label="Cerrar">&times;</button>

      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
        <h2>Editar Usuario</h2>
        <p>Actualiza los datos del usuario.</p>
      </div>

      <form id="formEditarUsuario" method="POST">
        @csrf
        @method('PUT')

        <div class="form-group">
          <label class="form-label-custom">Nombre</label>
          <div class="input-group-custom">
            <i class="fas fa-user"></i>
            <input type="text" name="name" id="edit_name" class="form-control-custom" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Email</label>
          <div class="input-group-custom">
            <i class="fas fa-envelope"></i>
            <input type="email" name="email" id="edit_email" class="form-control-custom" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">IBAN</label>
          <div class="input-group-custom">
            <i class="fas fa-credit-card"></i>
            <input type="text" name="IBAN" id="edit_iban" class="form-control-custom">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Firma digital</label>
          <div class="input-group-custom">
            <i class="fas fa-pen-nib"></i>
            <input type="text" name="firma_digital" id="edit_firma" class="form-control-custom">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Nueva contraseña (opcional)</label>
          <div class="input-group-custom">
            <i class="fas fa-lock"></i>
            <input type="password" name="password" class="form-control-custom" placeholder="Dejar en blanco para no cambiar">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label-custom">Confirmar nueva contraseña</label>
          <div class="input-group-custom">
            <i class="fas fa-check-double"></i>
            <input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite si cambiaste">
          </div>
        </div>

        <button type="submit" class="btn-facto">Actualizar</button>
      </form>
    </div>
  </div>

  <script src="{{ asset('js/users.js') }}"></script>
</body>
</html>
