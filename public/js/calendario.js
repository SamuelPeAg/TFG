/* =========================
   CALENDARIO: FullCalendar + Modales + Lógica de Clientes
   (Refactorizado desde Pagos.js)
   ========================= */

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
    const btnConfirmarSalir = document.getElementById('btnConfirmarSalir');
    const logoutForm = document.getElementById('logout-form');

    // Helper detect view
    const getInitialView = () => window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';

    // ====== 1. CONFIGURACIÓN FULLCALENDAR ======
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: getInitialView(),
        windowResizeDelay: 100,
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

        // Dynamic events source with dual filters
        events: function (info, successCallback, failureCallback) {
            const centro = document.getElementById('filter-center')?.value || '';
            const userQ = document.getElementById('search-user')?.value || '';
            const url = `/usuarios/Pagos?start=${info.startStr}&end=${info.endStr}&centro=${encodeURIComponent(centro)}&q=${encodeURIComponent(userQ)}`;

            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error('Error en el servidor: ' + res.status);
                    return res.json();
                })
                .then(data => {
                    successCallback(data.events || []);
                })
                .catch(e => {
                    console.error('Error cargando eventos:', e);
                    failureCallback(e);
                });
        },

        eventClick: function (info) {
            mostrarDetallesEvento(info.event);
        },

        dateClick: function (info) {
            abrirModalNuevaClase(info.date);
        },

        windowResize: function (arg) {
            const newView = getInitialView();
            if (calendar.view.type !== newView) {
                calendar.changeView(newView);
            }
        }
    });

    calendar.render();

    // ====== PERSISTENCIA DE CENTRO ======
    const filterCenter = document.getElementById('filter-center');
    if (filterCenter) {
        // Cargar desde localStorage
        const savedCenter = localStorage.getItem('factomove_preferred_center');
        if (savedCenter) {
            filterCenter.value = savedCenter;
            calendar.refetchEvents();
        }

        // Guardar al cambiar
        filterCenter.addEventListener('change', () => {
            localStorage.setItem('factomove_preferred_center', filterCenter.value);
            calendar.refetchEvents();
        });
    }

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
        const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
        const diaNum = fechaObj.getDate();
        const mes = fechaObj.toLocaleDateString('es-ES', { month: 'long' });

        tituloFechaEl.innerHTML = `<span style="display:block; font-size:1.2rem; font-weight:400; opacity:0.9; text-transform:capitalize;">${diaSemana}</span><span style="display:block; font-size:2rem; font-weight:800; letter-spacing:-1px;">${diaNum} de ${mes}</span>`;
        tituloFechaEl.style.background = "linear-gradient(135deg, #00897b 0%, #0e7490 100%)";
        tituloFechaEl.style.color = "white";
        tituloFechaEl.style.padding = "30px 20px";
        tituloFechaEl.style.margin = "0";
        tituloFechaEl.style.textAlign = "center";
        tituloFechaEl.style.textTransform = "capitalize";
        tituloFechaEl.style.position = "relative";

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
        .modal-avatar, .t-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #39c5a7, #eb567a); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; box-shadow: 0 2px 6px rgba(57, 197, 167, 0.3); }
        .modal-avatar { border-radius: 12px; }
        .trainer-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 8px; }
        .trainer-item .t-avatar { width: 32px; height: 32px; font-size: 13px; box-shadow: 0 2px 4px rgba(235, 86, 122, 0.2); }
        @media (max-width: 768px) { .modal-grid { grid-template-columns: 1fr; } .modal-sidebar { border-left: none; border-top: 1px solid #f3f4f6; } }
      </style>
      <div class="modal-grid">
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
                  <div class="modal-avatar">${alum.nombre.charAt(0).toUpperCase()}</div>
                  <div>
                      <div style="font-weight:700; color:#1f2937; font-size:15px;">${alum.nombre}</div>
                      <div style="font-size:12px; color:#6b7280;">Método: ${alum.pago}</div>
                  </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                  <div style="font-weight:700; color:#000000; font-size:15px;">€${Number(alum.coste).toFixed(2)}</div>
                  ${(window.IS_ADMIN) ? `<button type="button" class="btn-icon btn-delete-client" data-id="${alum.id}" style="border:none; background:none; cursor:pointer; color:#ef4444;" title="Eliminar Alumno"><i class="fa-solid fa-trash-can"></i></button>` : ''}
              </div>
          </div>
        `;
            });
            // Add Delete Listeners after render
            setTimeout(() => {
                document.querySelectorAll('.btn-delete-client').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const uid = e.currentTarget.dataset.id;
                        eliminarClienteSesion(uid, p.session_key);
                    });
                });
            }, 100);
        } else {
            html += `
        <div style="text-align:center; padding:40px 20px; background:#f9fafb; border-radius:12px; border:1px dashed #e5e7eb;">
            <i class="fa-solid fa-users-slash" style="color:#d1d5db; font-size:24px; margin-bottom:10px;"></i>
            <p style="color:#6b7280; font-size:14px; margin:0;">No hay alumnos inscritos aún.</p>
        </div>`;
        }
        html += `
            </div>
            ${(window.IS_ADMIN) ? `
             <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #e5e7eb;">
                <label style="display:block; font-size:12px; font-weight:700; color:#6b7280; margin-bottom:10px;">AÑADIR ALUMNO</label>
                <button type="button" id="btn-open-add-client-modal" style="width:100%; padding:10px; background:#f3f4f6; color:#374151; border:1px solid #d1d5db; border-radius:8px; font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;">
                    <i class="fa-solid fa-user-plus"></i> Seleccionar Cliente
                </button>
             </div>
            ` : ''}
        </div>
        <div class="modal-sidebar">
            <h4 class="section-header" style="margin-top:0;">Equipo Técnico</h4>
            <div id="lista-entrenadores-sesion" style="flex: 1;"></div>
            <div style="margin-top:20px;" id="trainer-actions-wrapper">
                 ${(window.IS_ADMIN) ?
                `<label class="section-header" style="display:block; margin-bottom:10px;">Gestionar Personal</label>
                 <div style="display:flex; gap:8px;">
                    <select id="select-add-trainer" class="modern-input" style="padding:10px; font-size:13px;">
                        <option value="" selected disabled>Añadir entrenador...</option>
                        ${generarOpcionesEntrenadores()}
                    </select>
                    <button type="button" id="btn-add-trainer-action" style="background:#0e7490; color:white; border:none; width:40px; border-radius:8px; cursor:pointer;"><i class="fa-solid fa-plus"></i></button>
                 </div>`
                : (window.IS_TRAINER && window.CURRENT_USER_ID) ?
                    (!p.entrenadores || !p.entrenadores.find(t => t.id === window.CURRENT_USER_ID)) ?
                        `<button type="button" id="btn-join-session" style="width:100%; padding:12px; background:#10b981; color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-user-plus"></i> Inscribirme</button>`
                        : `<div style="padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; color:#166534; font-size:13px; display:flex; gap:8px; align-items:center;"><i class="fa-solid fa-circle-check"></i> <span>Estás asignado a esta clase</span></div>`
                    : ''
            }
            </div>
            ${(window.IS_ADMIN) ?
                `<div style="margin-top: auto; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <button type="button" id="btn-delete-full-session" style="width:100%; padding:12px; background:#fee2e2; color:#ef4444; border:1px solid #fecaca; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: all 0.2s;"><i class="fa-solid fa-trash"></i> ELIMINAR SESIÓN</button>
                <p style="font-size:10px; color:#9ca3af; margin-top:8px; text-align:center;">Esta acción eliminará todos los pagos asociados.</p>
             </div>` : ''
            }
        </div>
      </div>`;
        listaPagosEl.innerHTML = html;
        renderEntrenadoresSesion(p.entrenadores || [], p.session_key);

        const btnDeleteFull = document.getElementById('btn-delete-full-session');
        if (btnDeleteFull) btnDeleteFull.addEventListener('click', () => eliminarSesionCompleta(p.session_key));
        const btnAdd = document.getElementById('btn-add-trainer-action');
        if (btnAdd) btnAdd.addEventListener('click', () => {
            const select = document.getElementById('select-add-trainer');
            if (select.value) agregarEntrenadorSesion(select.value, p.session_key);
        });
        const btnJoin = document.getElementById('btn-join-session');
        if (btnJoin) btnJoin.addEventListener('click', () => {
            if (window.CURRENT_USER_ID) agregarEntrenadorSesion(window.CURRENT_USER_ID, p.session_key);
        });

        // Add Client Logic
        const btnOpenAddClient = document.getElementById('btn-open-add-client-modal');
        if (btnOpenAddClient) {
            btnOpenAddClient.addEventListener('click', () => {
                const currentIds = (p.alumnos || []).map(a => String(a.id));
                const max = getMaxClients(p.tipo_clase);

                openClientModal({
                    title: `Añadir a alumnos a <b>${p.clase_nombre}</b>`,
                    currentIds: currentIds,
                    maxLimit: max,
                    onConfirm: async (selectedUsers) => {
                        const newUsers = selectedUsers.filter(u => !currentIds.includes(String(u.id)));
                        if (newUsers.length === 0) {
                            closeModal(modalClientes); // Close the selector logic only
                            return;
                        }

                        // Add each user
                        for (const user of newUsers) {
                            await agregarClienteSesion(user.id, p.session_key, false);
                        }
                        // Refresh once at the end
                        await refreshModal(p.session_key);
                        // NO alert here as requested
                    }
                });
            });
        }

        openModal(modalInfo);
    }

    function generarOpcionesEntrenadores() {
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
            div.className = 'trainer-item';
            div.innerHTML = `
             <div class="t-avatar">${t.initial || t.name.charAt(0)}</div>
             <span class="trainer-name" style="flex:1; font-size:14px; color:#374151; font-weight:500;">${t.name}</span>
             ${(window.IS_ADMIN || (window.IS_TRAINER && t.id === window.CURRENT_USER_ID)) ?
                    `<button type="button" class="btn-icon btn-delete-trainer" style="border:none; background:none; cursor:pointer; color:#ef4444;" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>` : ''}
          `;
            const btnDelete = div.querySelector('.btn-delete-trainer');
            if (btnDelete) btnDelete.addEventListener('click', () => eliminarEntrenadorSesion(t.id, sessionKey));
            container.appendChild(div);
        });
    }

    // === NEW: REFRESH HELPER ===
    async function refreshModal(sessionKey) {
        // 1. Refresh calendar data
        const currentSearch = document.getElementById('search-user')?.value || '';
        await fetchAndRenderCalendar(currentSearch);

        // 2. Find the event with the same session key
        // We need to look through the calendar's client events
        const allEvents = calendar.getEvents();

        // Helper to match key
        const match = (ev) => {
            const ep = ev.extendedProps;
            if (!ep || !ep.session_key) return false;
            // Compare key fields. Note: formatting might vary (string vs number), try loose equality or strict if confident.
            return ep.session_key.fecha_hora === sessionKey.fecha_hora &&
                ep.session_key.nombre_clase === sessionKey.nombre_clase &&
                ep.session_key.centro === sessionKey.centro;
        };

        const found = allEvents.find(match);

        if (found) {
            // 3. Re-render modal with new event data
            mostrarDetallesEvento(found);
        } else {
            // If not found (maybe it was deleted?), close modal
            closeModal(modalInfo);
        }
    }

    async function agregarEntrenadorSesion(trainerId, sessionKey) {
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
                // Refresh modal, no alert, no close
                await refreshModal(sessionKey);
            } else { alert('Error al añadir entrenador'); }
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
                await refreshModal(sessionKey);
            } else { alert('Error al eliminar entrenador'); }
        } catch (e) { console.error(e); }
    }

    async function agregarClienteSesion(userId, sessionKey, shouldRefresh = true) {
        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch('/Pagos/add-client', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (shouldRefresh) {
                    await refreshModal(sessionKey);
                    // alert('Cliente añadido correctamente'); // REMOVED
                }
            } else { alert(data.error || 'Error al añadir cliente'); }
        } catch (e) { console.error(e); }
    }

    async function eliminarClienteSesion(userId, sessionKey) {
        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch('/Pagos/remove-client', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await refreshModal(sessionKey);
                // alert('Cliente eliminado correctamente'); // REMOVED
            } else { alert(data.error || 'Error al eliminar cliente'); }
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
                const currentSearch = document.getElementById('search-user')?.value || '';
                fetchAndRenderCalendar(currentSearch);
                closeModal(modalInfo); // Delete action still closes modal
            } else { alert(data.error || 'Error al eliminar la sesión'); }
        } catch (e) { console.error(e); }
    }

    // fetchAndRenderCalendar is now handled by calendar.refetchEvents() via the events source

    if (formNuevaClase) {
        formNuevaClase.addEventListener('submit', async (e) => {
            e.preventDefault();
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            document.querySelectorAll('.modern-input').forEach(el => el.style.borderColor = '');
            const formData = new FormData(formNuevaClase);
            const payload = Object.fromEntries(formData);
            payload.users = formData.getAll('users[]').filter(v => v && v.trim() !== '');
            payload.trainers = formData.getAll('trainers[]').filter(v => v && v.trim() !== '');

            // Validacion Minimo 4 personas para Grupos (ELIMINADA por solicitud)
            // const tipo = document.getElementById('tipo_clase').value;
            // if ((tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') && payload.users.length < 4) { ... }

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
                const text = await res.text();
                if (res.status === 401) { alert('Sesión caducada.'); return; }
                if (res.status === 403) { alert('No tienes permisos.'); return; }
                if (res.status === 419) { alert('Error CSRF.'); return; }
                let json = null;
                if (text.trim().startsWith('{')) json = JSON.parse(text);
                if (res.status === 422 && json?.errors) {
                    Object.keys(json.errors).forEach(key => {
                        if (key.startsWith('users.')) {
                            const index = key.split('.')[1];
                            const group = document.getElementById(`user-group-${index}`);
                            if (group) mostrarError(group, json.errors[key][0]);
                        } else { alert(json.errors[key][0]); }
                    });
                    return;
                }
                if (!res.ok) { alert('Error inesperado.'); return; }
                if (json?.success) {
                    calendar.refetchEvents();
                    closeModal(modalNueva);
                    formNuevaClase.reset();
                    summaryEl.innerHTML = `<p style="color:#00897b"><strong>¡Guardado!</strong> Clase añadida correctamente.</p>`;
                }
            } catch (error) { console.error('CATCH ERROR:', error); alert('Error inesperado.'); }
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

    const openModal = (m) => { if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); } };
    const closeModal = (m) => { if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } };

    document.querySelectorAll('.close-icon, .btn-close, .btn-cancel').forEach(b => {
        b.addEventListener('click', (e) => closeModal(e.target.closest('.modal-overlay')));
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (overlay.id === 'modalNuevaClase') return;
            if (overlay.id === 'infoPopup') return; // Do not close Details on background click
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

    // Moved below initAutocomplete to avoid losing listener after clone

    const usersJsonEl = document.getElementById('users_json');
    let USERS = [];
    try { USERS = JSON.parse(usersJsonEl.textContent || '[]'); } catch (e) { }

    window.initAutocomplete = function ({ inputEl, hiddenIdEl, boxEl }) {
        if (!inputEl || !boxEl) return;
        const newInput = inputEl.cloneNode(true);
        inputEl.parentNode.replaceChild(newInput, inputEl);
        inputEl = newInput;
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
                // Trigger calendar search after selection
                calendar.refetchEvents();
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target !== inputEl && !boxEl.contains(e.target)) boxEl.hidden = true;
        });
    };

    initAutocomplete({
        inputEl: document.getElementById('search-user'),
        hiddenIdEl: null,
        boxEl: document.getElementById('search_user_suggestions')
    });

    // Re-attach search listener to the cloned/final input
    const searchInput = document.getElementById('search-user');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(window.t);
            window.t = setTimeout(() => calendar.refetchEvents(), 400);
        });
    }

    const firstUserInput = document.querySelector('.user-search[data-index="0"]');
    if (firstUserInput) {
        firstUserInput.readOnly = true;
        firstUserInput.style.cursor = 'pointer';
        firstUserInput.style.backgroundColor = 'white';
        firstUserInput.placeholder = "Clic para seleccionar...";
        firstUserInput.addEventListener('click', () => openClientModalForNewClass());
    }

    window.cambiarTipoClase = function () {
        const tipo = document.getElementById('tipo_clase').value;
        const container = document.getElementById('usuarios-container');
        const btnAdd = document.getElementById('btnAddUser');
        let cantidad = 1;
        if (tipo === 'DUO') cantidad = 2;
        else if (tipo === 'TRIO') cantidad = 3;
        else if (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') cantidad = 1;
        if (btnAdd) btnAdd.style.display = (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') ? 'block' : 'none';
        container.innerHTML = '';
        for (let i = 0; i < cantidad; i++) agregarInputUsuario(i);
    };

    window.agregarInputUsuario = function (index = null, userData = null) {
        const container = document.getElementById('usuarios-container');
        if (index === null) index = container.children.length;
        const div = document.createElement('div');
        div.className = 'modern-form-group user-input-group';
        div.id = `user-group-${index}`;
        div.style.position = 'relative';
        div.innerHTML = `
          <label class="modern-label">Cliente ${index + 1}</label>
          <div class="input-wrapper input-with-action">
            <i class="fa-solid fa-user input-icon"></i>
            <input type="text" class="modern-input user-search" placeholder="Clic para seleccionar..." autocomplete="off" data-index="${index}" readonly style="cursor:pointer; background-color:white;" value="${userData ? userData.name : ''}">
            <input type="hidden" name="users[]" class="user-id-input" id="user_id_${index}" value="${userData ? userData.id : ''}">
            ${index > 0 ? `<button type="button" onclick="eliminarInput(${index})" class="btn-delete-input"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
      `;
        container.appendChild(div);
        const inputEl = div.querySelector('.user-search');
        inputEl.addEventListener('click', () => openClientModalForNewClass());
    };

    window.eliminarInput = function (index) {
        const el = document.getElementById(`user-group-${index}`);
        if (el) el.remove();
    };

    if (document.getElementById('btnAddUser')) {
        document.getElementById('btnAddUser').addEventListener('click', () => agregarInputUsuario());
    }

    const modalClientes = document.getElementById('modalSeleccionClientes');
    const btnCloseClients = document.querySelector('.btn-close-clients');
    const btnConfirmClients = document.getElementById('btnConfirmarClientes');
    const listContainer = document.getElementById('listaClientesModal');
    const searchModalInput = document.getElementById('inputBuscarClientesModal');
    let clientModalConfirmCallback = null;

    // Helper wrapper for New Class context
    window.openClientModalForNewClass = function () {
        const tipo = document.getElementById('tipo_clase').value;
        const max = getMaxClients(tipo);
        const currentIds = Array.from(document.querySelectorAll('.user-id-input')).map(el => el.value).filter(v => v);

        openClientModal({
            title: `Selecciona hasta <b>${max}</b> participantes para <b>${tipo}</b>`,
            currentIds: currentIds,
            maxLimit: max,
            onConfirm: (selectedUsers) => {
                const container = document.getElementById('usuarios-container');
                container.innerHTML = '';
                if (selectedUsers.length === 0) {
                    agregarInputUsuario(0);
                } else {
                    selectedUsers.forEach((user, idx) => agregarInputUsuario(idx, { id: user.id, name: user.name }));
                }
            }
        });
    }

    window.openClientModal = function ({ title, currentIds, maxLimit, onConfirm }) {
        if (!modalClientes) return;
        openModal(modalClientes);

        clientModalConfirmCallback = onConfirm;

        const titleSubtitle = modalClientes.querySelector('.modern-subtitle');
        if (titleSubtitle) {
            titleSubtitle.innerHTML = title || 'Seleccionar Clientes';
            titleSubtitle.dataset.max = maxLimit || 100;
        }

        renderListaClientes('', currentIds || [], maxLimit || 100);
        if (searchModalInput) {
            searchModalInput.value = '';
            setTimeout(() => searchModalInput.focus(), 100);
        }
    };

    if (btnCloseClients) btnCloseClients.addEventListener('click', () => closeModal(modalClientes));

    if (searchModalInput) {
        searchModalInput.addEventListener('input', (e) => {
            const subtitle = modalClientes.querySelector('.modern-subtitle');
            const max = subtitle ? parseInt(subtitle.dataset.max) : 100;
            const currentIdsFromDom = Array.from(document.querySelectorAll('input[name="modal_client[]"]:checked')).map(c => c.value);
            renderListaClientes(e.target.value, currentIdsFromDom, max);
        });
    }

    if (btnConfirmClients) {
        btnConfirmClients.addEventListener('click', () => {
            if (clientModalConfirmCallback) {
                const checked = document.querySelectorAll('input[name="modal_client[]"]:checked');
                const selectedUsers = Array.from(checked).map(chk => ({ id: chk.value, name: chk.dataset.name }));
                clientModalConfirmCallback(selectedUsers);
            }
            closeModal(modalClientes);
        });
    }

    function getMaxClients(tipo) {
        switch (tipo) {
            case 'EP': return 1;
            case 'DUO': return 2;
            case 'TRIO': return 3;
            case 'GRUPO_PRIVADO':
            case 'GRUPO': return 6;
            default: return 100;
        }
    }

    function renderListaClientes(query, selectedIds = [], maxLimit = 100) {
        if (!listContainer) return;
        listContainer.innerHTML = '';
        const q = query.toLowerCase().trim();
        const filtered = USERS.filter(u => u.name.toLowerCase().includes(q));
        if (filtered.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; color:#9ca3af; padding:20px;">No se encontraron clientes</div>`;
            return;
        }
        const currentCount = selectedIds.length;
        const limitReached = currentCount >= maxLimit;
        const toRender = filtered.slice(0, 100);
        toRender.forEach(u => {
            const isChecked = selectedIds.includes(String(u.id));
            const isDisabled = !isChecked && limitReached;
            const label = document.createElement('label');
            label.className = 'client-option';
            if (isDisabled) label.style.opacity = '0.5';
            label.innerHTML = `
            <input type="checkbox" name="modal_client[]" value="${u.id}" data-name="${u.name}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
            <div class="client-card" style="${isDisabled ? 'cursor:not-allowed;' : ''}">
                <div class="client-info">
                    <div class="avatar-circle-sm" style="background:${isChecked ? '#4BB7AE' : '#ccc'};">${u.name.charAt(0).toUpperCase()}</div>
                    <span style="font-size:14px; font-weight:600; color:#374151;">${u.name}</span>
                </div>
                <i class="fa-solid fa-check check-icon" style="color:#4BB7AE;"></i>
            </div>
      `;
            const chk = label.querySelector('input');
            const avatar = label.querySelector('.avatar-circle-sm');
            chk.addEventListener('change', () => {
                avatar.style.background = chk.checked ? '#4BB7AE' : '#ccc';
                const checkedCount = listContainer.querySelectorAll('input[type="checkbox"]:checked').length;
                const nowFull = checkedCount >= maxLimit;
                const allChecks = listContainer.querySelectorAll('input[type="checkbox"]:not(:checked)');
                allChecks.forEach(c => {
                    c.disabled = nowFull;
                    c.closest('.client-option').style.opacity = nowFull ? '0.5' : '1';
                    c.nextElementSibling.style.cursor = nowFull ? 'not-allowed' : 'pointer';
                });
            });
            listContainer.appendChild(label);
        });
    }
});
