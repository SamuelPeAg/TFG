document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const calendarEl = document.getElementById('fullCalendarEl');
  const summaryEl = document.getElementById('calendar-summary');

  // === REFERENCIAS A MODALES ===
  const modalNueva = document.getElementById('modalNuevaClase');
  const modalInfo = document.getElementById('infoPopup');
  const modalSalir = document.getElementById('modalSalir');

  // === REFERENCIAS FORMULARIO NUEVA CLASE ===
  const formNuevaClase = document.getElementById('formNuevaClase');
  const inputFechaHora = document.getElementById('fecha_hora');

  // === REFERENCIAS DETALLES ===
  const listaPagosEl = document.getElementById('lista-Pagos');
  const tituloFechaEl = document.getElementById('modal-fecha-titulo');

  // === REFERENCIAS LOGOUT (NUEVO) ===
  const btnSideLogout = document.getElementById('btnSideLogout');
  const btnCancelarSalir = document.getElementById('btnCancelarSalir');
  const btnConfirmarSalir = document.getElementById('btnConfirmarSalir');
  const logoutForm = document.getElementById('logout-form');

  // ====== 1. CONFIGURACIÓN FULLCALENDAR ======
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'es',
    firstDay: 1,
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    allDaySlot: false,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },

    eventClick: function (info) {
      mostrarDetallesEvento(info.event);
    },

    dateClick: function (info) {
      abrirModalNuevaClase(info.date);
    }
  });

  calendar.render();
  fetchAndRenderCalendar('');

  // ====== 2. LÓGICA DE CLICK EN FECHA ======
  function abrirModalNuevaClase(dateObj) {
    openModal(modalNueva);

    const offsetMs = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - offsetMs)).toISOString().slice(0, 16);

    if (inputFechaHora) inputFechaHora.value = localISOTime;
  }

  // ====== 3. MOSTRAR DETALLES EVENTO (REDISEÑADO) ======
  function mostrarDetallesEvento(event) {
    const p = event.extendedProps;
    const fechaObj = event.start;
    // Formato fecha amigable: "Jueves, 5 de Febrero"
    const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaNum = fechaObj.getDate();
    const mes = fechaObj.toLocaleDateString('es-ES', { month: 'long' });
    const fechaTxt = `${diaSemana}, ${diaNum} de ${mes}`;

    tituloFechaEl.innerHTML = `<span style="text-transform:capitalize; color:#0e7490;">${diaSemana}</span>, ${diaNum} de <span style="text-transform:capitalize;">${mes}</span>`;
    tituloFechaEl.style.color = "#333";
    tituloFechaEl.style.fontSize = "1.5rem";
    tituloFechaEl.style.textAlign = "center";

    // Preparar contenido modal
    let html = `
      <div class="modal-grid" style="min-height:300px; border-top:1px solid #eee; margin-top:20px;">
        <!-- COLUMNA IZQUIERDA: Info General y Clientes -->
        <div class="modal-col-left" style="padding:25px; border-right:1px solid #eee;">
            <div style="margin-bottom:20px;">
                <h3 style="margin:0; font-size:22px; color:#111827; font-weight:700;">${p.clase_nombre}</h3>
                <div style="display:flex; gap:15px; margin-top:8px; font-size:14px; color:#4b5563;">
                    <span><i class="fa-solid fa-clock" style="color:#00897b"></i> ${p.hora}</span>
                    <span><i class="fa-solid fa-building" style="color:#00897b"></i> ${p.centro}</span>
                    ${p.tipo_clase ? `<span><i class="fa-solid fa-layer-group" style="color:#00897b"></i> ${p.tipo_clase}</span>` : ''}
                </div>
            </div>

            <h4 class="section-title">ASISTENTES (${p.alumnos ? p.alumnos.length : 0})</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    if (p.alumnos && p.alumnos.length > 0) {
      p.alumnos.forEach(alum => {
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
              <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:36px; height:36px; background:#00897b; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">
                      ${alum.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <div style="font-weight:700; color:#374151; font-size:14px;">${alum.nombre}</div>
                      <div style="font-size:11px; color:#6b7280; text-transform:uppercase;">${alum.pago}</div>
                  </div>
              </div>
              <div style="font-weight:800; color:#111827;">€${Number(alum.coste).toFixed(2)}</div>
          </div>
        `;
      });
    } else {
      html += `<p style="color:#9ca3af; font-style:italic;">No hay información de alumnos.</p>`;
    }

    html += `
        </div>
      </div>

      <!-- COLUMNA DERECHA: Entrenadores -->
      <div class="modal-col-right" style="padding:25px; background:#fcfcfc;">
        <h4 class="section-title">EQUIPO TÉCNICO</h4>
        <div id="lista-entrenadores-sesion" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <!-- Lista dinámica JS -->
        </div>

        <div style="margin-top:auto;">
             <label style="display:block; font-size:11px; font-weight:800; color:#9ca3af; text-transform:uppercase; margin-bottom:8px;">AÑADIR ENTRENADOR</label>
             <div style="display:flex; gap:8px;">
                <select id="select-add-trainer" class="modern-input" style="padding:10px;">
                    <option value="" selected disabled>Seleccionar...</option>
                    ${generarOpcionesEntrenadores()}
                </select>
                <button type="button" id="btn-add-trainer-action" class="btn-design btn-solid-custom" style="padding:0 15px; width:auto; border-radius:10px;">
                    <i class="fa-solid fa-plus"></i>
                </button>
             </div>
        </div>
      </div>
    </div>`;

    listaPagosEl.innerHTML = html;

    // Renderizar entrenadores actuales
    renderEntrenadoresSesion(p.entrenadores || [], p.session_key);

    // Event Listener para añadir entrenador
    const btnAdd = document.getElementById('btn-add-trainer-action');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const select = document.getElementById('select-add-trainer');
        const trainerId = select.value;
        if (!trainerId) return;

        agregarEntrenadorSesion(trainerId, p.session_key, event);
      });
    }

    openModal(modalInfo);
  }

  // --- Helpers renderizado entrenadores ---
  function generarOpcionesEntrenadores() {
    // USERS global o inyectado. Asumiremos que tenemos acceso a una lista de entrenadores global o la extraemos del DOM si está disponible
    // En index.blade.php inyectamos 'users', pero no 'entrenadores' como JSON global explícito en JS puro...
    // HACK: Usar los checkboxes del modal "Nueva Clase" para obtener la lista de entrenadores disponibles :D
    const checkboxes = document.querySelectorAll('input[name="trainers[]"]');
    let opts = '';
    checkboxes.forEach(chk => {
      const name = chk.closest('.trainer-option').querySelector('.trainer-name').textContent;
      opts += `<option value="${chk.value}">${name}</option>`;
    });
    return opts;
  }

  function renderEntrenadoresSesion(entrenadores, sessionKey) {
    const container = document.getElementById('lista-entrenadores-sesion');
    if (!container) return;

    container.innerHTML = '';
    if (!entrenadores || entrenadores.length === 0) {
      container.innerHTML = `<div style="padding:10px; border:1px dashed #e5e7eb; border-radius:8px; color:#9ca3af; font-size:13px; text-align:center;">Sin asignación</div>`;
      return;
    }

    entrenadores.forEach(t => {
      const div = document.createElement('div');
      div.className = 'trainer-card';
      div.style.background = 'white';
      div.style.cursor = 'default';
      // No hover effect highlighting like checkboxes

      div.innerHTML = `
             <div class="avatar-circle-sm">${t.initial || t.name.charAt(0)}</div>
             <span class="trainer-name" style="flex:1;">${t.name}</span>
             <button type="button" class="btn-icon btn-delete-trainer" style="border:none; background:none; cursor:pointer; color:#ef4444;" title="Eliminar">
                <i class="fa-solid fa-trash-can"></i>
             </button>
          `;

      div.querySelector('.btn-delete-trainer').addEventListener('click', () => {
        eliminarEntrenadorSesion(t.id, sessionKey);
      });

      container.appendChild(div);
    });
  }

  // --- Lógica AJAX Entrenadores ---
  async function agregarEntrenadorSesion(trainerId, sessionKey, eventCal) {
    try {
      const formData = new FormData();
      formData.append('trainer_id', trainerId);
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await fetch('/Pagos/add-trainer', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 1. Recargar calendario de fondo (sin molestar al usuario)
        const currentSearch = document.getElementById('search-user')?.value || '';
        fetchAndRenderCalendar(currentSearch);

        // 2. Actualizar lista de entrenadores en el modal usando los datos que devolvio el back
        if (data.trainers) {
          renderEntrenadoresSesion(data.trainers, sessionKey);
        }

        // NO cerramos el modal
        // closeModal(modalInfo);
      } else {
        alert('Error al añadir entrenador');
      }
    } catch (e) { console.error(e); }
  }

  async function eliminarEntrenadorSesion(trainerId, sessionKey) {
    try {
      const formData = new FormData();
      formData.append('trainer_id', trainerId);
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await fetch('/Pagos/remove-trainer', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 1. Recargar calendario de fondo
        const currentSearch = document.getElementById('search-user')?.value || '';
        fetchAndRenderCalendar(currentSearch);

        // 2. Actualizar lista en el modal
        if (data.trainers) {
          renderEntrenadoresSesion(data.trainers, sessionKey);
        }

        // NO cerramos el modal
      } else {
        alert('Error al eliminar entrenador');
      }
    } catch (e) { console.error(e); }
  }

  // ====== 4. FETCH DATOS ======
  async function fetchAndRenderCalendar(q) {
    try {
      const res = await fetch(`/usuarios/Pagos?q=${encodeURIComponent(q || '')}`);
      const data = await res.json();
      calendar.removeAllEvents();
      if (data.events) calendar.addEventSource(data.events);
    } catch (e) { console.error(e); }
  }

  // ====== 5. GUARDAR FORMULARIO (AJAX) ======
  if (formNuevaClase) {
    formNuevaClase.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Limpiar errores previos
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      document.querySelectorAll('.modern-input').forEach(el => el.style.borderColor = '');

      const formData = new FormData(formNuevaClase);
      const payload = Object.fromEntries(formData);

      // Enviar array de usuarios tal cual (incluyendo vacíos) para que falle la validación en el servidor si es necesario
      payload.users = formData.getAll('users[]');
      if (payload['users[]']) delete payload['users[]'];

      // Enviar array de entrenadores
      payload.trainers = formData.getAll('trainers[]');
      if (payload['trainers[]']) delete payload['trainers[]'];

      try {
        const res = await fetch(formNuevaClase.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (res.status === 422) {
          // Manejar errores de validación
          if (json.errors) {
            Object.keys(json.errors).forEach(key => {
              // Si el error es de users.X (ej: users.0)
              if (key.startsWith('users.')) {
                const index = key.split('.')[1];
                const group = document.getElementById(`user-group-${index}`);
                if (group) {
                  mostrarError(group, json.errors[key][0]);
                }
              } else {
                // Otros errores genéricos
                alert(json.errors[key][0]);
              }
            });
          }
          return;
        }

        if (!res.ok) throw new Error('Error al guardar');

        if (json.success) {
          // Recargar el calendario para que se muestren los eventos agrupados correctamente
          const currentSearch = document.getElementById('search-user')?.value || '';
          fetchAndRenderCalendar(currentSearch);

          closeModal(modalNueva);
          formNuevaClase.reset();
          summaryEl.innerHTML = `<p style="color:#00897b"><strong>¡Guardado!</strong> Clase añadida.</p>`;
        }
      } catch (error) {
        console.error(error);
        alert("Error inesperado al guardar la clase.");
      }
    });
  }

  function mostrarError(container, msg) {
    const input = container.querySelector('.modern-input');
    if (input) input.style.borderColor = 'red';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = msg;
    container.appendChild(errorDiv);
  }

  // ====== 6. UTILIDADES GENÉRICAS ======
  const openModal = (m) => { if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); } };
  const closeModal = (m) => { if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } };

  document.querySelectorAll('.close-icon, .btn-close, .btn-cancel').forEach(b => {
    b.addEventListener('click', (e) => closeModal(e.target.closest('.modal-overlay')));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      // Evitar cerrar el modal de nueva clase al hacer clic fuera
      if (overlay.id === 'modalNuevaClase') return;

      if (e.target === overlay) closeModal(overlay);
    });
  });

  if (document.getElementById('btnNuevaClase'))
    document.getElementById('btnNuevaClase').addEventListener('click', () => {
      openModal(modalNueva);
      const now = new Date();
      const offsetMs = now.getTimezoneOffset() * 60000;
      inputFechaHora.value = (new Date(now.getTime() - offsetMs)).toISOString().slice(0, 16);
    });

  if (btnConfirmarSalir) {
    btnConfirmarSalir.addEventListener('click', () => {
      if (logoutForm) logoutForm.submit();
    });
  }

  // ====== 8. BUSCADOR Y AUTOCOMPLETE ======
  const searchInput = document.getElementById('search-user');
  if (searchInput) searchInput.addEventListener('input', (e) => {
    clearTimeout(window.t); window.t = setTimeout(() => fetchAndRenderCalendar(e.target.value.trim()), 400);
  });

  const usersJsonEl = document.getElementById('users_json');
  let USERS = [];
  try { USERS = JSON.parse(usersJsonEl.textContent || '[]'); } catch (e) { }

  // Función reutilizable para inicializar autocomplete en un input específico
  window.initAutocomplete = function ({ inputEl, hiddenIdEl, boxEl }) {
    if (!inputEl || !boxEl) return;

    // Eliminar listeners anteriores si existen (clonando)
    const newInput = inputEl.cloneNode(true);
    inputEl.parentNode.replaceChild(newInput, inputEl);
    inputEl = newInput;

    // Reasignar ID si es necesario para mantener referencias
    // (Opcional, pero bueno para asegurar integridad)

    const show = (list) => {
      boxEl.hidden = !list.length;
      boxEl.innerHTML = list.map(u => `<div class="item" data-id="${u.id}" data-name="${u.name}">${u.name}</div>`).join('');
    };

    inputEl.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (hiddenIdEl) hiddenIdEl.value = '';
      if (q.length < 1) { show([]); return; }
      show(USERS.filter(u => u.name.toLowerCase().includes(q)).slice(0, 8));
    });

    // Se usa mousedown para evitar que el blur del input oculte la lista antes del click
    boxEl.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.item');
      if (item) {
        inputEl.value = item.dataset.name;
        if (hiddenIdEl) hiddenIdEl.value = item.dataset.id;
        boxEl.hidden = true;
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target !== inputEl && !boxEl.contains(e.target)) boxEl.hidden = true;
    });
  };

  // Inicializar autocomplete global
  initAutocomplete({
    inputEl: document.getElementById('search-user'),
    hiddenIdEl: null,
    boxEl: document.getElementById('search_user_suggestions')
  });

  // Inicializar el primer input de usuario (EP por defecto)
  const firstUserInput = document.querySelector('.user-search[data-index="0"]');
  if (firstUserInput) {
    initAutocomplete({
      inputEl: firstUserInput,
      hiddenIdEl: document.getElementById('user_id_0'),
      boxEl: document.getElementById('suggestions_0')
    });
  }

  // === EXPORTAR FUNCIONES GLOBALES PARA EL HTML ===
  window.cambiarTipoClase = function () {
    const tipo = document.getElementById('tipo_clase').value;
    const container = document.getElementById('usuarios-container');
    const btnAdd = document.getElementById('btnAddUser');

    let cantidad = 1;
    if (tipo === 'DUO') cantidad = 2;
    else if (tipo === 'TRIO') cantidad = 3;
    else if (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') cantidad = 1; // Empieza con 1 pero permite más

    // Mostrar/Ocultar botón de añadir
    if (btnAdd) {
      btnAdd.style.display = (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') ? 'block' : 'none';
    }

    // Reconstruir inputs
    container.innerHTML = '';
    for (let i = 0; i < cantidad; i++) {
      agregarInputUsuario(i);
    }
  };

  window.agregarInputUsuario = function (index = null) {
    const container = document.getElementById('usuarios-container');
    if (index === null) index = container.children.length; // Si no se pasa indice, es el siguiente

    const div = document.createElement('div');
    div.className = 'modern-form-group user-input-group';
    div.id = `user-group-${index}`;
    div.style.position = 'relative';
    div.innerHTML = `
          <label class="modern-label">Cliente ${index + 1}</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-user input-icon"></i>
            <input type="text" class="modern-input user-search" placeholder="Buscar alumno..." autocomplete="off" data-index="${index}" required>
            <input type="hidden" name="users[]" class="user-id-input" id="user_id_${index}">
            ${index > 0 ? `<button type="button" onclick="eliminarInput(${index})" style="position:absolute; right:-30px; top:10px; border:none; background:none; color:red; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
          <div id="suggestions_${index}" class="suggestions" hidden></div>
      `;
    container.appendChild(div);

    // Inicializar autocomplete
    initAutocomplete({
      inputEl: div.querySelector('.user-search'),
      hiddenIdEl: div.querySelector('.user-id-input'),
      boxEl: div.querySelector('.suggestions')
    });
  };

  window.eliminarInput = function (index) {
    const el = document.getElementById(`user-group-${index}`);
    if (el) el.remove();
  };

  if (document.getElementById('btnAddUser')) {
    document.getElementById('btnAddUser').addEventListener('click', () => {
      agregarInputUsuario();
    });
  }

});