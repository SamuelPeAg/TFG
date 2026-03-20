document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 3;

    const modal = document.getElementById('modalNuevaClase');
    const form = document.getElementById('formNuevaClaseWizard');
    if (!form) return;

    const btnNext = document.getElementById('btn-next-step');
    const btnPrev = document.getElementById('btn-prev-step');
    const btnSubmit = document.getElementById('btn-submit-wizard');
    const navSteps = document.querySelectorAll('.nav-step');
    const wizardTitle = document.getElementById('wizard-title');
    const wizardSubtitle = document.getElementById('wizard-subtitle');

    window.initWizardSelects = function() {
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.select2) {
                $('.select2-basic').each(function() {
                    // Solo inicializar si no se ha hecho ya
                    if (!$(this).hasClass('select2-hidden-accessible')) {
                        $(this).select2({
                            placeholder: "Selecciona una opción",
                            allowClear: true,
                            dropdownParent: $('#modalNuevaClase')
                        });
                    }
                });
            }
        }, 100);
    };

    const stepTitles = {
        1: { title: "Configuración Inicial", sub: "Define centros, nombre y tipo de sesión." },
        2: { title: "Planificación Horaria", sub: "Establece la fecha, precio y participantes." },
        3: { title: "Control de Acceso (Opcional)", sub: "Filtra qué suscripciones pueden unirse." }
    };

    function updateUI() {
        document.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
        const stepEl = document.getElementById(`step-${currentStep}`);
        if(stepEl) stepEl.style.display = 'block';

        // Re-init Select2 if we are in step 1 and it's visible
        if (currentStep === 1) {
            initWizardSelects();
        }

        navSteps.forEach(ns => {
            const s = parseInt(ns.dataset.step);
            ns.classList.toggle('active', s === currentStep);
            ns.classList.toggle('completed', s < currentStep);
        });

        if (btnPrev) btnPrev.style.display = currentStep > 1 ? 'flex' : 'none';
        if (btnNext) btnNext.style.display = currentStep < totalSteps ? 'flex' : 'none';
        if (btnSubmit) btnSubmit.style.display = currentStep === totalSteps ? 'flex' : 'none';

        if (stepTitles[currentStep]) {
            wizardTitle.textContent = stepTitles[currentStep].title;
            wizardSubtitle.textContent = stepTitles[currentStep].sub;
        }
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (validateStep(currentStep)) { 
                currentStep++; 
                updateUI(); 
            }
        });
    }
    if (btnPrev) {
        btnPrev.addEventListener('click', () => { currentStep--; updateUI(); });
    }

    function validateStep(step) {
        const container = document.getElementById(`step-${step}`);
        if(!container) return true;
        
        // Basic requirement check
        const fields = container.querySelectorAll('[required]');
        let valid = true;
        fields.forEach(f => {
            if (!f.value || (f.tagName === 'SELECT' && f.selectedOptions.length === 0)) {
                f.style.borderColor = '#ef4444';
                valid = false;
            } else {
                f.style.borderColor = '';
            }
        });
        
        if (!valid) return false;

        if (step === 1) {
             const centersValues = $('#centros').val();
             if (!centersValues || centersValues.length === 0) {
                 alert("Por favor selecciona al menos un centro deportivo.");
                 return false;
             }
        }
        return true;
    }

    // --- MANEJO DE CAPACIDAD ---
    const tipoClaseSelect = document.getElementById('tipo_clase');
    const capacidadContainer = document.getElementById('capacidad-container');
    if (tipoClaseSelect && capacidadContainer) {
        tipoClaseSelect.addEventListener('change', function() {
            const val = this.value.toLowerCase();
            // Mostrar capacidad si es Grupo, Grupo especial o Privado
            const show = val.includes('grupo') || val.includes('especial') || val === 'privado';
            capacidadContainer.style.display = show ? 'block' : 'none';
        });
    }

    // --- MANEJO DE SUBSCRIPCIONES (Visual Toggles) ---
    function initSusCards() {
        document.querySelectorAll('.subscription-access-card').forEach(cardLabel => {
            // Remove any old clones or double listeners if necessary, but here we just ensure clean logic
            const checkbox = cardLabel.querySelector('.sus-checkbox');
            const cardContent = cardLabel.querySelector('.sus-card-content');
            
            if (!checkbox || !cardContent) return;

            // Update visual state initially
            updateCardVisual(checkbox, cardContent);

            // Important: We listen to CHANGE on the checkbox. 
            // The label click will trigger the checkbox change automatically.
            checkbox.addEventListener('change', () => {
                updateCardVisual(checkbox, cardContent);
            });
        });
    }

    function updateCardVisual(checkbox, cardContent) {
        const checkIcon = cardContent.querySelector('.fa-check');
        const dotIndicator = cardContent.querySelector('.check-dot');
        
        if (checkbox.checked) {
            cardContent.style.borderColor = '#4BB7AE';
            cardContent.style.background = '#f0fdfa';
            cardContent.style.boxShadow = '0 4px 12px rgba(75, 183, 174, 0.15)';
            if (dotIndicator) {
                dotIndicator.style.background = '#4BB7AE';
                dotIndicator.style.border = 'none';
            }
            if (checkIcon) checkIcon.style.display = 'block';
        } else {
            cardContent.style.borderColor = '#f1f5f9';
            cardContent.style.background = '#fafafa';
            cardContent.style.boxShadow = 'none';
            if (dotIndicator) {
                dotIndicator.style.background = 'white';
                dotIndicator.style.border = '2px solid #e2e8f0';
            }
            if (checkIcon) checkIcon.style.display = 'none';
        }
    }

    initSusCards();

    // --- PARTCIPANTS SEARCH ---
    const clientInput = document.getElementById('client-search-input');
    const suggestionsBox = document.getElementById('client-suggestions');
    const selectedList = document.getElementById('selected-clients-list');
    const clientsCountEl = document.getElementById('clients-count');
    let usersData = [];
    try {
        const jsonStr = document.getElementById('users_json')?.textContent;
        if (jsonStr) usersData = JSON.parse(jsonStr);
    } catch(e) {}

    if (clientInput) {
        clientInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (q.length < 1) { suggestionsBox.style.display = 'none'; return; }
            const matches = usersData.filter(u => u.name.toLowerCase().includes(q)).slice(0, 10);
            suggestionsBox.innerHTML = matches.map(u => `
                <div class="suggestion-item-v2" data-id="${u.id}" data-name="${u.name}" style="padding:12px 16px; cursor:pointer; border-bottom:1px solid #f1f5f9; font-size:14px; font-weight:600; color:#1e293b;">
                    ${u.name}
                </div>
            `).join('');
            suggestionsBox.style.display = 'block';

            suggestionsBox.querySelectorAll('.suggestion-item-v2').forEach(it => {
                it.addEventListener('click', () => {
                    addParticipant(it.dataset.id, it.dataset.name);
                    clientInput.value = '';
                    suggestionsBox.style.display = 'none';
                    clientInput.focus();
                });
            });
        });
    }

    function addParticipant(id, name) {
        if (document.querySelector(`.participant-item-row[data-id="${id}"]`)) return;
        const empty = selectedList.querySelector('.empty-state-clean');
        if (empty) empty.remove();

        const div = document.createElement('div');
        div.className = 'participant-item-row';
        div.dataset.id = id;
        div.style.cssText = "display:flex; align-items:center; gap:12px; padding:12px; background:#f8fafc; border-radius:14px; border:1px solid #e2e8f0; margin-bottom:8px; animation: fadeIn 0.3s ease;";
        div.innerHTML = `
            <div style="width:32px; height:32px; font-size:11px; font-weight:800; background: #4BB7AE; color:white; border-radius:10px; display:flex; align-items:center; justify-content:center;">${name.charAt(0)}</div>
            <span style="flex:1; font-weight:700; font-size:14px; color:#1e293b;">${name}</span>
            <input type="hidden" name="users[]" value="${id}">
            <button type="button" class="remove-p-btn" style="border:none; background:rgba(239, 68, 68, 0.1); color:#ef4444; width:28px; height:28px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: all 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        `;
        div.querySelector('.remove-p-btn').addEventListener('click', () => {
            div.remove();
            if (selectedList.children.length === 0) {
                selectedList.innerHTML = '<div class="empty-state-clean"><i class="fa-solid fa-users-slash"></i><p>Busca alumnos</p></div>';
            }
            updatePCount();
        });
        selectedList.appendChild(div);
        updatePCount();
    }

    function updatePCount() { if (clientsCountEl) clientsCountEl.textContent = `(${document.querySelectorAll('.participant-item-row').length})`; }

    // --- RECURRENCE ---
    const rcCheck = document.getElementById('is_recurring');
    const rcOps = document.getElementById('recurrence_options');
    if (rcCheck && rcOps) {
        rcCheck.addEventListener('change', e => {
            rcOps.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // --- SUBMIT ---
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            const payload = {
                centros: $('#centros').val() || [],
                nombre_clase: document.getElementById('nombre_clase').value,
                tipo_clase: document.getElementById('tipo_clase').value,
                capacidad: document.getElementById('capacidad').value,
                suscripciones_permitidas: Array.from(document.querySelectorAll('input[name="suscripciones_permitidas[]"]:checked')).map(i=>i.value),
                trainers: Array.from(document.querySelectorAll('input[name="trainers[]"]:checked')).map(i=>i.value),
                fecha_hora: document.getElementById('fecha_hora').value,
                precio_base: document.getElementById('precio_base').value || 0,
                is_recurring: rcCheck.checked ? 1 : 0,
                recurrence_end: document.getElementById('recurrence_end').value,
                participants: [],
            };
            
            document.querySelectorAll('.participant-item-row').forEach(p => {
                payload.participants.push({
                    user_id: p.dataset.id,
                    precio: payload.precio_base,
                    metodo_pago: 'CREDITO'
                });
            });

            try {
                Swal.fire({
                    title: 'Guardando sesión...',
                    html: 'Por favor espera un momento.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                const res = await fetch(form.getAttribute('data-url'), {
                    method:'POST', 
                    headers:{
                        'Content-Type':'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (data.success) { 
                    Swal.fire({
                        icon: 'success', 
                        title: '¡Sesión Creada!', 
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => location.reload()); 
                } else { 
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo guardar',
                        text: data.message || 'Error desconocido'
                    });
                }
            } catch(e){ 
                Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.' });
            }
        });
    }

    updateUI();
});
