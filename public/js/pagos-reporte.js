let currentType = 'user';
const errorEl = document.getElementById('search-error');

// Set default dates (Año actual completo para evitar ocultar sesiones futuras)
const today = new Date();
const currentYear = today.getFullYear();

// Desde 1 de Enero
document.getElementById('date-start').value = `${currentYear}-01-01`;
// Hasta 31 de Diciembre
document.getElementById('date-end').value = `${currentYear}-12-31`;

function selectType(type, element) {
    currentType = type;
    document.querySelectorAll('.card-type').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('lbl-search').textContent = type === 'user' ? 'BUSCAR ALUMNO' : 'BUSCAR ENTRENADOR';
    document.getElementById('search-input').value = '';
    document.getElementById('selected-id').value = '';
    document.getElementById('results-area').style.display = 'none';
    
    // Hide error
    errorEl.style.display = 'none';
    document.getElementById('search-input').style.borderColor = '#e5e7eb';
}

// Buscador
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions-box');
const hiddenId = document.getElementById('selected-id');

searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    
    // Reset valid selection
    hiddenId.value = '';
    errorEl.style.display = 'none';
    this.style.borderColor = '#e5e7eb';
    
    suggestionsBox.innerHTML = '';
    
    if(q.length < 1) {
        suggestionsBox.hidden = true;
        return;
    }

    const source = currentType === 'user' ? window.usersData : window.trainersData;
    const matches = source.filter(item => item.name.toLowerCase().includes(q));

    if(matches.length === 0) {
        suggestionsBox.hidden = true;
        return;
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = m.name;
        div.onclick = () => {
            searchInput.value = m.name;
            hiddenId.value = m.id;
            suggestionsBox.hidden = true;
            
            // Clear error state
            errorEl.style.display = 'none';
            searchInput.style.borderColor = '#0e7490';
        };
        suggestionsBox.appendChild(div);
    });
    suggestionsBox.hidden = false;
});

document.addEventListener('click', e => {
    if(!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.hidden = true;
    }
});

// Generar Reporte
document.getElementById('btn-generate').addEventListener('click', async () => {
    const id = hiddenId.value;
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;

    // Validación visual
    if(!id) { 
         errorEl.style.display = 'block';
         searchInput.style.borderColor = '#ef4444';
         return; 
    }
    
    if(!start || !end) { alert('Selecciona las fechas.'); return; }

    const btn = document.getElementById('btn-generate');
    btn.style.opacity = '0.7';
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> CARGANDO...';

    try {
        const res = await fetch(`/Pagos/reporte?type=${currentType}&id=${id}&start=${start}&end=${end}`);
        
        if (!res.ok) {
            const errData = await res.json().catch(() => ({})); 
            throw new Error(errData.message || `Error del servidor (${res.status})`);
        }
        
        const data = await res.json();

        // Render Summary
        document.getElementById('res-name').textContent = data.persona;
        document.getElementById('res-sesiones').textContent = data.resumen.sesiones;
        document.getElementById('res-total').textContent = '€' + data.resumen.total;

        // Render Table
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        
        if(data.detalles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding:30px; text-align:center; color:#9ca3af;">No se encontraron registros en este periodo.</td></tr>';
        } else {
            data.detalles.forEach(d => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${d.fecha}</td>
                    <td style="font-weight:600;">${d.clase}</td>
                    <td><span style="padding:4px 8px; background:#e0f2fe; color:#0369a1; border-radius:4px; font-size:11px; font-weight:700;">${d.centro}</span></td>
                    <td>${d.alumno}</td>
                    <td>${d.metodo}</td>
                    <td style="text-align:right; font-weight:700;">€${Number(d.importe).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        document.getElementById('results-area').style.display = 'block';

    } catch(e) {
        console.error(e);
        alert('Error al generar reporte: ' + e.message);
    } finally {
        btn.style.opacity = '1';
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> GENERAR REPORTE';
    }
});
