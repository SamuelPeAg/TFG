<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagos - Factomove</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/Pagos.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>

  <style>
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        align-items: center; justify-content: center;
        backdrop-filter: blur(3px);
    }
    
    .modal-overlay.active {
        display: flex !important;
    }

    .modal-box {
        background-color: white;
        padding: 40px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        width: 90%; max-width: 400px;
        text-align: center;
        font-family: 'Segoe UI', sans-serif;
        animation: fadeIn 0.2s ease-out;
        position: relative; 
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
    .modal-title { 
        color: #333; 
        font-size: 20px; 
        margin-bottom: 15px; 
        font-weight: 700;
    }
    
    .modal-text { 
        color: #666; 
        margin-bottom: 30px; 
        font-size: 15px; 
    }
    
    .modal-actions { 
        display: flex; 
        justify-content: center; 
        gap: 15px; 
    }
    
    .btn-modal { 
        padding: 10px 24px; 
        border-radius: 6px; 
        border: none; 
        font-weight: 600; 
        font-size: 14px;
        cursor: pointer; 
        transition: opacity 0.2s;
    }
    
    .btn-cancel { background-color: #e0e0e0; color: #333; }
    .btn-confirm { background-color: #00897b; color: white; }
    .btn-modal:hover { opacity: 0.9; }
    .modern-modal-header { text-align: center; margin-bottom: 30px; }
    .modern-logo { width: 50px; margin-bottom: 10px; opacity: 0.9; }
    .modern-title { font-size: 24px; font-weight: 800; color: #1f2937; margin: 0; }
    .modern-subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; }

    .modern-form-group { margin-bottom: 20px; text-align: left; }
    .modern-label { display: block; font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }

    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 15px; color: #EF5D7A; font-size: 16px; z-index: 10; }

    .modern-input {
        width: 100%;
        padding: 12px 15px 12px 45px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background-color: #f9fafb;
        font-size: 14px;
        color: #374151;
        transition: all 0.3s ease;
        outline: none;
        appearance: none;
    }

    .modern-input:focus {
        border-color: #272727;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
    }

    .btn-gradient {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(90deg, #34d399 0%, #f43f5e 100%);
        color: white;
        font-weight: 800;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        margin-top: 10px;
    }

    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 20px -3px rgba(244, 63, 94, 0.4);
        opacity: 0.95;
    }

    .suggestions {
        position: absolute;
        top: 100%; left: 0; right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        z-index: 50;
        max-height: 150px;
        overflow-y: auto;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .suggestions .item {
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        font-size: 14px;
        text-align: left;
    }
    .suggestions .item:hover { background-color: #f9fafb; color: #181818; }

    .fc {
        background: #fff;
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        font-family: 'Segoe UI', system-ui, sans-serif;
        z-index: 1;
    }
    
    .fc-toolbar-title::first-letter { text-transform: uppercase; }
    .fc-col-header-cell-cushion { text-transform: capitalize; }
    .fc-toolbar-title { text-transform: lowercase; display: inline-block; }
    .fc-button-primary { background-color: #374151 !important; border-color: #374151 !important; text-transform: capitalize; }
    .fc-button-active { background-color: #00897b !important; border-color: #00897b !important; }
    .fc-event { border: none; box-shadow: 0 2px 3px rgba(0,0,0,0.15); font-size: 0.85rem; cursor: pointer; }

    #search-user { border: none !important; outline: none !important; box-shadow: none !important; background: transparent; }
    .search-anchor input:focus { border: none !important; outline: none !important; }
    .form-group label i { color: #00897b; margin-right: 8px; width: 20px; text-align: center; }
  </style>
</head>

<body>
  <div class="dashboard-container">
    @include('components.sidebars.sidebar_Pagos')

    <main class="main-content">
      <div class="header-controls">
        
        <div class="title-section">
          <h1>Historial de Pagos</h1>
        </div>

        <div class="controls-bar">
          
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <div class="search-anchor">
              <input type="text" id="search-user" placeholder="Buscar usuario..." autocomplete="off">
              <div id="search_user_suggestions" class="suggestions" hidden></div>
            </div>
          </div>

          <button type="button" class="btn-design btn-solid-custom" id="btnNuevaClase">
            <i class="fa-solid fa-plus"></i> <span>NUEVA CLASE</span>
          </button>

        </div>
      </div>
      <section class="calendar-layout">
        <div class="calendar-panel">
            <div class="calendar-container">
                <div id="fullCalendarEl"></div>
            </div>
            <div id="calendar-summary" class="calendar-summary">
                <p><i class="fa-solid fa-circle-info"></i> Haz clic en el calendario para añadir una clase o selecciona una existente.</p>
            </div>
        </div>
      </section>
    </main>
  </div>

  <div id="modalSalir" class="modal-overlay">
    <div class="modal-box">
        <div class="modal-title">Cerrar Sesión</div>
        <div class="modal-text">¿Estás seguro de que quieres salir de Factomove?</div>
        
        <div class="modal-actions">
            <button class="btn-modal btn-cancel" id="btnCancelarSalir">Cancelar</button>
            <button class="btn-modal btn-confirm" id="btnConfirmarSalir">Sí, salir</button>
        </div>
    </div>
  </div>

  <div id="infoPopup" class="modal-overlay" aria-hidden="true">
    <div class="modal-box">
      <button type="button" class="close-icon" id="btnCerrarPopup" style="position: absolute; top: 15px; right: 15px; background:none; border:none; font-size:24px; color:#9ca3af; cursor:pointer;">&times;</button>
      <h2 id="modal-fecha-titulo">Detalles</h2>
      <div id="lista-Pagos" class="modal-details"></div>
      <br>
      <button type="button" class="btn-modal btn-cancel" id="btnCerrarPopup2">Cerrar</button>
    </div>
  </div>

  <div id="modalNuevaClase" class="modal-overlay" role="dialog" aria-hidden="true">
    <div class="modal-box" style="padding: 40px; max-width: 450px;">
      
      <button type="button" class="close-icon" id="btnCerrarNuevaClase" style="position: absolute; top: 15px; right: 15px; background:none; border:none; font-size:24px; color:#9ca3af; cursor:pointer;">&times;</button>

      <div class="modern-modal-header">
          <img src="{{ asset('img/logopng.png') }}" alt="Logo" class="modern-logo"> 
          <h2 class="modern-title">Agendar Clase</h2>
          <p class="modern-subtitle">Registra una nueva sesión en el sistema.</p>
      </div>

      <form id="formNuevaClase" action="{{ route('Pagos.store') }}" method="POST">
        @csrf

        <div class="modern-form-group">
          <label for="centro" class="modern-label">CENTRO</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-building input-icon"></i>
            <select id="centro" name="centro" class="modern-input" required>
                <option value="" disabled selected>Selecciona un centro...</option>
                <option value="OPEN">OPEN</option>
                <option value="AIRA">AIRA</option>
                <option value="CLINICA">CLINICA</option>
            </select>
          </div>
        </div>

        <div class="modern-form-group">
          <label for="nombre_clase" class="modern-label">NOMBRE DE LA CLASE</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-dumbbell input-icon"></i>
            <input id="nombre_clase" type="text" name="nombre_clase" class="modern-input" placeholder="Ej. Pilates Avanzado" required>
          </div>
        </div>

        <div class="modern-form-group" style="position: relative;">
          <label for="user_search" class="modern-label">ALUMNO / USUARIO</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-user input-icon"></i>
            <input id="user_search" type="text" class="modern-input" placeholder="Buscar alumno..." autocomplete="off" required>
            <input type="hidden" name="user_id" id="user_id">
          </div>
          <div id="user_suggestions" class="suggestions" hidden></div>
        </div>

        <div class="modern-form-group">
            <label for="metodo_pago" class="modern-label">MÉTODO DE PAGO</label>
            <div class="input-wrapper">
              <i class="fa-solid fa-credit-card input-icon"></i>
              <select id="metodo_pago" name="metodo_pago" class="modern-input" required>
                <option value="TPV">TPV (Tarjeta)</option>
                <option value="EF">Efectivo</option>
                <option value="DD">Domiciliación</option>
                <option value="CC">Cuenta Corriente</option>
              </select>
            </div>
        </div>

        <div style="display: flex; gap: 15px;">
            <div class="modern-form-group" style="flex: 1;">
                <label for="fecha_hora" class="modern-label">FECHA Y HORA</label>
                <div class="input-wrapper">
                    <i class="fa-solid fa-clock input-icon"></i>
                    <input id="fecha_hora" type="datetime-local" name="fecha_hora" class="modern-input" required>
                </div>
            </div>

            <div class="modern-form-group" style="flex: 1;">
                <label for="precio" class="modern-label">PRECIO (€)</label>
                <div class="input-wrapper">
                    <i class="fa-solid fa-euro-sign input-icon"></i>
                    <input id="precio" type="number" name="precio" step="0.01" class="modern-input" placeholder="0.00" required>
                </div>
            </div>
        </div>

        <button type="submit" class="btn-gradient">GUARDAR CLASE</button>
      </form>

      <script type="application/json" id="users_json">
        @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values())
      </script>

    </div>
  </div>

  <script src="{{ asset('js/Pagos.js') }}"></script>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Elementos del Modal
        const modalSalir = document.getElementById('modalSalir');
        const btnCancelar = document.getElementById('btnCancelarSalir');
        const btnConfirmar = document.getElementById('btnConfirmarSalir');

        // Elementos del Sidebar (Vienen del include) -> AQUI ESTABA EL ERROR DE @
        const btnSideLogout = document.getElementById('btnSideLogout');
        const logoutForm = document.getElementById('logout-form');

        // 1. ABRIR MODAL
        if (btnSideLogout) {
            btnSideLogout.addEventListener('click', function(e) {
                e.preventDefault();
                if(modalSalir) modalSalir.classList.add('active');
            });
        }

        // 2. CERRAR MODAL
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                modalSalir.classList.remove('active');
            });
        }

        // 3. CONFIRMAR
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', function() {
                if (logoutForm) logoutForm.submit();
            });
        }

        // 4. CLICK FUERA
        if(modalSalir){
            modalSalir.addEventListener('click', function(e) {
                if (e.target === modalSalir) {
                    modalSalir.classList.remove('active');
                }
            });
        }
    });
  </script>
</body>
</html>