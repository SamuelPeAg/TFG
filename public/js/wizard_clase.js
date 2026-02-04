document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStep = 1;
    let selectedClients = [];

    // Elements
    const form = document.getElementById('formNuevaClaseWizard');
    if (!form) return; // Exit if not found (e.g. wrong page)

    const steps = [1, 2, 3].map(n => document.getElementById(`step-${n}`));
    const btnNext = document.getElementById('btn-next-step');
    const btnPrev = document.getElementById('btn-prev-step');
    const btnSubmit = document.getElementById('btn-submit-wizard');
    const dots = document.querySelectorAll('.nav-step');
    const clientListEl = document.getElementById('selected-clients-list');
    const paymentContainer = document.getElementById('payment-rows-container');
    const priceBaseInput = document.getElementById('precio_base');
    const tipoSelect = document.getElementById('tipo_clase');

    // Exposed Listeners
    window.handleTipoChange = () => {
        // Validation or logic when type changes (optional)
        // e.g., reset clients if limit changes?
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

    // Client Manager Logic (Inline)
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

            // Add click listeners
            suggestionsBox.querySelectorAll('.suggestion-item-clean').forEach(item => {
                item.addEventListener('click', () => {
                    addUser(parseInt(item.dataset.id), item.dataset.name);
                    searchInput.value = '';
                    suggestionsBox.style.display = 'none';
                    searchInput.focus();
                });
            });
        });

        // Hide on outside click
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
            // Option: If max is 1, replace. If max > 1, warn.
            if (max === 1) {
                selectedClients = [{ id, name }]; // Replace
            } else {
                alert(`El límite para ${tipo} es de ${max} alumnos.`);
                return;
            }
        } else {
            selectedClients.push({ id, name });
        }

        renderSelectedClients();
    }

    // Exposed for the remove button in chip
    window.removeClient = (id) => {
        selectedClients = selectedClients.filter(u => u.id !== id);
        renderSelectedClients();
    };

    // Initialize
    updateUI();

    function changeStep(dir) {
        if (dir === 1 && !validateStep(currentStep)) return;

        currentStep += dir;
        if (currentStep > 3) currentStep = 3;
        if (currentStep < 1) currentStep = 1;

        if (currentStep === 3) {
            renderPaymentRows();
        }

        updateUI();
    }

    function updateUI() {
        // Steps visibility
        steps.forEach((el, idx) => {
            if (el) el.style.display = (idx + 1) === currentStep ? 'block' : 'none';
        });

        // Buttons
        if (btnPrev) btnPrev.style.display = currentStep === 1 ? 'none' : 'block';
        if (btnNext) btnNext.style.display = currentStep === 3 ? 'none' : 'block';
        if (btnSubmit) btnSubmit.style.display = currentStep === 3 ? 'block' : 'none';

        // Dots
        dots.forEach(d => {
            const step = parseInt(d.dataset.step);
            d.classList.toggle('active', step === currentStep);
            d.classList.toggle('completed', step < currentStep);
        });
    }

    function validateStep(step) {
        // Manual validation since steps hide inputs, 'required' might behave oddly if hidden
        // We force validation on visible inputs of the current step
        const currentInputs = steps[step - 1].querySelectorAll('input, select');
        let valid = true;
        currentInputs.forEach(input => {
            if (!input.reportValidity()) {
                valid = false;
            }
        });
        if (!valid) return false;

        // Specific Logic
        if (step === 2) {
            if (selectedClients.length === 0) {
                alert("Por favor selecciona al menos un alumno.");
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
            clientListEl.innerHTML = `
                <div class="empty-state-clean" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-users-slash"></i>
                    <p>Busca y selecciona alumnos</p>
                </div>`;
            return;
        }

        clientListEl.innerHTML = selectedClients.map(u => `
            <div class="client-chip" style="background:#f8fafc; border:1px solid #e2e8f0; padding:6px 10px 6px 6px; display:flex; align-items:center; gap:8px; border-radius:30px; padding-right:12px;">
                <div class="avatar-circle-sm" style="width:28px; height:28px; font-size:12px; background:linear-gradient(135deg, #39c5a7, #eb567a); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">${u.name.charAt(0)}</div>
                <span style="font-size:13px; font-weight:600; color:#334155; margin-right:4px;">${u.name}</span>
                <button type="button" onclick="window.removeClient(${u.id})" style="border:none; background:none; cursor:pointer; color:#94a3b8; font-size:14px; display:flex; align-items:center;"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `).join('');
    }

    function renderPaymentRows() {
        const basePrice = priceBaseInput.value || 0;
        paymentContainer.innerHTML = selectedClients.map((u, idx) => `
            <div class="payment-row">
                <div class="client-name" style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar-circle-sm" style="width:32px; height:32px; background:linear-gradient(135deg, #39c5a7, #eb567a); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">${u.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight:700; font-size:14px; color:#1e293b;">${u.name}</div>
                        <input type="hidden" name="participants[${idx}][user_id]" value="${u.id}">
                    </div>
                </div>
                <div>
                     <input type="number" step="0.01" name="participants[${idx}][precio]" class="input-clean" value="${basePrice}" placeholder="0.00" required>
                </div>
                <div>
                     <select name="participants[${idx}][metodo_pago]" class="input-clean" required>
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
        if (tipo === 'EP') return 1;
        if (tipo === 'DUO') return 2;
        if (tipo === 'TRIO') return 3;
        if (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') return 6;
        return 100;
    }

    async function submitWizard() {
        if (!validateStep(3)) return;

        const formData = new FormData(form);
        const payload = {
            centro: formData.get('centro'),
            nombre_clase: formData.get('nombre_clase'),
            tipo_clase: formData.get('tipo_clase'),
            fecha_hora: formData.get('fecha_hora'),
            trainers: formData.getAll('trainers[]'),
            participants: [] // Build manually
        };

        // Build participants array
        // We know the index structure from payment rows
        selectedClients.forEach((u, idx) => {
            const precio = document.querySelector(`input[name="participants[${idx}][precio]"]`)?.value;
            const metodo = document.querySelector(`select[name="participants[${idx}][metodo_pago]"]`)?.value;

            payload.participants.push({
                user_id: u.id,
                precio: parseFloat(precio || 0),
                metodo_pago: metodo
            });
        });

        // Debug
        console.log("Submitting Payload", payload);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Show loading state
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btnSubmit.disabled = true;

            const res = await fetch('/Pagos', {
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

            if (res.ok && data.success) {
                // Close
                document.getElementById('modalNuevaClase').classList.remove('active');

                // Refresh Calendar
                if (window.calendar) {
                    window.calendar.refetchEvents();
                    // Show success message if possible
                    const summaryEl = document.getElementById('calendar-summary');
                    if (summaryEl) summaryEl.innerHTML = `<p style="color:#10b981; font-weight:bold;">¡Clase agendada correctamente!</p>`;
                } else {
                    window.location.reload();
                }

                // Reset
                form.reset();
                currentStep = 1;
                selectedClients = [];
                updateUI();
                btnSubmit.innerHTML = 'FINALIZAR Y GUARDAR';
                btnSubmit.disabled = false;

            } else {
                btnSubmit.innerHTML = 'FINALIZAR Y GUARDAR';
                btnSubmit.disabled = false;

                let msg = data.message || "Error al guardar la clase";
                if (data.errors) {
                    msg += "\n" + Object.values(data.errors).flat().join("\n");
                }
                alert(msg);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
            btnSubmit.innerHTML = 'FINALIZAR Y GUARDAR';
            btnSubmit.disabled = false;
        }
    }
});
