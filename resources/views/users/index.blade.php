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
          width: 180px;            
          height: 45px;            
          border: none;
          border-radius: 12px;     
          color: white;
          font-size: 13px;
          font-weight: 800;        
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

      .btn-gradient-custom {
          background: linear-gradient(90deg, #38C1A3 0%, #E65C9C 100%);
          text-transform: uppercase; 
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .btn-gradient-custom:hover {
          filter: brightness(1.1);
      }

      .btn-solid-custom {
          background-color: #38C1A3; 
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