document.addEventListener('DOMContentLoaded', () => {
  // ====== ELEMENTOS ======
  const calendarEl = document.getElementById('user-calendar');
  if (!calendarEl) return;

  const searchInput = document.getElementById('search-user');

  // Modales
  const modalNueva = document.getElementById('modalNuevaClase');
  const btnNueva = document.getElementById('btnNuevaClase');
  const btnCerrarNueva = document.getElementById('btnCerrarNuevaClase');

  const modalInfo = document.getElementById('infoPopup');
  const btnCerrarInfo1 = document.getElementById('btnCerrarPopup');
  const btnCerrarInfo2 = document.getElementById('btnCerrarPopup2');
  const listaPagosEl = document.getElementById('lista-Pagos');
  const tituloFechaEl = document.getElementById('modal-fecha-titulo');
  const summaryEl = document.getElementById('calendar-summary');

  // ====== DATOS ======
  let clases = Array.isArray(window.Pagos_CONFIG?.datosPagos)
    ? window.Pagos_CONFIG.datosPagos
    : [];

  // ====== HELPERS ======
  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  const debounce = (fn, delay = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  const fmtMonthTitle = (year, month) => {
    const d = new Date(year, month, 1);
    return d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  const normalize = (s) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // ====== CIERRE DE MODALES ======
  [modalNueva, modalInfo].forEach((m) => {
    if (!m) return;
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalNueva);
      closeModal(modalInfo);
    }
  });

  if (btnNueva) btnNueva.addEventListener('click', () => openModal(modalNueva));
  if (btnCerrarNueva) btnCerrarNueva.addEventListener('click', () => closeModal(modalNueva));

  if (btnCerrarInfo1) btnCerrarInfo1.addEventListener('click', () => closeModal(modalInfo));
  if (btnCerrarInfo2) btnCerrarInfo2.addEventListener('click', () => closeModal(modalInfo));

  // ====== USERS JSON (se reutiliza para ambos autocompletes) ======
  const usersJsonEl = document.getElementById('users_json');
  let USERS = [];
  try {
    USERS = usersJsonEl ? JSON.parse(usersJsonEl.textContent || '[]') : [];
  } catch (e) {
    USERS = [];
  }

  // =========================================================
  // AUTOCOMPLETE REUTILIZABLE
  // =========================================================
  function initAutocomplete({
    inputEl,
    hiddenIdEl,         // opcional (modal)
    boxEl,
    onPick,             // callback cuando eliges uno
    minChars = 1,
    maxResults = 12,
    mode = 'startsWith' // 'startsWith' o 'includes'
  }) {
    if (!inputEl || !boxEl) return;

    const show = (list) => {
      if (!list.length) {
        boxEl.hidden = true;
        boxEl.innerHTML = '';
        return;
      }

      boxEl.innerHTML = list
        .map((u) => `<div class="item" data-id="${u.id}" data-name="${u.name}">${u.name}</div>`)
        .join('');
      boxEl.hidden = false;
    };

    const filter = (qRaw) => {
      const q = normalize(qRaw);

      // Si hay hidden id (modal): al escribir, invalida el id hasta elegir uno
      if (hiddenIdEl) hiddenIdEl.value = '';

      if (!q || q.length < minChars) {
        show([]);
        return;
      }

      const matches = USERS
        .filter((u) => {
          const n = normalize(u.name);
          return mode === 'includes' ? n.includes(q) : n.startsWith(q);
        })
        .slice(0, maxResults);

      show(matches);
    };

    inputEl.addEventListener('input', debounce((e) => {
      filter(e.target.value);
    }, 120));

    inputEl.addEventListener('focus', () => {
      const q = inputEl.value;
      if (q) filter(q);
    });

    // mousedown para que no se cierre por blur antes de seleccionar
    boxEl.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;

      const picked = { id: item.dataset.id, name: item.dataset.name };

      inputEl.value = picked.name;
      if (hiddenIdEl) hiddenIdEl.value = picked.id;

      boxEl.hidden = true;
      boxEl.innerHTML = '';

      if (typeof onPick === 'function') onPick(picked);
    });

    // click fuera -> cerrar
    document.addEventListener('click', (e) => {
      if (boxEl.hidden) return;
      const inside = e.target.closest(`#${boxEl.id}`) || e.target.closest(`#${inputEl.id}`);
      if (!inside) {
        boxEl.hidden = true;
      }
    });

    // helper para reset si quieres
    return {
      reset: () => {
        inputEl.value = '';
        if (hiddenIdEl) hiddenIdEl.value = '';
        boxEl.hidden = true;
        boxEl.innerHTML = '';
      }
    };
  }

  // =========================================================
  // AUTOCOMPLETE MODAL NUEVA CLASE
  // Requisitos HTML (como ya tienes):
  //  - input#user_search
  //  - hidden#user_id
  //  - div#user_suggestions
  // =========================================================
  const userSearchInput = document.getElementById('user_search');
  const userIdHidden = document.getElementById('user_id');
  const suggestionsBox = document.getElementById('user_suggestions');

  const modalAutocomplete = initAutocomplete({
    inputEl: userSearchInput,
    hiddenIdEl: userIdHidden,
    boxEl: suggestionsBox,
    onPick: () => {}, // aquí no hace falta hacer nada extra
    mode: 'startsWith'
  });

  // cuando abres el modal, limpia selección
  if (btnNueva && modalAutocomplete) {
    btnNueva.addEventListener('click', () => {
      modalAutocomplete.reset();
    });
  }

  // =========================================================
  // AUTOCOMPLETE PARA EL BUSCADOR SUPERIOR (#search-user)
  // Requisito HTML:
  //  - div#search_user_suggestions debajo del input
  // =========================================================
  const searchBoxEl = document.getElementById('search_user_suggestions');

  initAutocomplete({
    inputEl: searchInput,
    boxEl: searchBoxEl,
    hiddenIdEl: null,
    mode: 'includes', // mejor para buscar en lista grande
    onPick: (picked) => {
      // al elegir, lanzas tu búsqueda directamente:
      fetchAndRender(picked.name);
    }
  });

  // ====== CALENDARIO ARTESANAL ======
  function renderCalendar(year, month) {
    calendarEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'cal-header';
    header.innerHTML = `
      <div class="cal-controls"><button type="button" id="prev" aria-label="Mes anterior">◀</button></div>
      <div class="cal-title">${fmtMonthTitle(year, month)}</div>
      <div class="cal-controls"><button type="button" id="next" aria-label="Mes siguiente">▶</button></div>
    `;
    calendarEl.appendChild(header);

    const weekdays = document.createElement('div');
    weekdays.className = 'cal-grid cal-weekdays';
    const wd = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    wd.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-weekday';
      el.textContent = d;
      weekdays.appendChild(el);
    });
    calendarEl.appendChild(weekdays);

    const grid = document.createElement('div');
    grid.className = 'cal-grid cal-days';

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < offset; i++) {
      const b = document.createElement('div');
      b.className = 'cal-day blank';
      grid.appendChild(b);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.dataset.date = dateStr;
      cell.textContent = d;

      const items = clases.filter((c) => c.fecha === dateStr);
      if (items.length) cell.classList.add('event');

      cell.addEventListener('click', () => {
        document.querySelectorAll('.cal-day.selected').forEach((x) => x.classList.remove('selected'));
        cell.classList.add('selected');

        if (items.length) {
          renderDayDetails(dateStr, items);
          openModal(modalInfo);
        } else {
          if (summaryEl) summaryEl.innerHTML = `<p>No hay Pagos para ${dateStr}.</p>`;
        }
      });

      grid.appendChild(cell);
    }

    calendarEl.appendChild(grid);

    header.querySelector('#prev').addEventListener('click', () => {
      const m = month - 1;
      if (m < 0) renderCalendar(year - 1, 11);
      else renderCalendar(year, m);
    });

    header.querySelector('#next').addEventListener('click', () => {
      const m = month + 1;
      if (m > 11) renderCalendar(year + 1, 0);
      else renderCalendar(year, m);
    });
  }

  function renderDayDetails(dateStr, items) {
    if (tituloFechaEl) tituloFechaEl.textContent = `Detalles del Día: ${dateStr}`;

    if (listaPagosEl) {
      listaPagosEl.innerHTML = items.map((i) => {
        const coste = i.coste ?? i.precio ?? null;
        const costeTxt = coste != null ? `€${Number(coste).toFixed(2)}` : 'N/D';
        const pago = i.pago || i.estado || 'N/D';

        return `
          <div class="sesion-card">
            <div class="detail-item"><strong>Hora:</strong> <span>${i.hora || 'N/D'}</span></div>
            <div class="detail-item"><strong>Clase:</strong> <span>${i.clase || i.nombre_clase || 'N/D'}</span></div>
            <div class="detail-item"><strong>Descripción:</strong> <span>${i.descripcion || ''}</span></div>
            <div class="detail-item"><strong>Coste:</strong> <span>${costeTxt}</span></div>
            <div class="detail-item"><strong>Pago:</strong> <span>${pago}</span></div>
          </div>
        `;
      }).join('');
    }

    if (summaryEl) {
      summaryEl.innerHTML = items.map((i) => {
        const coste = i.coste ?? i.precio ?? null;
        const costeTxt = coste != null ? `€${Number(coste).toFixed(2)}` : 'N/D';
        const pago = i.pago || i.estado || 'N/D';
        return `<p><strong>${i.hora || 'N/D'}</strong> — ${i.clase || i.nombre_clase || 'N/D'} <em>(${costeTxt}, ${pago})</em></p>`;
      }).join('');
    }
  }

  // ====== BUSCADOR (Pagos) ======
  async function fetchAndRender(q) {
    if (!q) {
      clases = [];
      const today = new Date();
      renderCalendar(today.getFullYear(), today.getMonth());
      if (summaryEl) {
        summaryEl.innerHTML = `<p><i class="fa-solid fa-circle-info"></i> Busca un usuario para ver Pagos.</p>`;
      }
      return;
    }

    try {
      const res = await fetch(`/usuarios/reservas?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      clases = Array.isArray(data.events) ? data.events : [];
      const today = new Date();
      renderCalendar(today.getFullYear(), today.getMonth());

      if (summaryEl) summaryEl.innerHTML = `<p>Resultados cargados. Haz clic en un día marcado.</p>`;
    } catch (e) {
      console.error(e);
      if (summaryEl) summaryEl.innerHTML = `<p>No se pudo cargar el historial (error de red o JSON).</p>`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      fetchAndRender(e.target.value.trim());
    }, 300));
  }

  // ====== INIT ======
  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth());
});
