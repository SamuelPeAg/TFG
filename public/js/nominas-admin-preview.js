function abrirModalRevision(btn) {
    const id = btn.dataset.id;
    const userid = btn.dataset.userid; 
    const name = btn.dataset.name;
    const archivo = btn.dataset.archivo;
    const mes = btn.dataset.mes || new Date().getMonth() + 1;
    const anio = btn.dataset.anio || new Date().getFullYear();

    const modal = document.getElementById('modalRevision');
    modal.dataset.mes = mes;
    modal.dataset.anio = anio;
    
    let detalles = null;
    try { detalles = JSON.parse(btn.dataset.detalles || 'null'); } catch(e) { console.error(e); }

    document.getElementById('modalEntrenadorNombre').textContent = name;
    document.getElementById('modalEntrenadorId').value = userid;
    document.getElementById('contenedorExtras').innerHTML = '';
    
    if (detalles) {
        document.getElementById('modalHoras').value = detalles.horas_trabajadas || 0;
        document.getElementById('editBruto').value = detalles.salario_bruto || 0;
        document.getElementById('editIRPF').value = (detalles.porcentajes ? detalles.porcentajes.irpf : 0);
        
        if (detalles.extras && detalles.extras.length > 0) {
            detalles.extras.forEach(extra => {
                agregarFilaExtra(extra.concepto, extra.importe);
            });
        }
    } else {
        document.getElementById('modalHoras').value = 0;
        document.getElementById('editBruto').value = 0;
        document.getElementById('editIRPF').value = 0;
    }

    const url = "{{ route('admin.nominas.update', ':id') }}";
    document.getElementById('formRevision').action = url.replace(':id', id);

    const linkDiv = document.getElementById('linkArchivoActual');
    if (archivo) {
        linkDiv.querySelector('a').href = archivo;
        linkDiv.classList.remove('hidden');
    } else {
        linkDiv.classList.add('hidden');
    }

    recalcularTodo();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function agregarFilaExtra(concepto = '', importe = 0) {
    const container = document.getElementById('contenedorExtras');
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 extra-row';
    div.innerHTML = `
        <input type="text" name="extra_conceptos[]" value="${concepto}" placeholder="Concepto (Plus, Bono...)" 
               class="flex-1 p-2 rounded-lg border border-slate-200 text-sm font-medium focus:border-brand-teal focus:outline-none">
        <input type="number" step="0.01" name="extra_importes[]" value="${importe}" 
               class="w-24 p-2 rounded-lg border border-slate-200 text-sm font-bold text-right focus:border-brand-teal focus:outline-none input-extra-importe">
        <button type="button" onclick="this.parentElement.remove(); recalcularTodo();" class="text-red-400 hover:text-red-600 p-2">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
    
    div.querySelector('.input-extra-importe').addEventListener('input', recalcularTodo);
    div.querySelector('input[type="text"]').addEventListener('input', recalcularTodo);
}

function recalcularTodo(event) {
    if (event && event.target.id === 'modalHoras') {
        const horas = parseFloat(document.getElementById('modalHoras').value) || 0;
        let bruto = 0;
        let rem = horas;
        let h1 = Math.min(rem, 25); bruto += h1 * 7.6; rem -= h1;
        if (rem > 0) { let h2 = Math.min(rem, 5); bruto += h2 * 10.9; rem -= h2; }
        if (rem > 0) { bruto += rem * 13.3; }
        document.getElementById('editBruto').value = bruto.toFixed(2);
    }

    const bruto = parseFloat(document.getElementById('editBruto').value) || 0;
    const irpf_p = (parseFloat(document.getElementById('editIRPF').value) || 0) / 100;
    const ss_trab_p = 0.0635;
    const ss_emp_p = 0.3140;

    const ss_trabajador = bruto * ss_trab_p;
    const irpf_importe = bruto * irpf_p;
    
    let totalExtras = 0;
    document.querySelectorAll('.input-extra-importe').forEach(inp => {
        totalExtras += parseFloat(inp.value) || 0;
    });

    const neto = bruto - ss_trabajador - irpf_importe + totalExtras;
    const ss_emp_importe = bruto * ss_emp_p;
    const coste_total = bruto + ss_emp_importe + totalExtras;

    document.getElementById('labelSSTrab').textContent = '-' + ss_trabajador.toFixed(2) + ' €';
    document.getElementById('labelSSEmp').textContent = '+' + ss_emp_importe.toFixed(2) + ' €';
    document.getElementById('labelCosteTotal').textContent = coste_total.toFixed(2) + ' €';
    document.getElementById('modalImporte').value = neto.toFixed(2);

    document.getElementById('input_salario_bruto').value = bruto.toFixed(2);
    document.getElementById('input_ss_trabajador').value = ss_trabajador.toFixed(2);
    document.getElementById('input_irpf').value = irpf_importe.toFixed(2);
    document.getElementById('input_ss_empresa').value = ss_emp_importe.toFixed(2);
    document.getElementById('input_coste_total').value = coste_total.toFixed(2);
}

document.getElementById('modalHoras')?.addEventListener('input', recalcularTodo);
document.getElementById('editBruto')?.addEventListener('input', recalcularTodo);
document.getElementById('editIRPF')?.addEventListener('input', recalcularTodo);

function cerrarModalRevision() {
    document.getElementById('modalRevision').classList.add('hidden');
    document.getElementById('modalRevision').classList.remove('flex');
}

document.getElementById('modalRevision')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarModalRevision();
});
