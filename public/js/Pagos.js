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

  // ====== 3. MOSTRAR DETALLES EVENTO ======
  function mostrarDetallesEvento(event) {
    const p = event.extendedProps;
    const fechaTxt = event.start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    tituloFechaEl.textContent = `Detalles: ${fechaTxt}`;

    let html = `<div style="background:#fff; border-radius:8px; overflow:hidden;">`;

    // Header General
    html += `
        <div style="background: #f3f4f6; padding: 15px; border-bottom: 2px solid #00897b;">
            <h3 style="margin:0; color:#111827; font-size:18px; font-weight:700;">${p.clase_nombre}</h3>
            <div style="display:flex; gap:15px; margin-top:8px; font-size:14px; color:#4b5563;">
                <span><i class="fa-solid fa-clock" style="color:#00897b"></i> ${p.hora}</span>
                <span><i class="fa-solid fa-building" style="color:#00897b"></i> ${p.centro}</span>
                ${p.tipo_clase ? `<span><i class="fa-solid fa-layer-group" style="color:#00897b"></i> ${p.tipo_clase}</span>` : ''}
            </div>
        </div>
        <div style="padding: 15px;">
      `;

    if (p.alumnos && p.alumnos.length > 0) {
      html += `<h4 style="margin:0 0 10px 0; font-size:14px; text-transform:uppercase; color:#9ca3af;">Asistentes (${p.alumnos.length})</h4>`;
      p.alumnos.forEach(alum => {
        html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:32px; height:32px; background:#00897b; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">
                            ${alum.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color:#374151;">${alum.nombre}</div>
                            <div style="font-size:12px; color:#6b7280;">${alum.pago}</div>
                        </div>
                    </div>
                    <div style="font-weight:700; color:#1f2937;">€${Number(alum.coste).toFixed(2)}</div>
                </div>
              `;
      });
    } else {
      // Fallback legacy (si por alguna razón no llegara la lista)
      html += `<p>No hay información de alumnos.</p>`;
    }

    html += `</div></div>`;
    listaPagosEl.innerHTML = html;

    openModal(modalInfo);
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

  // ====== 7. LOGICA MODAL SALIR (CERRAR SESIÓN) ======

  if (btnSideLogout) {
    btnSideLogout.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalSalir);
    });
  }

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