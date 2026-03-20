document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStep = 1;
    let selectedClients = [];

    // Elements
    const form = document.getElementById('formNuevaClaseWizard');
    if (!form) return; 

    const steps = [1, 2, 3].map(n => document.getElementById(`step-${n}`));
    const btnNext = document.getElementById('btn-next-step');
    const btnPrev = document.getElementById('btn-prev-step');
    const btnSubmit = document.getElementById('btn-submit-wizard');
    const dots = document.querySelectorAll('.nav-step');
    const clientListEl = document.getElementById('selected-clients-list');
    const paymentContainer = document.getElementById('payment-rows-container');
    const priceBaseInput = document.getElementById('precio_base');
    const tipoSelect = document.getElementById('tipo_clase');

    // === Select2 Init ===
    window.initWizardSelects = () => {
        if (typeof $ !== 'undefined' && $.fn.select2) {
            $('.select2-basic').select2({
                placeholder: "Selecciona una opción",
                allowClear: true,
                dropdownParent: $('#modalNuevaClase')
            });
        }
    };

    // Init on load
    initWizardSelects();

    // === Recurrence Toggle ===
    const chkRecurring = document.getElementById('is_recurring');
    const divRecurrence = document.getElementById('recurrence_options');
    if (chkRecurring && divRecurrence) {
        chkRecurring.addEventListener('change', () => {
            divRecurrence.style.display = chkRecurring.checked ? 'block' : 'none';
        });
    }

    // Exposed Listeners
    window.handleTipoChange = () => {
        const tipo = tipoSelect.value;
        const max = getMaxClients(tipo);
        if (selectedClients.length > max) {
            alert(`El tipo de clase ${tipo} solo admite ${max} alumnos. Se eliminarán los sobrantes.`);
            selectedClients = selectedClients.slice(0, max);
            renderSelectedClients();
        }
    };

    // Listeners
    if (btnNext) btnNext.addEventListener('click', () => changeStep(1));
    if (btnPrev) btnPrev.addEventListener('click', () => changeStep(-1));
    if (btnSubmit) btnSubmit.addEventListener('click', submitWizard);

    const searchInput = document.getElementById('client-search-input');
    const suggestionsBox = document.getElementById('client-suggestions');
    const countEl = document.getElementById('clients-count');

    let allUsers = [];
    try {
        const jsonEl = document.getElementById('users_json');
        if (jsonEl) allUsers = JSON.parse(jsonEl.textContent);
    } catch (e) { console.error("Error parsing users", e); }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            if (q.length < 1) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const alreadyIds = new Set(selectedClients.map(u => u.id));
            const filtered = allUsers.filter(u =>
                u.name.toLowerCase().includes(q) && !alreadyIds.has(u.id)
            ).slice(0, 10);

            if (filtered.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }

            suggestionsBox.innerHTML = filtered.map(u => `
                <div class="suggestion-item-clean" data-id="${u.id}" data-name="${u.name}" style="padding:10px 14px; cursor:pointer; border-bottom:1px solid #f1f5f9; font-size:13px; color:#334155; display:flex; align-items:center; gap:10px;">
                     <div style="width:24px; height:24px; background:#e2e8f0; border-radius:50%; color:#64748b; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;">${u.name.charAt(0)}</div>
                     ${u.name}
                </div>
            `).join('');

            suggestionsBox.style.display = 'block';

            suggestionsBox.querySelectorAll('.suggestion-item-clean').forEach(item => {
                item.addEventListener('click', () => {
                    addUser(parseInt(item.dataset.id), item.dataset.name);
                    searchInput.value = '';
                    suggestionsBox.style.display = 'none';
                    searchInput.focus();
                });
            });
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }

    function addUser(id, name) {
        const tipo = tipoSelect.value;
        const max = getMaxClients(tipo);

        if (selectedClients.length >= max) {
            if (max === 1) {
                selectedClients = [{ id, name, is_standing: false }]; 
            } else {
                alert(`El límite para ${tipo} es de ${max} alumnos.`);
                return;
            }
        } else {
            selectedClients.push({ id, name, is_standing: false });
        }

        renderSelectedClients();
    }

    window.toggleStanding = (id) => {
        const client = selectedClients.find(u => u.id === id);
        if (client) {
            client.is_standing = !client.is_standing;
            renderSelectedClients();
        }
    };

    window.removeClient = (id) => {
        selectedClients = selectedClients.filter(u => u.id !== id);
        renderSelectedClients();
    };

    updateUI();

    function changeStep(dir) {
        console.log("Changing step from", currentStep, "direction", dir);
        if (dir === 1 && !validateStep(currentStep)) {
            console.warn("Validation failed for step", currentStep);
            return;
        }
        currentStep += dir;
        if (currentStep > 3) currentStep = 3;
        if (currentStep < 1) currentStep = 1;
        if (currentStep === 3) renderPaymentRows();
        updateUI();
    }

    function updateUI() {
        steps.forEach((el, idx) => {
            if (el) el.style.display = (idx + 1) === currentStep ? 'block' : 'none';
        });
        if (btnPrev) btnPrev.style.display = currentStep === 1 ? 'none' : 'block';
        if (btnNext) btnNext.style.display = currentStep === 3 ? 'none' : 'block';
        if (btnSubmit) btnSubmit.style.display = currentStep === 3 ? 'block' : 'none';
        dots.forEach(d => {
            const step = parseInt(d.dataset.step);
            d.classList.toggle('active', step === currentStep);
            d.classList.toggle('completed', step < currentStep);
        });
    }

    function validateStep(step) {
        const currentInputs = steps[step - 1].querySelectorAll('input, select');
        let valid = true;
        currentInputs.forEach(input => {
            if (!input.reportValidity()) valid = false;
        });
        if (!valid) return false;
        
        if (step === 1) {
            // Validación manual para centros con Select2
            const centersValues = $('#centros').val();
            if (!centersValues || centersValues.length === 0) {
                alert("Por favor selecciona al menos un centro deportivo.");
                return false;
            }
        }

        if (step === 2) {
            const tipo = tipoSelect.value;
            // Solo es obligatorio para EP (Personal)
            if (tipo === 'ep' && selectedClients.length === 0) { 
                alert("Para sesiones EP es obligatorio seleccionar un alumno."); 
                return false; 
            }
            if (!priceBaseInput.value || parseFloat(priceBaseInput.value) < 0) { 
                alert("Por favor ingresa un precio base válido."); 
                return false; 
            }
        }
        return true;
    }

    function renderSelectedClients() {
        if (countEl) countEl.textContent = selectedClients.length > 0 ? `(${selectedClients.length})` : '';
        if (selectedClients.length === 0) {
            clientListEl.innerHTML = `<div class="empty-state-clean" style="grid-column: 1/-1;"><i class="fa-solid fa-users-slash"></i><p>Busca y selecciona alumnos</p></div>`;
            return;
        }
        clientListEl.innerHTML = selectedClients.map(u => `
            <div class="client-chip ${u.is_standing ? 'standing-active' : ''}" style="background:#f8fafc; border:1px solid #e2e8f0; padding:6px 12px; display:flex; align-items:center; gap:8px; border-radius:30px; transition: all 0.2s;">
                <div class="avatar-circle-sm" style="width:28px; height:28px; font-size:12px; background:linear-gradient(135deg, #39c5a7, #eb567a); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">${u.name.charAt(0)}</div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size:13px; font-weight:600; color:#334155;">${u.name}</span>
                    ${u.is_standing ? '<span style="font-size:9px; color:#0d9488; font-weight:700;">RESERVA FIJA</span>' : ''}
                </div>
                <div style="margin-left:5px; display:flex; gap:10px;">
                    <button type="button" onclick="window.toggleStanding(${u.id})" title="Convertir en alumno fijo" style="border:none; background:none; cursor:pointer; color:${u.is_standing ? '#39c5a7' : '#94a3b8'};"><i class="fa-solid fa-anchor"></i></button>
                    <button type="button" onclick="window.removeClient(${u.id})" style="border:none; background:none; cursor:pointer; color:#94a3b8;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `).join('');
    }

    function renderPaymentRows() {
        const basePrice = priceBaseInput.value || 0;
        paymentContainer.innerHTML = selectedClients.map((u, idx) => `
            <div class="payment-row">
                <div class="client-name" style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar-circle-sm" style="width:32px; height:32px; background:linear-gradient(135deg, #39c5a7, #eb567a); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">${u.name.charAt(0)}</div>
                    <div><div style="font-weight:700; font-size:14px; color:#1e293b;">${u.name}</div></div>
                </div>
                <div><input type="number" step="0.01" name="participants[${idx}][precio]" class="input-clean" value="${basePrice}" required></div>
                <div>
                     <select name="participants[${idx}][metodo_pago]" class="input-clean" required>
                        <option value="CREDITO">Crédito (Suscripción)</option>
                        <option value="TPV">TPV</option>
                        <option value="EF">Efectivo</option>
                        <option value="DD">Domiciliación</option>
                        <option value="CC">Cuenta</option>
                     </select>
                </div>
            </div>
        `).join('');
    }

    function getMaxClients(tipo) {
        if (tipo === 'ep') return 1;
        if (tipo === 'duo') return 2;
        if (tipo === 'trio') return 3;
        if (tipo === 'Grupo' || tipo === 'Grupo especial') return 10; // Límite para grupos
        return 100;
    }

    async function submitWizard() {
        console.log("Submitting wizard...");
        if (!validateStep(3)) {
            console.warn("Validation failed for step 3");
            return;
        }
        const formData = new FormData(form);
        const payload = {
            centros: $('#centros').val() || [],
            nombre_clase: formData.get('nombre_clase'),
            tipo_clase: formData.get('tipo_clase'),
            fecha_hora: formData.get('fecha_hora'),
            trainers: formData.getAll('trainers[]'),
            is_recurring: !!formData.get('is_recurring'),
            recurrence_end: formData.get('is_recurring') ? formData.get('recurrence_end') : null,
            participants: []
        };
        console.log("Payload draft:", payload);
        selectedClients.forEach((u, idx) => {
            const precio = document.querySelector(`input[name="participants[${idx}][precio]"]`)?.value;
            const metodo = document.querySelector(`select[name="participants[${idx}][metodo_pago]"]`)?.value;
            payload.participants.push({ 
                user_id: u.id, 
                precio: parseFloat(precio || 0), 
                metodo_pago: metodo,
                is_standing: u.is_standing
            });
        });

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btnSubmit.disabled = true;

            const url = `${window.BASE_URL || ''}/Pagos`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });

            console.log("Server response status:", res.status);
            const data = await res.json();
            console.log("Server data:", data);

            if (res.ok) {
                if (data.success) {
                    if (window.calendar) window.calendar.refetchEvents();
                    const modalNuevaClase = document.getElementById('modalNuevaClase');
                    if (window.closeModal && modalNuevaClase) {
                        window.closeModal(modalNuevaClase);
                    } else {
                        // Fallback if closeModal is not defined or modal element not found
                        if (modalNuevaClase) modalNuevaClase.classList.remove('active');
                        else window.location.reload();
                    }
                    form.reset(); currentStep = 1; selectedClients = []; updateUI();
                } else { 
                    console.error("Server Response (success: false):", res.status, data);
                    if (data.errors) {
                        const firstErr = Object.values(data.errors)[0][0];
                        alert("Error de validación: " + firstErr);
                    } else {
                        alert(data.message || data.error || "Error al guardar (Status: " + res.status + ")"); 
                    }
                }
            } else { 
                console.error("Server Response (not ok):", res.status, data);
                if (data.errors) {
                    const firstErr = Object.values(data.errors)[0][0];
                    alert("Error de validación: " + firstErr);
                } else {
                    alert(data.message || data.error || "Error al guardar (Status: " + res.status + ")"); 
                }
            }
        } catch (e) { 
            console.error("Submission error:", e);
            alert("Error de conexión o error interno del servidor."); 
        }
        btnSubmit.innerHTML = 'CONFIRMAR Y GUARDAR';
        btnSubmit.disabled = false;
    }
});
