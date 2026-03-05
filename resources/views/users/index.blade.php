<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestión de Clientes - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
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
          <h1>Gestión de Clientes</h1>
        </div>

        <div class="controls-bar">
          <div class="search-container">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" class="search-input" placeholder="Buscar cliente por nombre o email...">
          </div>

          <button id="toggleCrearUsuario" class="btn-design btn-solid-custom" type="button">
            <i class="fas fa-plus"></i> <span>Añadir cliente</span>
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

        <x-tablas.users-table :users="$users" />
      </div>
    </main>
  </div>

 

  <x-modales.crear-usuario />

  <div id="modalEditarUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalEditarUsuario">&times;</button>
      <div class="modal-header-custom">
        <div id="default_header_icon" class="logo-simulado"><i class="fas fa-user-edit"></i></div>
        
        <!-- Contenedor Foto Perfil (Oculto por defecto) -->
        <div id="photo_header_container" style="display:none; position: relative; width: 100px; height: 100px; margin: 0 auto 15px;">
            <img id="modal_edit_photo_img" src="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid white;">
            
            <button type="button" id="btn_delete_photo_action" style="position: absolute; bottom: 0; right: 0; background: #ef5d7a; color: white; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                <i class="fas fa-trash-alt" style="font-size: 12px;"></i>
            </button>
        </div>

        <h2>Editar Cliente</h2>
      </div>
      <form id="formEditarUsuario" method="POST">
        @csrf @method('PUT')
        
        <input type="checkbox" name="delete_profile_photo" id="delete_profile_photo_input" value="1" style="display:none;">
        
        {{-- 
        <div id="divDeletePhoto" class="form-group" style="display:none; margin-bottom: 15px;">
           ...
        </div> 
        --}}
        <div class="form-group"><label class="form-label-custom">Nombre</label><div class="input-group-custom"><i class="fas fa-user"></i><input type="text" name="name" id="edit_name" class="form-control-custom" placeholder="Nombre completo" required readonly></div></div>
        <div class="form-group"><label class="form-label-custom">Email</label><div class="input-group-custom"><i class="fas fa-envelope"></i><input type="email" name="email" id="edit_email" class="form-control-custom" placeholder="correo@ejemplo.com" required readonly></div></div>
        <div class="form-group"><label class="form-label-custom">IBAN</label><div class="input-group-custom"><i class="fas fa-credit-card"></i><input type="text" name="iban" id="edit_iban" class="form-control-custom" placeholder="ES00 0000 0000 0000 0000 0000"></div></div>
        <div class="form-group"><label class="form-label-custom">Firma Digital</label><div class="input-group-custom"><i class="fas fa-pen-nib"></i><input type="text" name="firma_digital" id="edit_firma" class="form-control-custom" placeholder="Código de firma"></div></div>
        <div class="form-group"><label class="form-label-custom">Nueva Contraseña</label><div class="input-group-custom"><i class="fas fa-lock"></i><input type="password" name="password" class="form-control-custom" placeholder="Nueva contraseña (opcional)"></div></div>
        <div class="form-group"><label class="form-label-custom">Confirmar Contraseña</label><div class="input-group-custom"><i class="fas fa-check-double"></i><input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite la contraseña"></div></div>
        <button type="submit" class="btn-facto">Actualizar</button>
      </form>
    </div>
  </div>

  {{-- Modal de Confirmación de Eliminación --}}
  <div id="modalEliminarUsuario" class="modal-overlay">
    <div class="modal-card" style="max-width: 400px;">
      <button type="button" class="close-btn" onclick="cerrarModalEliminarUsuario()">&times;</button>
      <div class="modal-header-custom">
        <div class="logo-simulado" style="color: #EF5D7A;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style="color: #EF5D7A;">¿Eliminar Cliente?</h2>
        <p>Esta acción no se puede deshacer</p>
      </div>

      <div style="padding: 0 20px 20px; text-align: center;">
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Estás a punto de eliminar a:
        </p>
        <p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 25px;">
          <i class="fas fa-user-circle" style="color: #4BB7AE; margin-right: 8px;"></i>
          <span id="nombreUsuarioEliminar"></span>
        </p>

        <form id="formEliminarUsuario" method="POST" style="display: inline;">
          @csrf
          @method('DELETE')
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button type="button" onclick="cerrarModalEliminarUsuario()" 
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

  <script src="{{ asset('js/users.js') }}"></script>
  <script src="{{ asset('js/users-modal-delete.js') }}"></script>
  
</body>
</html>