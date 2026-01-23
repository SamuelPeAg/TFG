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

    eventClick: function(info) {
      mostrarDetallesEvento(info.event);
    },

    dateClick: function(info) {
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
      
      if(inputFechaHora) inputFechaHora.value = localISOTime;
  }

  // ====== 3. MOSTRAR DETALLES EVENTO ======
  function mostrarDetallesEvento(event) {
      const p = event.extendedProps;
      const fechaTxt = event.start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      
      tituloFechaEl.textContent = `Detalles: ${fechaTxt}`;
      listaPagosEl.innerHTML = `
        <div class="sesion-card" style="border-left: 5px solid #00897b; padding: 15px; background: #f9fafb;">
            <h3 style="margin-top:0; color:#00897b">${event.title}</h3>
            <p><strong><i class="fa-solid fa-clock"></i> Hora:</strong> ${p.hora}</p>
            <p><strong><i class="fa-solid fa-user"></i> Alumno:</strong> ${p.alumno}</p>
            <p><strong><i class="fa-solid fa-building"></i> Centro:</strong> ${p.centro}</p>
            <p><strong><i class="fa-solid fa-euro-sign"></i> Precio:</strong> €${Number(p.coste).toFixed(2)}</p>
            <p><strong><i class="fa-solid fa-credit-card"></i> Método:</strong> ${p.pago}</p>
        </div>
      `;
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
        
        if(!document.getElementById('user_id').value) {
            alert("Selecciona un usuario válido."); return;
        }

        const formData = new FormData(formNuevaClase);
        try {
            const res = await fetch(formNuevaClase.action, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!res.ok) throw new Error('Error al guardar');
            const json = await res.json();

            if (json.success) {
                calendar.addEvent(json.event);
                closeModal(modalNueva);
                formNuevaClase.reset();
                summaryEl.innerHTML = `<p style="color:#00897b"><strong>¡Guardado!</strong> Clase añadida.</p>`;
            }
        } catch (error) { alert("Error al guardar la clase."); }
    });
  }

  // ====== 6. UTILIDADES GENÉRICAS ======
  const openModal = (m) => { if(m) { m.classList.add('active'); m.setAttribute('aria-hidden','false'); }};
  const closeModal = (m) => { if(m) { m.classList.remove('active'); m.setAttribute('aria-hidden','true'); }};

  document.querySelectorAll('.close-icon, .btn-close, .btn-cancel').forEach(b => {
    b.addEventListener('click', (e) => closeModal(e.target.closest('.modal-overlay')));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
    });
  });

  if(document.getElementById('btnNuevaClase')) 
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
          if(logoutForm) logoutForm.submit();
      });
  }

  // ====== 8. BUSCADOR Y AUTOCOMPLETE ======
  const searchInput = document.getElementById('search-user');
  if(searchInput) searchInput.addEventListener('input', (e) => {
     clearTimeout(window.t); window.t = setTimeout(() => fetchAndRenderCalendar(e.target.value.trim()), 400);
  });

  const usersJsonEl = document.getElementById('users_json');
  let USERS = [];
  try { USERS = JSON.parse(usersJsonEl.textContent || '[]'); } catch (e) {}

  function initAutocomplete({ inputEl, hiddenIdEl, boxEl }) {
    if (!inputEl || !boxEl) return;
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
    boxEl.addEventListener('mousedown', (e) => {
        const item = e.target.closest('.item');
        if (item) {
            inputEl.value = item.dataset.name;
            if (hiddenIdEl) hiddenIdEl.value = item.dataset.id;
            boxEl.hidden = true;
        }
    });
    document.addEventListener('click', (e) => { if (e.target !== inputEl) boxEl.hidden = true; });
  }

  initAutocomplete({
    inputEl: document.getElementById('user_search'),
    hiddenIdEl: document.getElementById('user_id'),
    boxEl: document.getElementById('user_suggestions')
  });
  initAutocomplete({
    inputEl: document.getElementById('search-user'),
    hiddenIdEl: null,
    boxEl: document.getElementById('search_user_suggestions')
  });
});