function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('.search-item');

    rows.forEach(row => {
        const conceptCell = row.querySelector('.concept-cell');
        const concept = conceptCell.textContent.toLowerCase();
        if (concept.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function abrirModalDetalle(data) {
    document.getElementById('modalConcepto').textContent = data.concepto;
    document.getElementById('modalPeriodo').textContent = data.mes + '/' + data.anio;
    
    const container = document.getElementById('modalDetalleDesglose');
    if (data.detalles && data.detalles.salario_bruto) {
        const det = data.detalles;
        document.getElementById('detBruto').textContent = parseFloat(det.salario_bruto).toFixed(2) + ' €';
        const deducciones = (parseFloat(det.ss_trabajador) + parseFloat(det.irpf)).toFixed(2);
        document.getElementById('detDeducciones').textContent = '-' + deducciones + ' €';
        document.getElementById('detNeto').textContent = parseFloat(det.salario_neto).toFixed(2) + ' €';
        
        const extrasCont = document.getElementById('detExtrasContainer');
        const extrasList = document.getElementById('detExtrasList');
        extrasList.innerHTML = '';
        if (det.extras && det.extras.length > 0) {
            det.extras.forEach(ex => {
                const row = document.createElement('div');
                row.className = 'flex justify-between text-xs text-slate-600 italic';
                row.innerHTML = `<span>+ ${ex.concepto}</span><span class="font-bold">${parseFloat(ex.importe).toFixed(2)} €</span>`;
                extrasList.appendChild(row);
            });
            extrasCont.classList.remove('hidden');
        } else {
            extrasCont.classList.add('hidden');
        }

        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }

    const badge = document.getElementById('modalDetalleEstadoBadge');
    if (data.estado === 'pagado') {
        badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100';
        badge.innerHTML = '<i class="fas fa-check"></i> Pagado';
    } else {
        badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100';
        badge.innerHTML = '<i class="fas fa-hourglass-half"></i> Pendiente';
    }

    const btnPDF = document.getElementById('btnDescargarPDFEntrenador');
    const msgPDF = document.getElementById('noPDFMessageEntrenador');

    if (data.archivo_url) {
        btnPDF.href = data.archivo_url;
        btnPDF.classList.remove('hidden');
        btnPDF.classList.add('flex');
        msgPDF.classList.add('hidden');
    } else {
        btnPDF.classList.add('hidden');
        btnPDF.classList.remove('flex');
        msgPDF.classList.remove('hidden');
    }

    document.getElementById('modalDetalleEntrenador').classList.remove('hidden');
    document.getElementById('modalDetalleEntrenador').classList.add('flex');
}

function cerrarModalDetalle() {
    document.getElementById('modalDetalleEntrenador').classList.add('hidden');
    document.getElementById('modalDetalleEntrenador').classList.remove('flex');
}

document.getElementById('modalDetalleEntrenador')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarModalDetalle();
});
