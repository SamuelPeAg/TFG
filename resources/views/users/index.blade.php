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

  {{-- Modal de Gestión de Suscripciones --}}
  <div id="modalGestionSuscripciones" class="modal-overlay">
    <div class="modal-card" style="max-width: 600px;">
      <button type="button" class="close-btn" onclick="cerrarModalSuscripciones()">&times;</button>
      <div class="modal-header-custom">
        <div class="logo-simulado"><i class="fas fa-ticket-alt"></i></div>
        <h2>Suscripciones de <span id="nombreUsuarioSusc"></span></h2>
      </div>

      <div style="padding: 20px;">
        {{-- Listado de suscripciones actuales --}}
        <div id="listaSuscripcionesUsuario" style="margin-bottom: 25px;">
           <!-- Se cargará vía JS -->
        </div>

        <div id="loadingSuscripciones" style="display:none; text-align:center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #4BB7AE;"></i>
            <p style="margin-top: 10px; color: #666;">Actualizando saldo...</p>
        </div>

        <hr style="margin-bottom: 20px; border: 0; border-top: 1px solid #eee;">

        {{-- Formulario para asignar nueva --}}
        <h4 style="margin-bottom: 15px; color: #333;">Asignar Nueva Suscripción</h4>
        <form action="{{ route('suscripciones-usuarios.store') }}" method="POST">
          @csrf
          <input type="hidden" name="id_usuario" id="idUsuarioSusc">
          
          <div class="form-group">
            <label class="form-label-custom">Seleccionar Suscripción</label>
            <select name="id_suscripcion" class="form-control-custom" required>
              <option value="">-- Elige una suscripción --</option>
              @foreach($suscripciones as $s)
                <option value="{{ $s->id }}">{{ $s->nombre }} ({{ $s->tipo_credito }}) - {{ $s->centro->nombre ?? 'Sin centro' }}</option>
              @endforeach
            </select>
          </div>

          <div class="form-group">
            <label class="form-label-custom">Saldo Inicial (opcional)</label>
            <input type="number" name="saldo_actual" class="form-control-custom" placeholder="Si se deja vacío, se usará el por defecto">
          </div>

          <button type="submit" class="btn-facto">Asignar Suscripción</button>
        </form>
      </div>
    </div>
  </div>

    <style>
        .btn-adjust {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            background: white;
            border-radius: 6px;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 10px;
        }
        .btn-adjust:hover {
            background: #f1f5f9;
            color: #4BB7AE;
            border-color: #4BB7AE;
        }
        .btn-adjust:active {
            transform: scale(0.9);
        }
        .suscripcion-item {
            transition: all 0.3s;
        }
        .suscripcion-item:hover {
            border-color: #4BB7AE !important;
            transform: translateX(5px);
        }
    </style>

    <script>
    // Pasar los usuarios y sus suscripciones a JS
    let usersData = @json($users);
    const modalSusc = document.getElementById('modalGestionSuscripciones');
    const lista = document.getElementById('listaSuscripcionesUsuario');
    const loading = document.getElementById('loadingSuscripciones');

    document.querySelectorAll('.js-view-subscriptions').forEach(btn => {
      btn.addEventListener('click', function() {
        const userId = this.dataset.id;
        const userName = this.dataset.name;
        
        document.getElementById('idUsuarioSusc').value = userId;
        document.getElementById('nombreUsuarioSusc').innerText = userName;

        renderSuscripciones(userId);
        modalSusc.style.display = 'flex';
      });
    });

    function renderSuscripciones(userId) {
        const user = usersData.find(u => u.id == userId);
        lista.innerHTML = '';

        if (user && user.suscripciones && user.suscripciones.length > 0) {
          user.suscripciones.forEach(su => {
            const item = document.createElement('div');
            item.className = 'suscripcion-item';
            item.style = 'background: #fff; padding: 15px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);';
            item.innerHTML = `
              <div style="flex: 1;">
                <strong style="display:block; color: #1e293b; font-size: 15px;">${su.suscripcion.nombre}</strong>
                <div style="display:flex; flex-direction:column; gap:2px; margin-top:2px;">
                    <span style="font-size: 11px; color: #64748b;">Tipo: <b style="color:#0e7490; font-weight:700;">${su.suscripcion.tipo_credito}</b></span>
                    <span style="font-size: 11px; color: #64748b;"><i class="fas fa-map-marker-alt" style="margin-right:4px; font-size:10px;"></i>Centro: <b style="color:#4B5563;">${su.suscripcion.centro ? su.suscripcion.centro.nombre : 'General'}</b></span>
                </div>
              </div>
              
              <div style="display:flex; align-items:center; gap: 20px;">
                  <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Balance Actual</span>
                    <div style="display:flex; align-items:center; gap:10px; background: #f8fafc; padding: 4px 8px; border-radius: 8px; border: 1px solid #f1f5f9;">
                        <button type="button" onclick="ajustarSaldo(${su.id}, 'dec', ${userId})" class="btn-adjust" title="Quitar 1 crédito"><i class="fas fa-minus"></i></button>
                        <span id="saldo-${su.id}" style="font-size: 20px; font-weight: 900; color: #4BB7AE; min-width: 30px; text-align:center;">${su.saldo_actual}</span>
                        <button type="button" onclick="ajustarSaldo(${su.id}, 'inc', ${userId})" class="btn-adjust" title="Añadir 1 crédito"><i class="fas fa-plus"></i></button>
                    </div>
                  </div>

                  <form action="{{ url('suscripciones-usuarios') }}/${su.id}" method="POST" style="display:inline;">
                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                    <input type="hidden" name="_method" value="DELETE">
                    <button type="submit" class="btn-icon" style="color: #cbd5e1; hover: color: #ef4444;" title="Quitar suscripción completa" onclick="return confirm('¿Quitar esta suscripción?')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                  </form>
              </div>
            `;
            lista.appendChild(item);
          });
        } else {
          lista.innerHTML = '<div style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;"><i class="fas fa-info-circle" style="margin-bottom: 10px; font-size: 20px; display:block;"></i>Este cliente no tiene suscripciones asociadas aún.</div>';
        }
    }

    async function ajustarSaldo(suId, accion, userId) {
        const saldoSpan = document.getElementById(`saldo-${suId}`);
        const originalValue = saldoSpan.innerText;
        
        // Optimistic update
        let tempValue = parseInt(originalValue);
        if (accion === 'inc') tempValue++;
        else if (accion === 'dec' && tempValue > 0) tempValue--;
        saldoSpan.innerText = tempValue;
        saldoSpan.style.opacity = '0.5';

        try {
            const formData = new FormData();
            formData.append('_token', '{{ csrf_token() }}');
            formData.append('accion', accion);

            const routeTemplate = "{{ route('suscripciones-usuarios.ajustar', ['id' => '__ID__']) }}";
            const res = await fetch(routeTemplate.replace('__ID__', suId), {
                method: 'POST',
                headers: { 
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json' 
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Error del servidor: ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
                saldoSpan.innerText = data.nuevo_saldo;
                saldoSpan.style.opacity = '1';
                
                // Actualizar cache local
                const user = usersData.find(u => u.id == userId);
                if (user) {
                    const su = user.suscripciones.find(s => s.id == suId);
                    if (su) su.saldo_actual = data.nuevo_saldo;
                }
            } else {
                saldoSpan.innerText = originalValue;
                saldoSpan.style.opacity = '1';
                alert('Error: ' + (data.message || 'No se pudo actualizar'));
            }
        } catch (e) {
            console.error(e);
            saldoSpan.innerText = originalValue;
            saldoSpan.style.opacity = '1';
            alert('Error: ' + e.message);
        }
    }

    function cerrarModalSuscripciones() {
      modalSusc.style.display = 'none';
    }
  </script>

  <script src="{{ asset('js/users.js') }}"></script>
  <script src="{{ asset('js/users-modal-delete.js') }}"></script>
  
</body>
</html>