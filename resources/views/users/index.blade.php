<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestión de Usuarios - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablaCRUD.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <style>
      /* --- Estilos Generales y Tabla --- */
      .check-column { width: 40px; text-align: center; vertical-align: middle; }
      
      .custom-checkbox {
          appearance: none;
          background-color: #fff;
          margin: 0;
          font: inherit;
          color: currentColor;
          width: 20px;
          height: 20px;
          border: 2px solid #CBD5E0;
          border-radius: 6px; 
          display: grid;
          place-content: center;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
      }

      .custom-checkbox::before {
          content: "";
          width: 10px;
          height: 10px;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          transform-origin: center;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      }

      .custom-checkbox:checked {
          background-color: #4BB7AE; 
          border-color: #4BB7AE;
      }

      .custom-checkbox:checked::before {
          transform: scale(1);
      }

      .custom-checkbox:hover {
          border-color: #38a199;
      }

      .group-tag { 
          background: #e6fffa; color: #2c7a7b; 
          padding: 2px 8px; border-radius: 12px; 
          font-size: 0.75em; font-weight: 600; 
          margin-right: 4px; display: inline-block; margin-bottom: 2px; 
          border: 1px solid #b2f5ea;
      }

      /* --- Barra Flotante --- */
      .floating-actions {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
          background: #2D3748; color: white; padding: 15px 30px; border-radius: 50px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 20px;
          z-index: 1000; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0;
      }
      .floating-actions.active { transform: translateX(-50%) translateY(0); opacity: 1; }
      .count-badge { background: #4BB7AE; padding: 2px 8px; border-radius: 10px; font-weight: bold; font-size: 0.9em; }
      
      .btn-group-action {
          background: white; color: #2D3748; border: none; padding: 8px 16px; border-radius: 20px;
          font-weight: bold; cursor: pointer; transition: transform 0.2s;
      }
      .btn-group-action:hover { transform: scale(1.05); background: #f7fafc; }


      /* =========================================
         NUEVOS ESTILOS DE BOTONES (TIPO IMAGEN)
         ========================================= */
      
      /* Contenedor Flex para centrar */
      .controls-bar {
          display: flex;
          justify-content: center; /* Centrado horizontal */
          align-items: center;     /* Centrado vertical */
          gap: 30px;               /* Espacio entre los botones */
          margin-bottom: 30px;
          padding: 10px 0;
      }

      /* Estilo Base para ambos botones (Tamaño y forma) */
      .btn-design {
          width: 180px;            /* Ancho fijo igual para ambos */
          height: 45px;            /* Altura consistente */
          border: none;
          border-radius: 12px;     /* Bordes redondeados como en la imagen */
          color: white;
          font-size: 13px;
          font-weight: 800;        /* Fuente negrita */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          text-decoration: none;
          letter-spacing: 0.5px;
      }

      .btn-design:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
      }

      .btn-design i {
          font-size: 1.1em;
      }

      /* --- Botón 1: VER GRUPOS (Degradado) --- */
      .btn-gradient-custom {
          /* Degradado de Verde Azulado a Rosa/Rojo */
          background: linear-gradient(90deg, #38C1A3 0%, #E65C9C 100%);
          text-transform: uppercase; /* Texto en mayúsculas */
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .btn-gradient-custom:hover {
          filter: brightness(1.1);
      }

      /* --- Botón 2: AÑADIR USUARIO (Sólido) --- */
      .btn-solid-custom {
          /* Color Verde Menta Sólido */
          background-color: #38C1A3; 
          /* Mantiene mayúsculas/minúsculas normal */
      }
      .btn-solid-custom:hover {
          background-color: #32ac91;
      }

  </style>
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
          
          <button onclick="abrirModalGestionGrupos()" class="btn-design btn-gradient-custom" type="button">
            <i class="fas fa-layer-group"></i> <span>VER GRUPOS</span>
          </button>

          <button id="toggleCrearUsuario" class="btn-design btn-solid-custom" type="button">
            <i class="fas fa-plus"></i> <span>Añadir usuario</span>
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

  <div class="floating-actions" id="floatingBar">
      <div>
          <span id="countSelected" class="count-badge">0</span> usuarios seleccionados
      </div>
      <button type="button" class="btn-group-action" onclick="abrirModalGrupo()">
          <i class="fas fa-users"></i> Crear Grupo
      </button>
  </div>

  <div id="modalGrupo" class="modal-overlay" aria-hidden="true">
      <div class="modal-card">
          <button type="button" class="close-btn" onclick="cerrarModalGrupo()">&times;</button>
          <div class="modal-header-custom">
              <div class="logo-simulado"><i class="fas fa-users-cog"></i></div>
              <h2>Nuevo Grupo</h2>
              <p>Agrupa a los usuarios seleccionados.</p>
          </div>
          <form action="{{ route('users.group.store') }}" method="POST">
              @csrf
              <div id="hiddenInputsContainer"></div>

              <div class="form-group">
                  <label class="form-label-custom">Nombre del Grupo</label>
                  <div class="input-group-custom">
                      <i class="fas fa-tag"></i>
                      <input type="text" name="group_name" class="form-control-custom" placeholder="Ej. Clientes VIP" required>
                  </div>
              </div>
              <button type="submit" class="btn-facto">Confirmar Grupo</button>
          </form>
      </div>
  </div>

  <x-modales.gestion-grupos :groups="$groups" />

  <x-modales.crear-usuario />

  <div id="modalEditarUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalEditarUsuario">&times;</button>
      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
        <h2>Editar Usuario</h2>
      </div>
      <form id="formEditarUsuario" method="POST">
        @csrf @method('PUT')
        <div class="form-group"><label class="form-label-custom">Nombre</label><div class="input-group-custom"><i class="fas fa-user"></i><input type="text" name="name" id="edit_name" class="form-control-custom" required readonly></div></div>
        <div class="form-group"><label class="form-label-custom">Email</label><div class="input-group-custom"><i class="fas fa-envelope"></i><input type="email" name="email" id="edit_email" class="form-control-custom" required readonly></div></div>
        <div class="form-group"><label class="form-label-custom">iban</label><div class="input-group-custom"><i class="fas fa-credit-card"></i><input type="text" name="iban" id="edit_iban" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Firma</label><div class="input-group-custom"><i class="fas fa-pen-nib"></i><input type="text" name="firma_digital" id="edit_firma" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Nueva Pass</label><div class="input-group-custom"><i class="fas fa-lock"></i><input type="password" name="password" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Confirmar</label><div class="input-group-custom"><i class="fas fa-check-double"></i><input type="password" name="password_confirmation" class="form-control-custom"></div></div>
        <button type="submit" class="btn-facto">Actualizar</button>
      </form>
    </div>
  </div>

  <script src="{{ asset('js/users.js') }}"></script>
  
</body>
</html>