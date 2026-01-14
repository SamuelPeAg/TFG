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
      /* --- CHECKBOXES BONITOS Y REDONDITOS --- */
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

      /* --- ETIQUETAS DE GRUPO EN TABLA --- */
      .group-tag { 
          background: #e6fffa; color: #2c7a7b; 
          padding: 2px 8px; border-radius: 12px; 
          font-size: 0.75em; font-weight: 600; 
          margin-right: 4px; display: inline-block; margin-bottom: 2px; 
          border: 1px solid #b2f5ea;
      }

      /* --- BARRA FLOTANTE --- */
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

        <div class="controls-bar" style="display: flex; gap: 10px;">
          <button onclick="abrirModalGestionGrupos()" class="btn-facto" style="background-color: #2D3748; display: flex; align-items: center; gap: 8px;" type="button">
            <i class="fas fa-layer-group"></i> <span>Ver Grupos</span>
          </button>

          <button id="toggleCrearUsuario" class="btn-success" type="button">
            <i class="fas fa-plus"></i> Añadir usuario
          </button>
        </div>
      </div>

      <div class="content-wrapper">

        {{-- Flash Messages --}}
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

        {{-- COMPONENTE DE TABLA DE USUARIOS --}}
<x-tablas.users-table :users="$users" />
      </div>
    </main>
  </div>

  {{-- 1. BARRA FLOTANTE (CREAR GRUPO) --}}
  <div class="floating-actions" id="floatingBar">
      <div>
          <span id="countSelected" class="count-badge">0</span> usuarios seleccionados
      </div>
      <button type="button" class="btn-group-action" onclick="abrirModalGrupo()">
          <i class="fas fa-users"></i> Crear Grupo
      </button>
  </div>

  {{-- 2. MODAL CREAR NUEVO GRUPO --}}
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

  {{-- 3. COMPONENTE MODAL GESTIONAR GRUPOS (NUEVA UBICACIÓN) --}}
  <x-modales.gestion-grupos :groups="$groups" />

  {{-- 4. MODAL CREAR USUARIO --}}
{{-- 4. MODAL CREAR USUARIO --}}
  <div id="modalCrearUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalCrearUsuario">&times;</button>
      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-user-plus"></i></div>
        <h2>Crear Usuario</h2>
      </div>
      <form action="{{ route('users.store') }}" method="POST">
        @csrf
        
        {{-- CAMPO NOMBRE --}}
        <div class="form-group">
            <label class="form-label-custom">Nombre</label>
            <div class="input-group-custom">
                <i class="fas fa-user"></i>
                <input type="text" name="name" class="form-control-custom" placeholder="Ej. Juan Pérez" required>
            </div>
        </div>

        {{-- CAMPO EMAIL --}}
        <div class="form-group">
            <label class="form-label-custom">Email</label>
            <div class="input-group-custom">
                <i class="fas fa-envelope"></i>
                <input type="email" name="email" class="form-control-custom" placeholder="usuario@email.com" required>
            </div>
        </div>

        {{-- CAMPO PASS --}}
        <div class="form-group">
            <label class="form-label-custom">Pass</label>
            <div class="input-group-custom">
                <i class="fas fa-lock"></i>
                <input type="password" name="password" class="form-control-custom" placeholder="********" required>
            </div>
        </div>

        {{-- CAMPO IBAN --}}
        <div class="form-group">
            <label class="form-label-custom">IBAN</label>
            <div class="input-group-custom">
                <i class="fas fa-credit-card"></i>
                <input type="text" name="IBAN" class="form-control-custom" placeholder="ES00 0000 0000 0000...">
            </div>
        </div>

        {{-- CAMPO FIRMA --}}
        <div class="form-group">
            <label class="form-label-custom">Firma</label>
            <div class="input-group-custom">
                <i class="fas fa-pen-nib"></i>
                <input type="text" name="firma_digital" class="form-control-custom" placeholder="Código de firma...">
            </div>
        </div>

        <button type="submit" class="btn-facto">Crear</button>
      </form>
    </div>
  </div>

  {{-- 5. MODAL EDITAR USUARIO --}}
  <div id="modalEditarUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
      <button type="button" class="close-btn" id="btnCerrarModalEditarUsuario">&times;</button>
      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
        <h2>Editar Usuario</h2>
      </div>
      <form id="formEditarUsuario" method="POST">
        @csrf @method('PUT')
        <div class="form-group"><label class="form-label-custom">Nombre</label><div class="input-group-custom"><i class="fas fa-user"></i><input type="text" name="name" id="edit_name" class="form-control-custom" required></div></div>
        <div class="form-group"><label class="form-label-custom">Email</label><div class="input-group-custom"><i class="fas fa-envelope"></i><input type="email" name="email" id="edit_email" class="form-control-custom" required></div></div>
        <div class="form-group"><label class="form-label-custom">IBAN</label><div class="input-group-custom"><i class="fas fa-credit-card"></i><input type="text" name="IBAN" id="edit_iban" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Firma</label><div class="input-group-custom"><i class="fas fa-pen-nib"></i><input type="text" name="firma_digital" id="edit_firma" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Nueva Pass</label><div class="input-group-custom"><i class="fas fa-lock"></i><input type="password" name="password" class="form-control-custom"></div></div>
        <div class="form-group"><label class="form-label-custom">Confirmar</label><div class="input-group-custom"><i class="fas fa-check-double"></i><input type="password" name="password_confirmation" class="form-control-custom"></div></div>
        <button type="submit" class="btn-facto">Actualizar</button>
      </form>
    </div>
  </div>

  <script src="{{ asset('js/users.js') }}"></script>
  
  <script>
      // --- LÓGICA DE CHECKBOXES Y GRUPOS ---
      const checkboxes = document.querySelectorAll('.user-check');
      const selectAll = document.getElementById('selectAll');
      const floatingBar = document.getElementById('floatingBar');
      const countSpan = document.getElementById('countSelected');
      const modalGrupo = document.getElementById('modalGrupo');
      
      // Obtenemos referencia al modal del componente.
      // Como el componente se renderiza en el HTML final, JS lo encuentra por ID sin problemas.
      const modalGestion = document.getElementById('modalGestionGrupos');
      
      const inputsContainer = document.getElementById('hiddenInputsContainer');

      // Actualizar barra flotante
      function updateFloatingBar() {
          const selected = document.querySelectorAll('.user-check:checked');
          if(countSpan) countSpan.innerText = selected.length;
          
          if(selected.length >= 2) {
              if(floatingBar) floatingBar.classList.add('active');
          } else {
              if(floatingBar) floatingBar.classList.remove('active');
          }
      }

      checkboxes.forEach(cb => cb.addEventListener('change', updateFloatingBar));

      if(selectAll) {
          selectAll.addEventListener('change', function() {
              checkboxes.forEach(cb => cb.checked = this.checked);
              updateFloatingBar();
          });
      }

      // Modal Crear Grupo
      function abrirModalGrupo() {
          if(!modalGrupo) return;
          inputsContainer.innerHTML = ''; 
          const selected = document.querySelectorAll('.user-check:checked');
          selected.forEach(cb => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'users[]'; 
              input.value = cb.value;
              inputsContainer.appendChild(input);
          });
          modalGrupo.style.display = 'flex';
      }

      function cerrarModalGrupo() {
          if(modalGrupo) modalGrupo.style.display = 'none';
      }

      // Modal Gestionar Grupos (Funciones llamadas por el HTML y el Componente)
      function abrirModalGestionGrupos() {
          if(modalGestion) modalGestion.style.display = 'flex';
      }
      function cerrarModalGestionGrupos() {
          if(modalGestion) modalGestion.style.display = 'none';
      }

      // Cierres al clicar fuera
      window.addEventListener('click', (e) => {
          if (e.target === modalGrupo) modalGrupo.style.display = 'none';
          if (e.target === modalGestion) modalGestion.style.display = 'none';
      });

      // --- LÓGICA MODALES USUARIOS (CREAR / EDITAR) ---
      const modalCrear = document.getElementById('modalCrearUsuario');
      const btnAbrirCrear = document.getElementById('toggleCrearUsuario');
      const btnCerrarCrear = document.getElementById('btnCerrarModalCrearUsuario');
      
      if(btnAbrirCrear) btnAbrirCrear.addEventListener('click', () => modalCrear.style.display = 'flex');
      if(btnCerrarCrear) btnCerrarCrear.addEventListener('click', () => modalCrear.style.display = 'none');

      const modalEditar = document.getElementById('modalEditarUsuario');
      const btnCerrarEditar = document.getElementById('btnCerrarModalEditarUsuario');
      
      // Delegación de eventos para los botones de editar (dentro del componente tabla)
      document.addEventListener('click', function(e) {
          const btn = e.target.closest('.js-edit-user');
          if (btn) {
              const id = btn.dataset.id;
              document.getElementById('edit_name').value = btn.dataset.name;
              document.getElementById('edit_email').value = btn.dataset.email;
              document.getElementById('edit_iban').value = btn.dataset.iban || '';
              document.getElementById('edit_firma').value = btn.dataset.firma || '';
              
              const form = document.getElementById('formEditarUsuario');
              form.action = `/users/${id}`; 

              if(modalEditar) modalEditar.style.display = 'flex';
          }
      });

      if(btnCerrarEditar) btnCerrarEditar.addEventListener('click', () => modalEditar.style.display = 'none');

      window.addEventListener('click', (e) => {
          if (e.target === modalCrear) modalCrear.style.display = 'none';
          if (e.target === modalEditar) modalEditar.style.display = 'none';
      });

  </script>
</body>
</html>