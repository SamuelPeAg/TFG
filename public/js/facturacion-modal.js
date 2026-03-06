document.addEventListener('DOMContentLoaded', function(){
    const overlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    function openModal(html){
        modalBody.innerHTML = html;
        overlay.style.display = 'flex';
    }
    function closeModal(){ overlay.style.display = 'none'; }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });

    // Synchronize scrollbar
    const table = document.querySelector('.matrix-table');
    const scrollbarInner = document.getElementById('scrollbar-inner');
    if (table && scrollbarInner) {
        scrollbarInner.style.width = table.scrollWidth + 'px';
        const matrixWrap = document.querySelector('.matrix-wrap');
        const scrollbarTop = document.getElementById('scrollbar-top');
        if (matrixWrap && scrollbarTop) {
            scrollbarTop.addEventListener('scroll', () => {
                matrixWrap.scrollLeft = scrollbarTop.scrollLeft;
            });
            matrixWrap.addEventListener('scroll', () => {
                scrollbarTop.scrollLeft = matrixWrap.scrollLeft;
            });
        }
    }

    document.querySelectorAll('.matrix-table td[data-trainer-id]').forEach(td => {
        td.addEventListener('click', async function(){
            const clientId = this.dataset.clientId;
            const trainerId = this.dataset.trainerId;
            
            // Comprobar si hay clases buscando el texto "0" o si no hay el texto "clases"
            const countText = this.querySelector('.count-value')?.textContent || this.textContent;
            const count = parseInt(countText) || 0;
            
            if (!count) {
                openModal('<p>No hay información disponible para esta selección.</p>');
                return;
            }

            openModal('<p>Cargando detalles de clases...</p>');

            const params = new URLSearchParams();
            if (clientId) params.append('cliente_id', clientId);
            if (trainerId) params.append('entrenador_id', trainerId);

            try {
                const centroSel = document.querySelector('select[name="centro"]');
                if (centroSel && centroSel.value) params.append('centro', centroSel.value);
                
                const anioSel = document.querySelector('select[name="anio"]');
                if (anioSel && anioSel.value) params.append('anio', anioSel.value);
                
                const mesSel = document.querySelector('select[name="mes"]');
                if (mesSel && mesSel.value) params.append('mes', mesSel.value);

                const res = await fetch("/facturas/clases?" + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para esta selección.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr>
                        <td data-label="Cliente" style="padding:8px;">${d.cliente ?? '-'}</td>
                        <td data-label="Entrenador" style="padding:8px;">${d.entrenador ?? '-'}</td>
                        <td data-label="Fecha" style="padding:8px;">${d.fecha ?? '-'}</td>
                        <td data-label="Centro" style="padding:8px;">${d.centro ?? '-'}</td>
                        <td data-label="Coste" style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td>
                        <td data-label="Clase" style="padding:8px;">${d.nombre_clase ?? '-'}</td>
                    </tr>`;
                });
                html += '</tbody></table>';

                openModal(html);
            } catch (e) {
                console.error(e);
                openModal('<p>Error cargando datos.</p>');
            }
        });
    });

    // Event listener for client cells (without trainer-id)
    document.querySelectorAll('.matrix-table td[data-client-id]:not([data-trainer-id])').forEach(td => {
        td.addEventListener('click', async function(){
            const clientId = this.dataset.clientId;
            const params = new URLSearchParams();
            if (clientId) params.append('cliente_id', clientId);

            const centroSel = document.querySelector('select[name="centro"]');
            if (centroSel && centroSel.value !== 'todos') params.append('centro', centroSel.value);
            
            const anioSel = document.querySelector('select[name="anio"]');
            if (anioSel && anioSel.value) params.append('anio', anioSel.value);
            
            const mesSel = document.querySelector('select[name="mes"]');
            if (mesSel && mesSel.value) params.append('mes', mesSel.value);

            openModal('<p>Cargando todas las clases del cliente...</p>');

            try {
                const res = await fetch("/facturas/clases?" + params.toString(), { headers: { 'Accept': 'application/json' }});
                const data = await res.json();

                if (!data || data.length === 0) {
                    openModal('<p>No hay clases para este cliente en el periodo seleccionado.</p>');
                    return;
                }

                let html = '<table style="width:100%; border-collapse:collapse;">';
                html += '<thead><tr><th style="text-align:left; padding:8px;">Cliente</th><th style="text-align:left; padding:8px;">Entrenador</th><th style="padding:8px;">Fecha</th><th style="padding:8px;">Centro</th><th style="padding:8px; text-align:right;">Coste</th><th style="padding:8px;">Clase</th></tr></thead>';
                html += '<tbody>';
                data.forEach(d => {
                    html += `<tr>
                        <td data-label="Cliente" style="padding:8px;">${d.cliente ?? '-'}</td>
                        <td data-label="Entrenador" style="padding:8px;">${d.entrenador ?? '-'}</td>
                        <td data-label="Fecha" style="padding:8px;">${d.fecha ?? '-'}</td>
                        <td data-label="Centro" style="padding:8px;">${d.centro ?? '-'}</td>
                        <td data-label="Coste" style="padding:8px; text-align:right;">${d.importe ? d.importe + ' €' : '-'}</td>
                        <td data-label="Clase" style="padding:8px;">${d.nombre_clase ?? '-'}</td>
                    </tr>`;
                });
                html += '</tbody></table>';

                openModal(html);
            } catch (e) {
                console.error(e);
                openModal('<p>Error cargando datos.</p>');
            }
        });
    });


    // --- AUTOCOMPLETE CLIENTES ---
    function initAutocomplete(clientsData) {
        const searchInput = document.getElementById('clientSearchInput');
        const resultsContainer = document.getElementById('clientSearchResults');
        const hiddenIdInput = document.getElementById('cliente_id');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            resultsContainer.innerHTML = '';
            
            if (query.length < 1) {
                resultsContainer.style.display = 'none';
                hiddenIdInput.value = '';
                return;
            }

            const filtered = clientsData.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.email.toLowerCase().includes(query)
            );

            if (filtered.length > 0) {
                filtered.forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.innerHTML = `<strong>${c.name}</strong><small>${c.email}</small>`;
                    div.addEventListener('click', () => {
                        searchInput.value = c.name;
                        hiddenIdInput.value = c.id;
                        resultsContainer.style.display = 'none';
                    });
                    resultsContainer.appendChild(div);
                });
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.style.display = 'none';
            }
        });

        document.addEventListener('click', function(e) {
            if (!document.getElementById('clientSearchContainer').contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });

        searchInput.addEventListener('focus', function() {
            if (this.value.trim().length > 0) {
                this.dispatchEvent(new Event('input'));
            }
        });
    }

    // Exportar para uso en el blade
    window.initFacturacionAutocomplete = initAutocomplete;
});
