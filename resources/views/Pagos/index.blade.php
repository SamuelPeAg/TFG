<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagos - Factomove</title>

  <link rel="stylesheet" href="{{ asset('css/global.css') }}">
  <link rel="stylesheet" href="{{ asset('css/Pagos.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <style>
    /* Estilo para quitar la línea del buscador (de tu petición anterior) */
    #search-user {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: transparent;
    }
    .search-anchor input:focus {
        border: none !important;
        outline: none !important;
    }

    /* NUEVO: Estilo para los iconos de los formularios */
    .form-group label i {
        color: #ec4899; /* Color rosado/rojo como en tu imagen de referencia (o pon #00897b para el verde) */
        margin-right: 8px; /* Espacio entre el icono y el texto */
        width: 20px;       /* Para que todos alineen igual */
        text-align: center;
    }
  </style>

</head>

<body>
  <div class="dashboard-container">
    @include('components.sidebars.sidebar_Pagos')

    <main class="main-content">

      <div class="header-controls">
        <div class="controls-bar">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <div class="search-anchor">
              <input
                type="text"
                id="search-user"
                placeholder="Buscar usuario..."
                autocomplete="off"
              >
              <div id="search_user_suggestions" class="suggestions" hidden></div>
            </div>
          </div>
        </div>

        <div class="title-section">
          <h1>Historial de Pagos</h1>
          <button type="button" class="btn-add-class" id="btnNuevaClase">
            <i class="fa-solid fa-plus"></i>
            Nueva Clase
          </button>
        </div>
      </div>
      <section class="calendar-layout" aria-label="Calendario de Pagos">
        <div class="calendar-panel">
          <div class="calendar-container">
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

  <div id="infoPopup" class="modal-overlay" aria-hidden="true">
    <div class="modal-box">
      <button type="button" class="close-icon" id="btnCerrarPopup" aria-label="Cerrar">&times;</button>
      <h2 id="modal-fecha-titulo">Detalles del Día</h2>
      <div id="lista-Pagos" class="modal-details"></div>
      <button type="button" class="btn-close" id="btnCerrarPopup2">Cerrar</button>
    </div>
  </div>

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

      <form action="{{ route('Pagos.store') }}" method="POST">
        @csrf

        <div class="form-group">
          <label for="centro"><i class="fa-solid fa-building"></i> Centro:</label>
          <select id="centro" name="centro" class="form-input" required>
            <option value="">Selecciona centro</option>
            <option value="OPEN">OPEN</option>
            <option value="AIRA">AIRA</option>
            <option value="CLINICA">CLINICA</option>
          </select>
        </div>

        <div class="form-group">
          <label for="nombre_clase"><i class="fa-solid fa-dumbbell"></i> Clase:</label>
          <input id="nombre_clase" type="text" name="nombre_clase" class="form-input" placeholder="Ej: Pilates, Crossfit..." required>
        </div>

        <div class="form-group">
          <label for="user_search"><i class="fa-solid fa-user"></i> Usuario:</label>

          <input
            id="user_search"
            type="text"
            class="form-input"
            placeholder="Escribe para buscar (ej: Ana)"
            autocomplete="off"
          >
          <input type="hidden" name="user_id" id="user_id" required>
          <div id="user_suggestions" class="suggestions" hidden></div>

          <script type="application/json" id="users_json">
            @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values())
          </script>
        </div>

        <div class="form-group">
          <label for="metodo_pago"><i class="fa-solid fa-credit-card"></i> Método de pago:</label>
          <select id="metodo_pago" name="metodo_pago" class="form-input" required>
            <option value="">Selecciona método</option>
            <option value="TPV">TPV</option>
            <option value="EF">EF</option>
            <option value="DD">DD</option>
            <option value="CC">CC</option>
          </select>
        </div>

        <div class="form-group">
          <label for="fecha_hora"><i class="fa-solid fa-clock"></i> Hora y Fecha:</label>
          <input id="fecha_hora" type="datetime-local" name="fecha_hora" class="form-input" required>
        </div>

        <div class="form-group">
          <label for="precio"><i class="fa-solid fa-euro-sign"></i> Precio (€):</label>
          <input id="precio" type="number" name="precio" step="0.01" class="form-input" placeholder="0.00" required>
        </div>

        <button type="submit" class="btn-submit">Guardar Clase</button>
      </form>
    </div>
  </div>

  <script type="application/json" id="Pagos-data">
    @json($datosPagos ?? [])
  </script>

  <script>
    window.Pagos_CONFIG = window.Pagos_CONFIG || {};
    window.Pagos_CONFIG.datosPagos =
      JSON.parse(document.getElementById('Pagos-data').textContent);
  </script>

  <script src="{{ asset('js/Pagos.js') }}"></script>
</body>
</html>