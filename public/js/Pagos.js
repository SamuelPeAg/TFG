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
  calendar.render();
  console.log('Iniciando carga del calendario...');
  fetchAndRenderCalendar('').then(() => console.log('Calendario cargado.'));

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

    // Estilizado del encabezado con colores corporativos
    tituloFechaEl.innerHTML = `<span style="display:block; font-size:1.2rem; font-weight:400; opacity:0.9; text-transform:capitalize;">${diaSemana}</span><span style="display:block; font-size:2rem; font-weight:800; letter-spacing:-1px;">${diaNum} de ${mes}</span>`;

    // Aplicar estilos corporativos al contenedor del título
    tituloFechaEl.style.background = "linear-gradient(135deg, #00897b 0%, #0e7490 100%)"; // Teal a Cyan oscuro
    tituloFechaEl.style.color = "white";
    tituloFechaEl.style.padding = "30px 20px";
    tituloFechaEl.style.margin = "0";
    tituloFechaEl.style.textAlign = "center";
    tituloFechaEl.style.textTransform = "capitalize";
    tituloFechaEl.style.position = "relative";

    // Ajustar el botón de cerrar para que se vea bien sobre el fondo oscuro
    const btnCerrar = document.getElementById('btnCerrarPopup');
    if (btnCerrar) {
      btnCerrar.style.color = "white";
      btnCerrar.style.opacity = "0.8";
      btnCerrar.style.zIndex = "10";
    }

    const btnCerrar2 = document.getElementById('btnCerrarPopup2');
    if (btnCerrar2) {
      btnCerrar2.style.background = "#eb567a";
      btnCerrar2.style.color = "white";
      btnCerrar2.style.border = "none";
      btnCerrar2.style.fontSize = "14px";
      btnCerrar2.style.fontWeight = "800";
      btnCerrar2.style.textTransform = "uppercase";
      btnCerrar2.style.padding = "14px";
      btnCerrar2.style.borderRadius = "10px";
      btnCerrar2.style.width = "calc(100% - 64px)";
      btnCerrar2.style.margin = "0 32px 32px 32px";
      btnCerrar2.style.boxShadow = "0 4px 12px rgba(235, 86, 122, 0.3)";
    }

    // Preparar contenido modal
    // Preparar contenido modal
    let html = `
      <style>
        .modal-grid { display: grid; grid-template-columns: 2fr 1fr; min-height: 400px; border-top: 1px solid #f3f4f6; }
        .modal-main { padding: 32px; }
        .modal-sidebar { background-color: #f9fafb; padding: 32px; border-left: 1px solid #f3f4f6; display: flex; flex-direction: column; }
        
        .class-title { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 12px 0; letter-spacing: -0.5px; }
        .meta-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f3f4f6; border-radius: 99px; font-size: 13px; color: #4b5563; font-weight: 600; }
        .meta-pill i { color: #0e7490; }
        
        .section-header { font-size: 12px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; margin-top: 32px; }
        
        .participant-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; transition: all 0.2s; margin-bottom: 10px; }
        .participant-card:hover { border-color: #d1d5db; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        
        /* Modal Avatars: Adjusted to Green-Pink gradient as requested */
        .modal-avatar, .t-avatar { 
            width: 40px; height: 40px; 
            background: linear-gradient(135deg, #39c5a7, #eb567a); 
            color: white; 
            border-radius: 50%; /* Uniform circular design */
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; 
            font-size: 16px; 
            box-shadow: 0 2px 6px rgba(57, 197, 167, 0.3); 
        }
        
        .modal-avatar { border-radius: 12px; } /* Clients sqircle */
        
        .trainer-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 8px; }
        .trainer-item .t-avatar { width: 32px; height: 32px; font-size: 13px; box-shadow: 0 2px 4px rgba(235, 86, 122, 0.2); }
        
        @media (max-width: 768px) {
            .modal-grid { grid-template-columns: 1fr; }
            .modal-sidebar { border-left: none; border-top: 1px solid #f3f4f6; }
        }
      </style>

      <div class="modal-grid">
        <!-- SECCIÓN PRINCIPAL: Info y Participantes -->
        <div class="modal-main">
            <div>
                <h3 class="class-title">${p.clase_nombre}</h3>
                <div style="display:flex; flex-wrap:wrap; gap:10px;">
                    <span class="meta-pill"><i class="fa-solid fa-clock"></i> ${p.hora}</span>
                    <span class="meta-pill"><i class="fa-solid fa-building"></i> ${p.centro}</span>
                    ${p.tipo_clase ? `<span class="meta-pill"><i class="fa-solid fa-layer-group"></i> ${p.tipo_clase}</span>` : ''}
                </div>
            </div>

            <h4 class="section-header">Asistentes confirmados (${p.alumnos ? p.alumnos.length : 0})</h4>
            <div>
    `;

    if (p.alumnos && p.alumnos.length > 0) {
      p.alumnos.forEach(alum => {
        html += `
          <div class="participant-card">
              <div style="display:flex; align-items:center; gap:12px;">
                  <div class="modal-avatar">
                      ${alum.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <div style="font-weight:700; color:#1f2937; font-size:15px;">${alum.nombre}</div>
                      <div style="font-size:12px; color:#6b7280;">Método: ${alum.pago}</div>
                  </div>
              </div>
              <div style="font-weight:700; color:#000000; font-size:15px;">€${Number(alum.coste).toFixed(2)}</div>
          </div>
        `;
      });
    } else {
      html += `
        <div style="text-align:center; padding:40px 20px; background:#f9fafb; border-radius:12px; border:1px dashed #e5e7eb;">
            <i class="fa-solid fa-users-slash" style="color:#d1d5db; font-size:24px; margin-bottom:10px;"></i>
            <p style="color:#6b7280; font-size:14px; margin:0;">No hay alumnos inscritos aún.</p>
        </div>`;
    }

    html += `
            </div>
        </div>

        <!-- SIDEBAR: Equipo Técnico y Acciones -->
        <div class="modal-sidebar">
            <h4 class="section-header" style="margin-top:0;">Equipo Técnico</h4>
            
            <div id="lista-entrenadores-sesion" style="flex: 1;">
              <!-- JS rendered list -->
            </div>

            <div style="margin-top:20px;" id="trainer-actions-wrapper">
                 ${(window.IS_ADMIN) ?
        `<label class="section-header" style="display:block; margin-bottom:10px;">Gestionar Personal</label>
                 <div style="display:flex; gap:8px;">
                    <select id="select-add-trainer" class="modern-input" style="padding:10px; font-size:13px;">
                        <option value="" selected disabled>Añadir entrenador...</option>
                        ${generarOpcionesEntrenadores()}
                    </select>
                    <button type="button" id="btn-add-trainer-action" 
                        style="background:#0e7490; color:white; border:none; width:40px; border-radius:8px; cursor:pointer;">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                 </div>`
        : (window.IS_TRAINER && window.CURRENT_USER_ID) ?
          // Lógica de botón de inscripción para entrenador
          (!p.entrenadores || !p.entrenadores.find(t => t.id === window.CURRENT_USER_ID)) ?
            `<button type="button" id="btn-join-session" 
                    style="width:100%; padding:12px; background:#10b981; color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.3);">
                    <i class="fa-solid fa-user-plus"></i> Inscribirme
                 </button>`
            : `<div style="padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; color:#166534; font-size:13px; display:flex; gap:8px; align-items:center;">
                        <i class="fa-solid fa-circle-check"></i> <span>Estás asignado a esta clase</span>
                   </div>`
          : ''
      }
            </div>

            ${(window.IS_ADMIN) ?
        `<div style="margin-top: auto; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <button type="button" id="btn-delete-full-session" 
                    style="width:100%; padding:12px; background:#fee2e2; color:#ef4444; border:1px solid #fecaca; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: all 0.2s;">
                    <i class="fa-solid fa-trash"></i> ELIMINAR SESIÓN
                </button>
                <p style="font-size:10px; color:#9ca3af; margin-top:8px; text-align:center;">Esta acción eliminará todos los pagos asociados.</p>
             </div>` : ''
      }
        </div>
      </div>`;

    listaPagosEl.innerHTML = html;

    // Renderizar entrenadores actuales
    renderEntrenadoresSesion(p.entrenadores || [], p.session_key);

    // Event Listener ELIMINAR SESIÓN COMPLETA (ADMIN)
    const btnDeleteFull = document.getElementById('btn-delete-full-session');
    if (btnDeleteFull) {
      btnDeleteFull.addEventListener('click', () => {
        eliminarSesionCompleta(p.session_key);
      });
    }

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

    // Event Listener para unirse (Entrenador)
    const btnJoin = document.getElementById('btn-join-session');
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        // Usamos window.CURRENT_USER_ID
        if (!window.CURRENT_USER_ID) return;
        agregarEntrenadorSesion(window.CURRENT_USER_ID, p.session_key, event);
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
      div.className = 'trainer-item'; // Usar la nueva clase 'trainer-item'
      // Eliminamos el style inline background white etc, ya que lo definimos en CSS

      div.innerHTML = `
             <div class="t-avatar">${t.initial || t.name.charAt(0)}</div>
             <span class="trainer-name" style="flex:1; font-size:14px; color:#374151; font-weight:500;">${t.name}</span>
             ${(window.IS_ADMIN || (window.IS_TRAINER && t.id === window.CURRENT_USER_ID)) ?
          `<button type="button" class="btn-icon btn-delete-trainer" style="border:none; background:none; cursor:pointer; color:#ef4444;" title="Eliminar">
                <i class="fa-solid fa-trash-can"></i>
             </button>` : ''}
          `;

      const btnDelete = div.querySelector('.btn-delete-trainer');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          eliminarEntrenadorSesion(t.id, sessionKey);
        });
      }

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

  async function eliminarSesionCompleta(sessionKey) {
    try {
      const formData = new FormData();
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await fetch('/Pagos/delete-session', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 1. Recargar calendario
        const currentSearch = document.getElementById('search-user')?.value || '';
        fetchAndRenderCalendar(currentSearch);

        // 2. Cerrar el modal
        closeModal(modalInfo);
      } else {
        alert(data.error || 'Error al eliminar la sesión');
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

      // Limpieza visual
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      document.querySelectorAll('.modern-input').forEach(el => el.style.borderColor = '');

      const formData = new FormData(formNuevaClase);
      const payload = Object.fromEntries(formData);

      // Arrays reales
      payload.users = formData.getAll('users[]').filter(v => v && v.trim() !== '');
      payload.trainers = formData.getAll('trainers[]').filter(v => v && v.trim() !== '');

      try {
        const res = await fetch(formNuevaClase.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        });

        // 👉 DEBUG CLAVE
        console.log('STATUS:', res.status);
        console.log('CONTENT-TYPE:', res.headers.get('content-type'));

        const text = await res.text();
        console.log('RESPONSE RAW:', text.slice(0, 300));

        // ⛔ Control de permisos ANTES de JSON
        if (res.status === 401) {
          alert('Sesión caducada. Vuelve a iniciar sesión.');
          return;
        }

        if (res.status === 403) {
          alert('No tienes permisos para realizar esta acción.');
          return;
        }

        if (res.status === 419) {
          alert('Error CSRF. Recarga la página.');
          return;
        }

        // Intentar parsear JSON solo si es JSON
        let json = null;
        if (text.trim().startsWith('{')) {
          json = JSON.parse(text);
        }

        // Errores de validación Laravel
        if (res.status === 422 && json?.errors) {
          Object.keys(json.errors).forEach(key => {
            if (key.startsWith('users.')) {
              const index = key.split('.')[1];
              const group = document.getElementById(`user-group-${index}`);
              if (group) mostrarError(group, json.errors[key][0]);
            } else {
              alert(json.errors[key][0]);
            }
          });
          return;
        }

        if (!res.ok) {
          alert('Error inesperado del servidor.');
          return;
        }

        if (json?.success) {
          const currentSearch = document.getElementById('search-user')?.value || '';
          fetchAndRenderCalendar(currentSearch);

          closeModal(modalNueva);
          formNuevaClase.reset();

          summaryEl.innerHTML = `
          <p style="color:#00897b">
            <strong>¡Guardado!</strong> Clase añadida correctamente.
          </p>
        `;
        }

      } catch (error) {
        console.error('CATCH ERROR:', error);
        alert('Error inesperado al guardar la clase.');
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