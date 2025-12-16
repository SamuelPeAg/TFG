document.addEventListener('DOMContentLoaded', function() {

    let clases = [];
    const calendarEl = document.getElementById('user-calendar');
    const detailsPanel = document.getElementById('user-details');
    const detailsContent = detailsPanel ? detailsPanel.querySelector('.details-content') : null;
    if (!calendarEl) return;

    // Simple calendar renderer
    function renderCalendar(year, month) {
        calendarEl.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'cal-header';
        header.innerHTML = `
            <div class="cal-controls"><button id="prev">◀</button></div>
            <div class="cal-title">${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</div>
            <div class="cal-controls"><button id="next">▶</button></div>
        `;
        calendarEl.appendChild(header);

        const weekdays = document.createElement('div');
        weekdays.className = 'cal-grid cal-weekdays';
        const wd = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        wd.forEach(d => {
            const el = document.createElement('div'); el.className = 'cal-weekday'; el.textContent = d; weekdays.appendChild(el);
        });
        calendarEl.appendChild(weekdays);

        const grid = document.createElement('div'); grid.className = 'cal-grid cal-days';

        const firstDay = new Date(year, month, 1);
        // week starts Monday -> compute offset
        let offset = (firstDay.getDay() + 6) % 7; // 0=Mon

        // add blanks
        for (let i=0;i<offset;i++){ const b=document.createElement('div'); b.className='cal-day blank'; grid.appendChild(b); }

        const daysInMonth = new Date(year, month+1, 0).getDate();
        for (let d=1; d<=daysInMonth; d++){
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const cell = document.createElement('div'); cell.className='cal-day'; cell.dataset.date = dateStr; cell.textContent = d;
            const has = clases.filter(c=>c.fecha===dateStr);
            if (has.length) cell.classList.add('event');
            cell.addEventListener('click', ()=>{
                document.querySelectorAll('.cal-day.selected').forEach(x=>x.classList.remove('selected'));
                cell.classList.add('selected');
                renderDetails(dateStr);
            });
            grid.appendChild(cell);
        }

        calendarEl.appendChild(grid);

        // controls
        header.querySelector('#prev').addEventListener('click', ()=>{ const m = month-1; if(m<0){ renderCalendar(year-1,11);} else renderCalendar(year,m); });
        header.querySelector('#next').addEventListener('click', ()=>{ const m = month+1; if(m>11){ renderCalendar(year+1,0);} else renderCalendar(year,m); });
    }

    function renderDetails(date){
        const items = clases.filter(c=>c.fecha===date);
        const footerEl = document.getElementById('details-footer');
        const summaryEl = document.getElementById('calendar-summary');
        if(!detailsContent && !summaryEl) return;

        if(!items.length) {
            if(detailsContent) detailsContent.innerHTML=`<p>No hay sesiones para ${date}.</p>`;
            if(footerEl) footerEl.innerHTML = '';
            if(summaryEl) summaryEl.innerHTML = `<p>No hay sesiones para ${date}.</p>`;
            return;
        }

        // Full list in the scrollable content (right panel, may be hidden)
        if(detailsContent){
            detailsContent.innerHTML = items.map(i=>{
                const coste = i.coste!=null?`€${Number(i.coste).toFixed(2)}`:'N/D';
                const pago = i.pago||i.estado||'N/D';
                return `<div class="detail-item"><p><strong>Fecha:</strong> ${i.fecha}</p><p><strong>Hora:</strong> ${i.hora||'N/D'}</p><p><strong>Clase:</strong> ${i.clase||'N/D'}</p><p><strong>Descripción:</strong> ${i.descripcion||'N/D'}</p><p><strong>Coste:</strong> ${coste}</p><p><strong>Pago:</strong> ${pago}</p></div>`;
            }).join('<hr/>');
        }

        // Quick summary under the calendar: list all events briefly
        if(summaryEl){
            summaryEl.innerHTML = items.map(i=>{
                const coste = i.coste!=null?`€${Number(i.coste).toFixed(2)}`:'N/D';
                const pago = i.pago||i.estado||'N/D';
                return `<p><strong>${i.hora||'N/D'}</strong> — ${i.clase||'N/D'} — ${i.descripcion||''} <em>(${coste}, ${pago})</em></p>`;
            }).join('');
        }

        // Footer (right panel) keep first item summary if footer exists
        if(footerEl){
            const i = items[0];
            const coste = i.coste!=null?`€${Number(i.coste).toFixed(2)}`:'N/D';
            const pago = i.pago||i.estado||'N/D';
            footerEl.innerHTML = `
                <p><strong>Hora:</strong> ${i.hora||'N/D'}</p>
                <p><strong>Clase:</strong> ${i.clase||'N/D'}</p>
                <p><strong>Coste:</strong> ${coste} &middot; <strong>Pago:</strong> ${pago}</p>
            `;
        }
    }

    // initial render
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());

    const searchInput = document.getElementById('search-user');
    const debounce = (fn,delay=300)=>{let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),delay);}};

    const fetchAndRender = async (q)=>{
        if(!q){ clases=[]; renderCalendar(today.getFullYear(), today.getMonth()); if(detailsContent) detailsContent.innerHTML='<p>Busca un usuario para ver su historial de clases aquí.</p>'; return; }
        try{
            const res = await fetch(`/usuarios/reservas?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            clases = data.events || [];
            renderCalendar(today.getFullYear(), today.getMonth());
            if(detailsContent) detailsContent.innerHTML='<p>Resultados cargados. Haz clic en un día marcado para ver los detalles aquí.</p>';
        }catch(e){ console.error(e); }
    };

    if(searchInput) searchInput.addEventListener('input', debounce(e=>fetchAndRender(e.target.value.trim()),300));

});


