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
  const listaSesionesEl = document.getElementById('lista-sesiones');
  const tituloFechaEl = document.getElementById('modal-fecha-titulo');
  const summaryEl = document.getElementById('calendar-summary');

  // ====== DATOS ======
  // Formato recomendado en JS:
  // clases = [{ fecha:"2026-01-05", hora:"10:00", clase:"Pilates", descripcion:"...", coste:25, pago:"TPV" }]
  let clases = Array.isArray(window.SESIONES_CONFIG?.datosSesiones)
    ? window.SESIONES_CONFIG.datosSesiones
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

  // Cerrar modal al click fuera (overlay)
  [modalNueva, modalInfo].forEach((m) => {
    if (!m) return;
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  // ESC para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalNueva);
      closeModal(modalInfo);
    }
  });

  // Botones modal Nueva Clase
  if (btnNueva) btnNueva.addEventListener('click', () => openModal(modalNueva));
  if (btnCerrarNueva) btnCerrarNueva.addEventListener('click', () => closeModal(modalNueva));

  // Botones modal Info
  if (btnCerrarInfo1) btnCerrarInfo1.addEventListener('click', () => closeModal(modalInfo));
  if (btnCerrarInfo2) btnCerrarInfo2.addEventListener('click', () => closeModal(modalInfo));

  const fmtMonthTitle = (year, month) => {
    const d = new Date(year, month, 1);
    return d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  const debounce = (fn, delay = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  // ====== CALENDARIO ARTESANAL ======
  function renderCalendar(year, month) {
    calendarEl.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'cal-header';
    header.innerHTML = `
      <div class="cal-controls"><button type="button" id="prev" aria-label="Mes anterior">◀</button></div>
      <div class="cal-title">${fmtMonthTitle(year, month)}</div>
      <div class="cal-controls"><button type="button" id="next" aria-label="Mes siguiente">▶</button></div>
    `;
    calendarEl.appendChild(header);

    // Weekdays
    const weekdays = document.createElement('div');
    weekdays.className = 'cal-grid cal-weekdays';
    const wd = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    wd.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-weekday';
      el.textContent = d;
      weekdays.appendChild(el);
    });
    calendarEl.appendChild(weekdays);

    // Days grid
    const grid = document.createElement('div');
    grid.className = 'cal-grid cal-days';

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7; // Lunes=0

    for (let i = 0; i < offset; i++) {
      const b = document.createElement('div');
      b.className = 'cal-day blank';
      grid.appendChild(b);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.dataset.date = dateStr;
      cell.textContent = d;

      const items = clases.filter((c) => c.fecha === dateStr);
      if (items.length) cell.classList.add('event');

      cell.addEventListener('click', () => {
        document.querySelectorAll('.cal-day.selected').forEach((x) => x.classList.remove('selected'));
        cell.classList.add('selected');

        // Si hay sesiones ese día, abre modal y muestra detalles (y también summary)
        if (items.length) {
          renderDayDetails(dateStr, items);
          openModal(modalInfo);
        } else {
          // Si no hay, solo actualiza el summary
          if (summaryEl) summaryEl.innerHTML = `<p>No hay sesiones para ${dateStr}.</p>`;
        }
      });

      grid.appendChild(cell);
    }

    calendarEl.appendChild(grid);

    // Controls
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

    if (listaSesionesEl) {
      listaSesionesEl.innerHTML = items.map((i) => {
        const coste = (i.coste ?? i.precio ?? null);
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
        const coste = (i.coste ?? i.precio ?? null);
        const costeTxt = coste != null ? `€${Number(coste).toFixed(2)}` : 'N/D';
        const pago = i.pago || i.estado || 'N/D';
        return `<p><strong>${i.hora || 'N/D'}</strong> — ${i.clase || i.nombre_clase || 'N/D'} <em>(${costeTxt}, ${pago})</em></p>`;
      }).join('');
    }
  }

  // ====== BUSCADOR (si tienes endpoint) ======
  async function fetchAndRender(q) {
    if (!q) {
      clases = [];
      const today = new Date();
      renderCalendar(today.getFullYear(), today.getMonth());
      if (summaryEl) summaryEl.innerHTML = `<p><i class="fa-solid fa-circle-info"></i> Busca un usuario para ver sesiones.</p>`;
      return;
    }

    // Si tienes un endpoint real, úsalo aquí:
    // EJ: /usuarios/reservas?q=...
    try {
      const res = await fetch(`/usuarios/reservas?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      // Esperamos { events: [...] }
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
