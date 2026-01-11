<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sesiones - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>
  <div class="dashboard-container">
    @include('components.sidebars.sidebar_sesiones')

    <main class="main-content">

      <div class="header-controls">
        <div class="title-section">
          <h1>Historial de Sesiones</h1>

          <button type="button" class="btn-add-class" id="btnNuevaClase">
            <i class="fa-solid fa-plus"></i>
            Nueva Clase
          </button>
        </div>

        <div class="controls-bar">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="search-user" placeholder="Buscar usuario..." autocomplete="off">
          </div>
        </div>
      </div>

      <section class="calendar-layout" aria-label="Calendario de sesiones">
        <div class="calendar-panel">
          <div class="calendar-container">
            <!-- Aquí el JS artesanal renderiza el calendario -->
            <div id="user-calendar" class="custom-calendar"></div>
          </div>

          <div id="calendar-summary" class="calendar-summary">
            <p>
              <i class="fa-solid fa-circle-info"></i>
              Busca un usuario y selecciona días marcados
              (<span class="legend-dot">•</span>)
            </p>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- MODAL: Detalles del día -->
  <div id="infoPopup" class="modal-overlay" aria-hidden="true">
    <div class="modal-box">
      <button type="button" class="close-icon" id="btnCerrarPopup" aria-label="Cerrar">&times;</button>
      <h2 id="modal-fecha-titulo">Detalles del Día</h2>
      <div id="lista-sesiones" class="modal-details"></div>
      <button type="button" class="btn-close" id="btnCerrarPopup2">Cerrar</button>
    </div>
  </div>

  <!-- MODAL: Nueva Clase -->
  {{-- MODAL 2: Formulario nueva clase --}}
<div
  id="modalNuevaClase"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-hidden="true"
  aria-labelledby="titulo-nueva-clase"
>
  <div class="modal-box">
    <button type="button" class="close-icon" id="btnCerrarNuevaClase" aria-label="Cerrar">&times;</button>

    <h2 id="titulo-nueva-clase">
      <i class="fa-solid fa-calendar-plus"></i>
      Agendar Nueva Clase
    </h2>

    <form action="{{ route('sesiones.store') }}" method="POST">
      @csrf

      <div class="form-group">
        <label for="centro">🏢 Centro:</label>
        <select id="centro" name="centro" class="form-input" required>
            <option value="">Selecciona centro</option>
            <option value="OPEN">OPEN</option>
            <option value="AIRA">AIRA</option>
            <option value="CLINICA">CLINICA</option>
        </select>
        </div>


      <div class="form-group">
        <label for="nombre_clase">🏋️ Clase:</label>
        <input id="nombre_clase" type="text" name="nombre_clase" class="form-input" placeholder="Ej: Pilates, Crossfit..." required>
      </div>

      {{-- CAMBIO 1: Usuario (antes entrenador) --}}
      <div class="form-group">
        <label for="user_id">👤 Usuario:</label>
        <select id="user_id" name="user_id" class="form-input" required>
          <option value="">Selecciona usuario</option>

          {{-- Pásale $users desde el controlador --}}
          @if(isset($users))
            @foreach($users as $user)
              <option value="{{ $user->id }}">{{ $user->name }}</option>
            @endforeach
          @endif
        </select>
      </div>

      {{-- CAMBIO 2: Método de pago --}}
      <div class="form-group">
        <label for="metodo_pago">💳 Método de pago:</label>
        <select id="metodo_pago" name="metodo_pago" class="form-input" required>
          <option value="">Selecciona método</option>
          <option value="TPV">TPV</option>
          <option value="EF">EF</option>
          <option value="DD">DD</option>
          <option value="CC">CC</option>
        </select>
      </div>

      <div class="form-group">
        <label for="fecha_hora">🕒 Hora y Fecha:</label>
        <input id="fecha_hora" type="datetime-local" name="fecha_hora" class="form-input" required>
      </div>

      <div class="form-group">
        <label for="precio">💶 Precio (€):</label>
        <input id="precio" type="number" name="precio" step="0.01" class="form-input" placeholder="0.00" required>
      </div>

      <button type="submit" class="btn-submit">Guardar Clase</button>
    </form>
  </div>
</div>

  <script src="{{ asset('js/sesiones.js') }}"></script>
</body>
</html>
