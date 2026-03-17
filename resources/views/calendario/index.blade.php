<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendario - Factomove</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/calendario.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
  
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
  <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
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
          <h1>Historial de Pagos</h1>
        </div>

        <div class="controls-bar">
          
          <div class="filters-group" style="display: flex; gap: 10px; align-items: center; flex-grow: 1; max-width: 600px;">
            <div class="search-box" style="flex: 1;">
              <i class="fa-solid fa-house-medical"></i>
              <div class="search-anchor">
                <select id="filter-center" class="modern-select-no-border no-select2" style="width: 100%; border: none; outline: none; background: transparent; cursor: pointer; color: #374151; font-size: 14px;">
                  <option value="">Todos los centros</option>
                  @foreach($centros as $centro)
                    <option value="{{ $centro->nombre }}">{{ $centro->nombre }}</option>
                  @endforeach
                </select>
              </div>
            </div>

            <div class="search-box" style="flex: 1.5;">
              <i class="fa-solid fa-magnifying-glass"></i>
              <div class="search-anchor">
                <input type="text" id="search-user" placeholder="Buscar usuario..." autocomplete="off">
                <div id="search_user_suggestions" class="suggestions" hidden></div>
              </div>
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

  @include('calendario.modales.modal_salir')

  @include('calendario.modales.modal_info')

  @include('calendario.modales.modal_nueva_clase')

  <!-- MODAL SELECCIÓN CLIENTES -->
  @include('calendario.modales.modal_seleccion_clientes')

  <script>
    window.CURRENT_USER_ROLE = "{{ Auth::check() ? (Auth::user()->roles->pluck('name')->first() ?? '') : '' }}";
    window.CURRENT_USER_ID = {{ Auth::id() ?? 'null' }};
    window.IS_ADMIN = {{ Auth::check() && Auth::user()->hasRole('admin') ? 'true' : 'false' }};
    window.IS_TRAINER = {{ Auth::check() && Auth::user()->hasRole('entrenador') ? 'true' : 'false' }};
  </script>

  @vite('resources/js/app.js')

  <script src="{{ asset('js/calendario.js') }}"></script>
  <script src="{{ asset('js/wizard_clase.js') }}"></script>
  <script src="{{ asset('js/calendario-modal-logout.js') }}"></script>
</body>
</html>