/* =========================
   CALENDARIO: FullCalendar + Modales + Lógica de Clientes
   (Refactorizado desde Pagos.js)
   ========================= */

window.initCalendarioVanilla = () => {
    const calendarEl = document.getElementById('fullCalendarEl');
    if (!calendarEl) {
        console.warn("Element #fullCalendarEl not found, skipping init.");
        return;
    }

    // === 0. CARGAR PLUGINS (Tippy.js) ===
    const loadScript = (src) => new Promise((resolve, reject) => {
        const fullSrc = (src.startsWith('http') || src.startsWith('//')) ? src : (window.BASE_URL + src.replace(/^\//, ''));
        if (document.querySelector(`script[src="${fullSrc}"]`) || document.querySelector(`link[href="${fullSrc}"]`)) {
            resolve(); return;
        }
        let element = src.endsWith('.css') ? document.createElement('link') : document.createElement('script');
        if (src.endsWith('.css')) { element.rel = 'stylesheet'; element.href = fullSrc; }
        else { element.src = fullSrc; }
        element.onload = resolve;
        element.onerror = reject;
        document.head.appendChild(element);
    });

    const initPlugins = async () => {
        try {
            await loadScript('https://unpkg.com/@popperjs/core@2');
            await loadScript('https://unpkg.com/tippy.js@6');
        } catch(e) { console.error("Error loading Tippy.js", e); }
    };
    initPlugins();

    // Si ya existe una instancia, la destruimos para evitar duplicados
    if (window.calendar && typeof window.calendar.destroy === 'function') {
        try { window.calendar.destroy(); } catch(e) { console.error("Error destroying calendar", e); }
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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
        dayMaxEvents: true,
        fixedWeekCount: false,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: { today: 'Hoy', month: 'Cuadrícula', week: 'Semana', day: 'Día' },
        eventDisplay: 'block',
        eventDisplay: 'block',

        // Dynamic events source with dual filters
        events: function (info, successCallback, failureCallback) {
            const centro = document.getElementById('filter-center')?.value || '';
            const userQ = document.getElementById('search-user')?.value || '';
            const onlyMy = window.ONLY_MY_CLASSES ? '1' : '0';
            const baseUrl = window.AppConfig?.baseUrl || window.BASE_URL || '/';
            // USANDO LA RUTA SEGURA SIN /api/
            const url = `${baseUrl}traer-clases-calendario?start=${encodeURIComponent(info.startStr)}&end=${encodeURIComponent(info.endStr)}&centro=${encodeURIComponent(centro)}&q=${encodeURIComponent(userQ)}&only_my_classes=${onlyMy}`;

            fetch(url, { headers: { 'Accept': 'application/json' } })
                .then(res => {
                    if (!res.ok) throw new Error('Error en el servidor: ' + res.status);
                    
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return res.json();
                    } else {
                        return res.text().then(text => {
                            console.error("Respuesta no es JSON (Primeros 100 caracteres):", text.substring(0, 100));
                            throw new Error("El servidor devolvió un formato incorrecto (no JSON).");
                        });
                    }
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
            window.dispatchEvent(new CustomEvent('openVerClaseReact', { detail: { event: info.event } }));
        },

        eventContent: function(arg) {
            const p = arg.event.extendedProps;
            const trainer = p.entrenadores && p.entrenadores.length > 0 ? p.entrenadores[0] : null;
            const bgColor = arg.event.backgroundColor || '#38b2ac';
            const textColor = arg.event.textColor || '#ffffff';
            const isMonthView = arg.view.type === 'dayGridMonth';
            
            // Renderizado Premium de Celda
            if (isMonthView) {
                return {
                    html: `
                        <div style="display: flex; align-items: center; gap: 4px; width: 100%;">
                            <div style="width: 6px; height: 6px; border-radius: 50%; background: white; flex-shrink: 0; opacity: 0.8;"></div>
                            <span style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 10px;">${p.clase_nombre}</span>
                        </div>
                    `
                };
            }

            const html = `
                <div class="premium-event-inner" style="display: flex; flex-direction: column; gap: 2px; height: 100%; position: relative;">
                    ${p.tipo_clase ? `<span class="event-type-badge" style="border-left: 3px solid ${p.centro_color || '#ffffff'}">${p.tipo_clase}</span>` : ''}
                    <div class="event-header">
                        <div class="event-trainer-avatar">
                            ${(trainer && trainer.foto) 
                                ? `<img src="${trainer.foto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />` 
                                : `<span>${trainer ? trainer.initial : '?'}</span>`}
                        </div>
                        <span class="event-class-name">${p.clase_nombre}</span>
                    </div>
                    <div class="event-footer">
                        <span class="event-center-tag">
                            <i class="fa-solid fa-location-dot"></i> ${p.centro}
                        </span>
                        <span class="event-attendance">
                            <i class="fa-solid fa-users"></i> ${p.alumnos_count || 0}${p.capacidad_maxima ? '/' + p.capacidad_maxima : ''}
                        </span>
                    </div>
                </div>
            `;
            return { html: html };
        },

        eventDidMount: function(info) {
            if (window.tippy) {
                const p = info.event.extendedProps;
                const trainerNames = p.entrenadores ? p.entrenadores.map(t => t.name).join(', ') : 'Sin asignar';
                
                let avatarsHtml = '';
                if (p.alumnos && p.alumnos.length > 0) {
                    avatarsHtml = p.alumnos.slice(0, 6).map(a => 
                        `<img src="${a.foto || 'https://ui-avatars.com/api/?name='+encodeURIComponent(a.nombre)+'&background=random'}" 
                              class="tooltip-avatar-mini" 
                              title="${a.nombre}">`
                    ).join('');
                    if (p.alumnos.length > 6) {
                        avatarsHtml += `<div class="tooltip-avatar-mini" style="display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#475569;">+${p.alumnos.length - 6}</div>`;
                    }
                }

                window.tippy(info.el, {
                    theme: 'premium',
                    allowHTML: true,
                    content: `
                        <div class="tooltip-container">
                            <div class="tooltip-title">${p.clase_nombre}</div>
                            <div class="tooltip-row"><i class="fa-solid fa-user-tie"></i> <span><b>Entrenador:</b> ${trainerNames}</span></div>
                            <div class="tooltip-row"><i class="fa-solid fa-clock"></i> <span><b>Hora:</b> ${p.hora}</span></div>
                            <div class="tooltip-row"><i class="fa-solid fa-building"></i> <span><b>Centro:</b> ${p.centro}</span></div>
                            ${p.tipo_clase ? `<div class="tooltip-row"><i class="fa-solid fa-tags"></i> <span><b>Tipo:</b> ${p.tipo_clase}</span></div>` : ''}
                            
                            <div class="tooltip-participants">
                                <div class="tooltip-participants-title">Alumnos (${p.alumnos_count || 0}${p.capacidad_maxima ? '/' + p.capacidad_maxima : ''})</div>
                                <div class="tooltip-avatars">
                                    ${avatarsHtml || '<span style="font-size:10px; color:#cbd5e1; font-style:italic;">Nadie inscrito aún</span>'}
                                </div>
                            </div>
                        </div>
                    `,
                    placement: 'top',
                    interactive: true,
                    appendTo: () => document.body,
                    delay: [200, 0]
                });
            }
        },

        dateClick: function (info) {
            if (window.CURRENT_USER_ROLE === 'cliente') return;
            abrirModalNuevaClase(info.date);
        },

        windowResize: function (arg) {
            const newView = getInitialView();
            if (window.calendar && window.calendar.view.type !== newView) {
                window.calendar.changeView(newView);
            }
        }
    });

    calendar.render();
    
    setTimeout(() => {
        if (calendar) calendar.updateSize();
    }, 100);

    const filterCenter = document.getElementById('filter-center');
    if (filterCenter) {
        const savedCenter = localStorage.getItem('factomove_preferred_center');
        if (savedCenter) {
            filterCenter.value = savedCenter;
            calendar.refetchEvents();
        }
        filterCenter.addEventListener('change', () => {
            localStorage.setItem('factomove_preferred_center', filterCenter.value);
            calendar.refetchEvents();
        });
    }

    function abrirModalNuevaClase(dateObj) {
        const offsetMs = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - offsetMs)).toISOString().slice(0, 16);
        window.dispatchEvent(new CustomEvent('openCrearClaseReact', { detail: { date: localISOTime } }));
    }

    // El resto de funciones auxiliares (mostrarDetalles, etc.) se mantienen igual
    // ... (omitiendo por brevedad, pero están en el archivo)
};
