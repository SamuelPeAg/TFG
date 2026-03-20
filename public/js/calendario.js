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
    window.calendar = new FullCalendar.Calendar(calendarEl, {
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
            const url = `${window.BASE_URL || ''}/usuarios/Pagos?start=${info.startStr}&end=${info.endStr}&centro=${encodeURIComponent(centro)}&q=${encodeURIComponent(userQ)}`;

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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'No se pudieron cargar las clases. Revisa tu conexión o sesión.',
                        confirmButtonColor: '#4BB7AE'
                    });
                    failureCallback(e);
                });
        },

        eventClick: function (info) {
            if (info.jsEvent) info.jsEvent.preventDefault();
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
            console.log("Cargando centro preferido:", savedCenter);
            filterCenter.value = savedCenter;
            setTimeout(() => {
                if (window.calendar) window.calendar.refetchEvents();
            }, 500);
        }

        // Guardar al cambiar (usamos change e input para máxima compatibilidad)
        const onCenterChange = () => {
            console.log("Cambio de centro detectado:", filterCenter.value);
            localStorage.setItem('factomove_preferred_center', filterCenter.value);
            if (window.calendar) window.calendar.refetchEvents();
            else console.warn("Calendario no disponible para refetch");
        };

        // Eventos nativos
        ['change', 'input'].forEach(evt => filterCenter.addEventListener(evt, onCenterChange));

        // Evento especial de Select2 (si se está usando)
        if (typeof $ !== 'undefined') {
            $(filterCenter).on('change', onCenterChange);
        }
    }

    // ====== 2. LÓGICA DE CLICK EN FECHA ======
    function abrirModalNuevaClase(dateObj) {
        openModal(modalNueva);

        const offsetMs = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - offsetMs)).toISOString().slice(0, 16);

        if (inputFechaHora) inputFechaHora.value = localISOTime;
        
        // Re-init select2 for modal
        if (typeof window.initWizardSelects === 'function') {
            window.initWizardSelects();
        }
    }

    // ====== 3. MOSTRAR DETALLES EVENTO (REDISEÑADO) ======
    function mostrarDetallesEvento(event) {
        try {
            const p = event.extendedProps;
            if (!p) throw new Error("Faltan datos en el evento");

            const fechaObj = event.start;
            const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
            const diaNum = fechaObj.getDate();
            const mes = fechaObj.toLocaleDateString('es-ES', { month: 'long' });

            tituloFechaEl.innerHTML = `
                <div class="relative z-10 flex flex-col items-center">
                    <span class="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">${diaSemana}</span>
                    <span class="text-4xl font-black text-white">${diaNum} <span class="text-xl font-medium text-white/70">de ${mes}</span></span>
                </div>
            `;
            tituloFechaEl.className = "relative py-12 px-8 text-center text-white bg-slate-900 overflow-hidden";

            let html = `
                <div class="flex flex-col lg:flex-row min-h-[450px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    <div class="flex-1 p-8 md:p-12">
                        <div class="mb-10">
                            <h3 class="text-3xl font-black text-slate-900 mb-4 tracking-tighter">${p.clase_nombre}</h3>
                            <div class="flex flex-wrap gap-3">
                                <span class="px-4 py-1.5 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <i class="fa-solid fa-clock text-brandTeal"></i> ${p.hora}
                                </span>
                                <span class="px-4 py-1.5 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <i class="fa-solid fa-building text-brandTeal"></i> ${p.centro}
                                </span>
                                ${p.tipo_clase ? `
                                <span class="px-4 py-1.5 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <i class="fa-solid fa-layer-group text-brandTeal"></i> ${p.tipo_clase}
                                </span>` : ''}
                            </div>
                        </div>

                        <div class="flex items-center justify-between mb-6">
                            <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Asistentes Confirmados (${p.alumnos ? p.alumnos.length : 0})</h4>
                        </div>

                        <div class="space-y-3">
            `;

            if (p.alumnos && p.alumnos.length > 0) {
                p.alumnos.forEach(alum => {
                    html += `
                        <div class="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-brandTeal/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brandTeal/20 to-teal-100 flex items-center justify-center text-brandTeal font-black text-lg">
                                    ${alum.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="font-black text-slate-900 text-sm tracking-tight">${alum.nombre}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${alum.pago}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-sm font-black text-slate-900">€${Number(alum.coste).toFixed(2)}</div>
                                ${(window.IS_ADMIN) ? `
                                <button type="button" class="btn-delete-client w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-brandCoral hover:bg-brandCoral/10 transition-all font-bold" data-id="${alum.id}" title="Eliminar Alumno">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>` : ''}
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
                    <div class="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-300">
                        <i class="fa-solid fa-users-slash text-4xl mb-4 opacity-20"></i>
                        <p class="text-sm font-bold uppercase tracking-widest opacity-50">No hay alumnos inscritos</p>
                    </div>`;
            }

            html += `
                        </div>
                        ${(window.IS_ADMIN) ? `
                        <div class="mt-8 pt-8 border-t border-slate-100">
                            <button type="button" id="btn-open-add-client-modal" class="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[11px] uppercase tracking-widest hover:border-brandTeal hover:text-brandTeal hover:bg-brandTeal/5 transition-all flex items-center justify-center gap-3">
                                <i class="fa-solid fa-user-plus"></i> Seleccionar Cliente
                            </button>
                        </div>` : ''}
                    </div>

                    <div class="w-full lg:w-[320px] bg-slate-50/50 p-8 md:p-12 flex flex-col">
                        <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Equipo Técnico</h4>
                        <div id="lista-entrenadores-sesion" class="flex-1 space-y-3"></div>

                        <div class="mt-10" id="trainer-actions-wrapper">
                            ${(window.IS_ADMIN) ? `
                            <div class="space-y-4">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asignar Personal</label>
                                <div class="flex gap-2">
                                    <select id="select-add-trainer" class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-brandTeal/20 outline-none">
                                        <option value="" selected disabled>Elegir...</option>
                                        ${generarOpcionesEntrenadores()}
                                    </select>
                                    <button type="button" id="btn-add-trainer-action" class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-brandTeal transition-all duration-300">
                                        <i class="fa-solid fa-plus text-xs"></i>
                                    </button>
                                </div>
                            </div>`
                            : (window.IS_TRAINER && window.CURRENT_USER_ID) ?
                                (!p.entrenadores || !p.entrenadores.find(t => t.id === window.CURRENT_USER_ID)) ?
                                    `<button type="button" id="btn-join-session" class="w-full py-4 bg-brandTeal text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brandTeal/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-user-plus"></i> Inscribirme
                                    </button>`
                                    : `<div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-circle-check"></i> <span>Asignado</span>
                                    </div>`
                                : ''
                            }
                        </div>

                        ${(window.IS_ADMIN) ? `
                        <div class="mt-12 pt-8 border-t border-slate-200">
                            <button type="button" id="btn-delete-full-session" class="w-full py-4 text-brandCoral font-black text-[10px] uppercase tracking-[0.25em] hover:bg-brandCoral/5 rounded-2xl transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-trash-can"></i> Eliminar Sesión
                            </button>
                        </div>` : ''}
                    </div>
                </div>
            `;
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
                                closeModal(modalClientes);
                                return;
                            }
                            for (const user of newUsers) {
                                const refresh = (user === newUsers[newUsers.length - 1]);
                                await agregarClienteSesion(user, p.session_key, refresh);
                            }
                        }
                    });
                });
            }

            openModal(modalInfo);
        } catch (e) {
            console.error("Error al mostrar detalles:", e);
            alert("Error JS: " + e.message);
        }
    }

    function generarOpcionesEntrenadores() {
        const coaches = window.TRAINERS || [];
        if (coaches.length === 0) return '<option disabled>Sin personal disponible</option>';
        return coaches.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    function renderEntrenadoresSesion(entrenadores, sessionKey) {
        const container = document.getElementById('lista-entrenadores-sesion');
        if (!container) return;
        container.innerHTML = '';
        if (!entrenadores || entrenadores.length === 0) {
            container.innerHTML = `<div class="p-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] uppercase font-black tracking-widest text-center">Sin asignación</div>`;
            return;
        }
        entrenadores.forEach(t => {
            const div = document.createElement('div');
            div.className = "flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl";
            div.innerHTML = `
                <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">${t.initial || t.name.charAt(0)}</div>
                <span class="flex-1 font-bold text-slate-700 text-xs">${t.name}</span>
                ${(window.IS_ADMIN || (window.IS_TRAINER && t.id === window.CURRENT_USER_ID)) ?
                    `<button type="button" class="btn-delete-trainer w-6 h-6 flex items-center justify-center text-slate-300 hover:text-brandCoral transition-colors"><i class="fa-solid fa-trash-can text-[10px]"></i></button>` : ''}
            `;
            const btnDelete = div.querySelector('.btn-delete-trainer');
            if (btnDelete) btnDelete.addEventListener('click', () => eliminarEntrenadorSesion(t.id, sessionKey));
            container.appendChild(div);
        });
    }

    // === OPTIMISTIC UI HELPER ===
    function findEventBySessionKey(sessionKey) {
        if (!calendar) return null;
        const all = calendar.getEvents();
        return all.find(ev => {
            const ep = ev.extendedProps;
            if (!ep || !ep.session_key) return false;
            return ep.session_key.fecha_hora === sessionKey.fecha_hora &&
                ep.session_key.nombre_clase === sessionKey.nombre_clase &&
                ep.session_key.centro === sessionKey.centro;
        });
    }

    async function agregarEntrenadorSesion(trainerId, sessionKey) {
        const event = findEventBySessionKey(sessionKey);
        const originalTrainers = event ? [...(event.extendedProps.entrenadores || [])] : [];
        if (event) {
            const select = document.getElementById('select-add-trainer');
            const trainerName = select ? select.options[select.selectedIndex].text : 'Cargando...';
            const newTrainers = [...originalTrainers, { id: parseInt(trainerId), name: trainerName, initial: trainerName.charAt(0) }];
            event.setExtendedProp('entrenadores', newTrainers);
            mostrarDetallesEvento(event);
        }
        try {
            const formData = new FormData();
            formData.append('trainer_id', trainerId);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch(`${window.BASE_URL || ''}/Pagos/add-trainer`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (event) {
                    event.setExtendedProp('entrenadores', data.trainers);
                    mostrarDetallesEvento(event);
                }
            } else {
                alert('Error al añadir entrenador');
                if (event) {
                    event.setExtendedProp('entrenadores', originalTrainers);
                    mostrarDetallesEvento(event);
                }
            }
        } catch (e) {
            if (event) {
                event.setExtendedProp('entrenadores', originalTrainers);
                mostrarDetallesEvento(event);
            }
        }
    }

    async function eliminarEntrenadorSesion(trainerId, sessionKey) {
        const event = findEventBySessionKey(sessionKey);
        const originalTrainers = event ? [...(event.extendedProps.entrenadores || [])] : [];
        if (event) {
            const newTrainers = originalTrainers.filter(t => t.id != trainerId);
            event.setExtendedProp('entrenadores', newTrainers);
            mostrarDetallesEvento(event);
        }
        try {
            const formData = new FormData();
            formData.append('trainer_id', trainerId);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch(`${window.BASE_URL || ''}/Pagos/remove-trainer`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (event) {
                    event.setExtendedProp('entrenadores', data.trainers);
                    mostrarDetallesEvento(event);
                }
            } else {
                alert('Error al eliminar entrenador');
                if (event) {
                    event.setExtendedProp('entrenadores', originalTrainers);
                    mostrarDetallesEvento(event);
                }
            }
        } catch (e) {
            if (event) {
                event.setExtendedProp('entrenadores', originalTrainers);
                mostrarDetallesEvento(event);
            }
        }
    }

    async function agregarClienteSesion(user, sessionKey, shouldRefresh = true) {
        const event = findEventBySessionKey(sessionKey);
        const originalAlumnos = event ? [...(event.extendedProps.alumnos || [])] : [];
        if (event) {
            const newAlumnos = [...originalAlumnos, { id: user.id, nombre: user.name, pago: '...', coste: '...' }];
            event.setExtendedProp('alumnos', newAlumnos);
            mostrarDetallesEvento(event);
        }
        try {
            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch(`${window.BASE_URL || ''}/Pagos/add-client`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (shouldRefresh) refreshModal(sessionKey);
            } else {
                alert(data.error || 'Error al añadir cliente');
                if (event) {
                    event.setExtendedProp('alumnos', originalAlumnos);
                    mostrarDetallesEvento(event);
                }
            }
        } catch (e) {
            if (event) {
                event.setExtendedProp('alumnos', originalAlumnos);
                mostrarDetallesEvento(event);
            }
        }
    }

    async function refreshModal(sessionKey) {
        const center = sessionKey.centro;
        const url = `${window.BASE_URL || ''}/usuarios/Pagos?start=${sessionKey.fecha_hora}&end=${sessionKey.fecha_hora}&centro=${encodeURIComponent(center)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.events && data.events.length > 0) {
                const event = findEventBySessionKey(sessionKey);
                if (event) {
                    const match = data.events.find(ev => ev.extendedProps?.session_key?.fecha_hora === sessionKey.fecha_hora);
                    if (match) {
                        event.setExtendedProp('alumnos', match.extendedProps.alumnos);
                        event.setExtendedProp('entrenadores', match.extendedProps.entrenadores);
                        mostrarDetallesEvento(event);
                    }
                }
            }
        } catch (e) { }
    }

    async function eliminarClienteSesion(userId, sessionKey) {
        const event = findEventBySessionKey(sessionKey);
        const originalAlumnos = event ? [...(event.extendedProps.alumnos || [])] : [];
        if (event) {
            const newAlumnos = originalAlumnos.filter(a => a.id != userId);
            event.setExtendedProp('alumnos', newAlumnos);
            mostrarDetallesEvento(event);
        }
        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('fecha_hora', sessionKey.fecha_hora);
            formData.append('nombre_clase', sessionKey.nombre_clase);
            formData.append('centro', sessionKey.centro);
            const res = await fetch(`${window.BASE_URL || ''}/Pagos/remove-client`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error al eliminar cliente', confirmButtonColor: '#4BB7AE' });
                if (event) {
                    event.setExtendedProp('alumnos', originalAlumnos);
                    mostrarDetallesEvento(event);
                }
            }
        } catch (e) {
            if (event) {
                event.setExtendedProp('alumnos', originalAlumnos);
                mostrarDetallesEvento(event);
            }
        }
    }

    async function eliminarSesionCompleta(sessionKey) {
        Swal.fire({
            title: '¿Eliminar sesión completa?',
            text: `Se borrarán todos los pagos y reservas de "${sessionKey.nombre_clase}". Esta acción es irreversible.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5D7A',
            cancelButtonColor: '#4BB7AE',
            confirmButtonText: 'Sí, eliminar sesión',
            cancelButtonText: 'Cancelar',
            customClass: { 
                popup: 'rounded-[32px] shift-left-alert' 
            },
            didOpen: (popup) => {
                popup.style.zIndex = '10000'; // Fuerza que esté por delante
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const formData = new FormData();
                    formData.append('fecha_hora', sessionKey.fecha_hora);
                    formData.append('nombre_clase', sessionKey.nombre_clase);
                    formData.append('centro', sessionKey.centro);
                    const res = await fetch(`${window.BASE_URL || ''}/Pagos/delete-session`, {
                        method: 'POST',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                        body: formData
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        Swal.fire({ icon: 'success', title: 'Sesión eliminada', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[32px]' } });
                        const event = findEventBySessionKey(sessionKey);
                        if (event) event.remove();
                        closeModal(modalInfo);
                    } else { 
                        Swal.fire('Error', data.error || 'No se pudo eliminar la sesión', 'error');
                    }
                } catch (e) { 
                    Swal.fire('Error', 'Error de conexión al intentar eliminar', 'error');
                }
            }
        });
    }

    if (formNuevaClase) {
        formNuevaClase.addEventListener('submit', async (e) => {
            e.preventDefault();
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            const formData = new FormData(formNuevaClase);
            const payload = Object.fromEntries(formData);
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
                const data = await res.json();
                if (res.status === 422 && data.errors) {
                    Object.keys(data.errors).forEach(key => alert(data.errors[key][0]));
                    return;
                }
                if (data.success) {
                    calendar.refetchEvents();
                    closeModal(modalNueva);
                    formNuevaClase.reset();
                }
            } catch (error) { alert('Error inesperado.'); }
        });
    }

    window.openModal = (m) => { if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); m.style.display = 'flex'; } };
    window.closeModal = (m) => { if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); m.style.display = 'none'; } };

    document.querySelectorAll('.close-icon, .btn-close, .btn-cancel, #btnCerrarPopup, #btnCerrarPopup2').forEach(b => {
        b.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal(e.target.closest('.modal-overlay'));
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (overlay.id === 'modalNuevaClase' || overlay.id === 'infoPopup') return;
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

    if (btnConfirmarSalir) btnConfirmarSalir.addEventListener('click', () => { if (logoutForm) logoutForm.submit(); });

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
            
            const clearBtn = document.getElementById('btn-clear-filters');
            if (clearBtn) clearBtn.classList.toggle('hidden', q.length === 0);

            // Refetch calendar on every stroke to show filter in real-time
            if (window.calendar) window.calendar.refetchEvents();

            if (q.length < 1) { show([]); return; }
            show(USERS.filter(u => u.name.toLowerCase().includes(q)).slice(0, 8));
        });
        boxEl.addEventListener('mousedown', (e) => {
            const item = e.target.closest('.item');
            if (item) {
                inputEl.value = item.dataset.name;
                if (hiddenIdEl) hiddenIdEl.value = item.dataset.id;
                boxEl.hidden = true;
                if (window.calendar) window.calendar.refetchEvents();
            }
        });

        // Clear filter button logic
        const clearBtn = document.getElementById('btn-clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                inputEl.value = '';
                if (hiddenIdEl) hiddenIdEl.value = '';
                
                // Reset center dropdown as well
                const fc = document.getElementById('filter-center');
                if (fc) {
                    fc.value = '';
                    localStorage.removeItem('factomove_preferred_center');
                }

                if (window.calendar) window.calendar.refetchEvents();
                show([]);
            });
        }
    };

    initAutocomplete({ inputEl: document.getElementById('search-user'), boxEl: document.getElementById('search_user_suggestions') });

    window.cambiarTipoClase = function () {
        const tipo = document.getElementById('tipo_clase').value;
        const container = document.getElementById('usuarios-container');
        const btnAdd = document.getElementById('btnAddUser');
        let cantidad = 1;
        if (tipo === 'DUO') cantidad = 2;
        else if (tipo === 'TRIO') cantidad = 3;
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
        div.innerHTML = `
          <div class="input-wrapper input-with-action">
            <input type="text" class="modern-input user-search" placeholder="Clic para seleccionar..." data-index="${index}" readonly style="cursor:pointer; background-color:white;" value="${userData ? userData.name : ''}">
            <input type="hidden" name="users[]" class="user-id-input" id="user_id_${index}" value="${userData ? userData.id : ''}">
            ${index > 0 ? `<button type="button" onclick="eliminarInput(${index})" class="btn-delete-input"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        `;
        container.appendChild(div);
        div.querySelector('.user-search').addEventListener('click', () => openClientModalForNewClass());
    };

    window.eliminarInput = (index) => { const el = document.getElementById(`user-group-${index}`); if (el) el.remove(); };
    if (document.getElementById('btnAddUser')) document.getElementById('btnAddUser').addEventListener('click', () => agregarInputUsuario());

    const modalClientes = document.getElementById('modalSeleccionClientes');
    const btnConfirmClients = document.getElementById('btnConfirmarClientes');
    const listContainer = document.getElementById('listaClientesModal');
    const searchModalInput = document.getElementById('inputBuscarClientesModal');
    let clientModalConfirmCallback = null;

    window.openClientModalForNewClass = function () {
        const tipo = document.getElementById('tipo_clase').value;
        const max = getMaxClients(tipo);
        const currentIds = Array.from(document.querySelectorAll('.user-id-input')).map(el => el.value).filter(v => v);
        openClientModal({
            title: `Selecciona participantes para <b>${tipo}</b>`,
            currentIds: currentIds,
            maxLimit: max,
            onConfirm: (selectedUsers) => {
                const container = document.getElementById('usuarios-container');
                container.innerHTML = '';
                if (selectedUsers.length === 0) agregarInputUsuario(0);
                else selectedUsers.forEach((user, idx) => agregarInputUsuario(idx, { id: user.id, name: user.name }));
            }
        });
    }

    window.openClientModal = function ({ title, currentIds, maxLimit, onConfirm }) {
        if (!modalClientes) return;
        openModal(modalClientes);
        clientModalConfirmCallback = onConfirm;
        const titleSubtitle = modalClientes.querySelector('.modern-subtitle');
        if (titleSubtitle) { titleSubtitle.innerHTML = title; titleSubtitle.dataset.max = maxLimit; }
        renderListaClientes('', currentIds || [], maxLimit);
        if (searchModalInput) { searchModalInput.value = ''; setTimeout(() => searchModalInput.focus(), 100); }
    };

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
                clientModalConfirmCallback(Array.from(checked).map(chk => ({ id: chk.value, name: chk.dataset.name })));
            }
            closeModal(modalClientes);
        });
    }

    function getMaxClients(tipo) {
        if (!tipo) return 100;
        const t = tipo.toLowerCase();
        if (t === 'ep') return 1;
        if (t === 'duo') return 2;
        if (t === 'trio') return 3;
        return (t.includes('grupo')) ? 10 : 100;
    }

    function renderListaClientes(query, selectedIds = [], maxLimit = 100) {
        if (!listContainer) return;
        listContainer.innerHTML = '';
        const q = query.toLowerCase().trim();
        const filtered = USERS.filter(u => u.name.toLowerCase().includes(q));
        if (filtered.length === 0) { listContainer.innerHTML = `<div class="p-8 text-center text-slate-400 font-bold">No se encontraron clientes</div>`; return; }
        const limitReached = selectedIds.length >= maxLimit;
        filtered.slice(0, 100).forEach(u => {
            const isChecked = selectedIds.includes(String(u.id));
            const isDisabled = !isChecked && limitReached;
            const label = document.createElement('label');
            label.className = 'client-option flex items-center p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all';
            if (isDisabled) label.style.opacity = '0.4';
            label.innerHTML = `
                <input type="checkbox" class="hidden" name="modal_client[]" value="${u.id}" data-name="${u.name}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <div class="flex items-center gap-3 w-full">
                    <div class="w-10 h-10 rounded-lg ${isChecked ? 'bg-brandTeal' : 'bg-slate-200'} text-white flex items-center justify-center font-black transition-all">
                        ${u.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="flex-1 font-bold text-slate-700">${u.name}</span>
                    <div class="w-6 h-6 border-2 ${isChecked ? 'bg-brandTeal border-brandTeal' : 'border-slate-200'} rounded-full flex items-center justify-center transition-all">
                        ${isChecked ? '<i class="fa-solid fa-check text-white text-[10px]"></i>' : ''}
                    </div>
                </div>
            `;
            const chk = label.querySelector('input');
            chk.addEventListener('change', () => {
                const currentIdsFromDom = Array.from(document.querySelectorAll('input[name="modal_client[]"]:checked')).map(c => c.value);
                renderListaClientes(query, currentIdsFromDom, maxLimit);
            });
            listContainer.appendChild(label);
        });
    }
});
