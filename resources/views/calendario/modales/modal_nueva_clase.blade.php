<div id="modalNuevaClase" class="modal-overlay" role="dialog" aria-hidden="true">
  <!-- Main Box: Two Columns (Sidebar + Content) -->
  <div class="modal-box modal-expanded" style="max-width: 950px; height: 85vh; padding:0; display: flex; flex-direction: row; overflow:hidden; border-radius: 16px;">
    
    <!-- LEFT SIDEBAR -->
    <div class="wizard-sidebar" style="width: 260px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 24px;">
        <!-- Logo / Brand -->
        <div class="sidebar-header" style="margin-bottom: 40px; display: flex; align-items: center; gap: 12px;">
            <img src="{{ asset('img/logopng.png') }}" alt="Logo" style="width: 32px; height: 32px;">
            <span style="font-weight: 800; color: #0f172a; font-size: 16px; letter-spacing: -0.5px;">FACTOMOVE</span>
        </div>

        <!-- Step Navigation -->
        <div class="wizard-nav" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <!-- Step 1 Item -->
            <div class="nav-step active" data-step="1">
                <div class="nav-step-icon">1</div>
                <div class="nav-step-info">
                    <span class="step-label">Configuración</span>
                    <span class="step-desc">Centro y Entrenadores</span>
                </div>
            </div>
            
            <!-- Step 2 Item -->
            <div class="nav-step" data-step="2">
                <div class="nav-step-icon">2</div>
                <div class="nav-step-info">
                    <span class="step-label">Planificación</span>
                    <span class="step-desc">Horario y Alumnos</span>
                </div>
            </div>

            <!-- Step 3 Item -->
            <div class="nav-step" data-step="3">
                <div class="nav-step-icon">3</div>
                <div class="nav-step-info">
                    <span class="step-label">Facturación</span>
                    <span class="step-desc">Detalles de pagos</span>
                </div>
            </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer" style="margin-top: auto; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            <p>&copy; {{ date('Y') }} Factomove</p>
        </div>
    </div>

    <!-- RIGHT CONTENT -->
    <div class="wizard-main" style="flex: 1; display: flex; flex-direction: column; background: #ffffff; position: relative;">
        
        <!-- Close Button (Absolute in right panel) -->
        <button type="button" class="close-icon" id="btnCerrarNuevaClase" style="position: absolute; top: 20px; right: 20px; z-index:10; color: #64748b; background:transparent; border:none; font-size: 24px; cursor: pointer;">&times;</button>

        <!-- Dynamic Header -->
        <div class="wizard-header" style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9;">
            <h2 id="wizard-title" style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a;">Agendar Nueva Clase</h2>
            <p id="wizard-subtitle" style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Completa los detalles para crear una sesión.</p>
        </div>

        <!-- Form Content -->
        <form id="formNuevaClaseWizard" data-url="{{ route('Pagos.store') }}" onsubmit="return false;" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            @csrf
            
            <!-- Scrollable Step Area -->
            <div class="wizard-body" style="flex: 1; overflow-y: auto; padding: 32px;">
                
                <!-- STEP 1 -->
                <div id="step-1" class="wizard-step">
                    <div class="form-section-title">DETALLES GENERALES</div>
                    
                    <div class="form-grid-2">
                         <!-- Centro -->
                         <div class="input-group-clean">
                            <label>Centros Deportivos (Selecciona uno o más)</label>
                            <select id="centros" name="centros[]" class="input-clean select2-basic" multiple style="width: 100%;" required>
                                @foreach($centros as $centro)
                                    <option value="{{ $centro->nombre }}">{{ $centro->nombre }}</option>
                                @endforeach
                            </select>
                         </div>
                         <!-- Nombre Clase -->
                         <div class="input-group-clean">
                            <label>Nombre de la Clase</label>
                            <input id="nombre_clase" type="text" name="nombre_clase" class="input-clean" placeholder="Ej. Pilates Reformer" required>
                         </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <div class="input-group-clean">
                            <label>Tipo de Sesión</label>
                            <select id="tipo_clase" name="tipo_clase" class="input-clean select2-basic" style="width:100%" required>
                                <option value="ep" selected>EP (Personal)</option>
                                <option value="duo">Dúo</option>
                                <option value="trio">Trío</option>
                                <option value="privado">Privado</option>
                                <option value="Grupo especial">Grupo especial</option>
                                <option value="Grupo">Grupo</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-top: 40px;">
                        <div class="form-section-title">ASIGNACIÓN DE ENTRENADORES</div>
                        <div class="trainers-grid-clean">
                            @if(isset($entrenadores) && count($entrenadores) > 0)
                                @foreach($entrenadores as $coach)
                                    <label class="trainer-card-clean">
                                        <input type="checkbox" name="trainers[]" value="{{ $coach->id }}">
                                        <div class="t-card-content">
                                             <div class="t-avatar">
                                                @if($coach->profile_photo_path)
                                                    <img src="{{ asset('storage/'.$coach->profile_photo_path) }}" alt="{{ $coach->name }}">
                                                @else
                                                    {{ strtoupper(substr($coach->name, 0, 1)) }}
                                                @endif
                                            </div>
                                            <div class="t-info">
                                                <span class="t-name">{{ $coach->name }}</span>
                                                <span class="t-role">Entrenador</span>
                                            </div>
                                            <div class="t-check"><i class="fa-solid fa-circle-check"></i></div>
                                        </div>
                                    </label>
                                @endforeach
                            @endif
                        </div>
                    </div>
                </div>

                <!-- STEP 2 -->
                <div id="step-2" class="wizard-step" style="display:none;">
                    <div class="form-section-title">AGENDA Y PRECIOS</div>
                    
                    <div class="form-grid-2">
                        <div class="input-group-clean">
                             <label>Fecha y Hora</label>
                             <input id="fecha_hora" type="datetime-local" name="fecha_hora" class="input-clean" required>
                        </div>
                        <div class="input-group-clean">
                             <label>Precio Base por Persona (€)</label>
                             <input id="precio_base" type="number" step="0.01" class="input-clean" placeholder="0.00" value="0.00" required>
                        </div>
                    </div>

                    <!-- REPETICION -->
                    <div style="margin-top: 24px; padding: 16px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 0;">
                            <input type="checkbox" name="is_recurring" id="is_recurring" value="1" style="width: 18px; height: 18px; accent-color: #39c5a7;">
                            <span style="font-weight: 700; color: #0f172a; font-size: 14px;">Repetir esta clase semanalmente</span>
                        </label>
                        <div id="recurrence_options" style="display: none; margin-top: 15px; border-top: 1px solid #ccfbf1; padding-top: 15px;">
                            <div class="input-group-clean">
                                <label style="font-size: 12px; color: #134e4a;">Repetir hasta el día:</label>
                                <input type="date" name="recurrence_end" id="recurrence_end" class="input-clean" style="background: white;">
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 40px;">
                        <div class="form-section-title">PARTICIPANTES <span id="clients-count" style="font-weight:400; font-size:11px; color:#94a3b8; margin-left:5px;"></span></div>
                        
                        <div class="client-search-wrapper" style="position:relative; margin-bottom: 15px;">
                            <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:12px; top:12px; color:#94a3b8;"></i>
                            <input type="text" id="client-search-input" class="input-clean" style="padding-left: 36px;" placeholder="Buscar alumno por nombre..." autocomplete="off">
                            <div id="client-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:200px; overflow-y:auto; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50; margin-top:4px;"></div>
                        </div>

                        <div id="selected-clients-list" class="participants-grid-clean">
                            <div class="empty-state-clean">
                                <i class="fa-solid fa-users-slash"></i>
                                <p>Busca y selecciona alumnos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- STEP 3 -->
                <div id="step-3" class="wizard-step" style="display:none;">
                    <div class="form-section-title">DETALLES DE PAGO INDIVIDUAL</div>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Revisa los importes y métodos de pago para cada asistente.</p>
                    
                    <div class="payments-table-container">
                        <div class="table-header">
                            <span>Alumno</span>
                            <span>Precio (€)</span>
                            <span>Método</span>
                        </div>
                        <div id="payment-rows-container" class="table-body">
                            <!-- JS Fills -->
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer Actions -->
            <div class="wizard-footer" style="flex-shrink: 0; padding: 20px 32px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
                <button type="button" id="btn-prev-step" class="btn-clean-text" style="display: none;">
                    <i class="fa-solid fa-arrow-left"></i> Anterior
                </button>
                
                <div style="margin-left: auto;">
                     <button type="button" id="btn-next-step" class="btn-clean-primary">
                        Siguiente <i class="fa-solid fa-arrow-right"></i>
                     </button>
                     <button type="button" id="btn-submit-wizard" class="btn-clean-success" style="display: none;">
                        <i class="fa-solid fa-check"></i> CONFIRMAR Y GUARDAR
                     </button>
                </div>
            </div>
        </form>
    </div>
  </div>

  <script type="application/json" id="users_json">
      @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values())
  </script>

  <script>
    (function() {
        let currentStep = 1;
        const totalSteps = 3;

        const modal = document.getElementById('modalNuevaClase');
        const form = document.getElementById('formNuevaClaseWizard');
        const btnNext = document.getElementById('btn-next-step');
        const btnPrev = document.getElementById('btn-prev-step');
        const btnSubmit = document.getElementById('btn-submit-wizard');
        const navSteps = document.querySelectorAll('.nav-step');
        const wizardTitle = document.getElementById('wizard-title');
        const wizardSubtitle = document.getElementById('wizard-subtitle');

        const stepTitles = {
            1: { title: "Configuración Inicial", sub: "Define centros, nombre y tipo de sesión." },
            2: { title: "Planificación Horaria", sub: "Establece la fecha, precio y participantes." },
            3: { title: "Revisión de Pagos", sub: "Confirma los detalles económicos por asistente." }
        };

        function updateUI() {
            document.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
            document.getElementById(`step-${currentStep}`).style.display = 'block';

            navSteps.forEach(ns => {
                const s = parseInt(ns.dataset.step);
                ns.classList.toggle('active', s === currentStep);
                ns.classList.toggle('completed', s < currentStep);
            });

            btnPrev.style.display = currentStep > 1 ? 'flex' : 'none';
            btnNext.style.display = currentStep < totalSteps ? 'flex' : 'none';
            btnSubmit.style.display = currentStep === totalSteps ? 'flex' : 'none';

            if (stepTitles[currentStep]) {
                wizardTitle.textContent = stepTitles[currentStep].title;
                wizardSubtitle.textContent = stepTitles[currentStep].sub;
            }

            if (currentStep === 3) prepareStep3();
        }

        btnNext.addEventListener('click', () => {
             if (validateStep(currentStep)) { currentStep++; updateUI(); }
        });
        btnPrev.addEventListener('click', () => { currentStep--; updateUI(); });

        function validateStep(step) {
            const container = document.getElementById(`step-${step}`);
            const required = container.querySelectorAll('[required]');
            let ok = true;
            required.forEach(i => { if(!i.value) { i.style.borderColor = 'red'; ok = false; } else i.style.borderColor = ''; });
            return ok;
        }

        const clientInput = document.getElementById('client-search-input');
        const suggestionsBox = document.getElementById('client-suggestions');
        const selectedList = document.getElementById('selected-clients-list');
        const clientsCountEl = document.getElementById('clients-count');
        let usersData = JSON.parse(document.getElementById('users_json').textContent || '[]');

        clientInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (q.length < 1) { suggestionsBox.style.display = 'none'; return; }
            const matches = usersData.filter(u => u.name.toLowerCase().includes(q)).slice(0, 10);
            suggestionsBox.innerHTML = matches.map(u => `<div class="suggestion-item" data-id="${u.id}" data-name="${u.name}" style="padding:10px 15px; cursor:pointer; border-bottom:1px solid #f1f5f9;">${u.name}</div>`).join('');
            suggestionsBox.style.display = 'block';

            suggestionsBox.querySelectorAll('.suggestion-item').forEach(it => {
                it.addEventListener('click', () => {
                    addParticipant(it.dataset.id, it.dataset.name);
                    clientInput.value = '';
                    suggestionsBox.style.display = 'none';
                });
            });
        });

        function addParticipant(id, name) {
            if (document.querySelector(`.participant-item-row[data-id="${id}"]`)) return;
            const empty = selectedList.querySelector('.empty-state-clean');
            if (empty) empty.remove();

            const div = document.createElement('div');
            div.className = 'participant-item-row';
            div.dataset.id = id;
            div.style.cssText = "display:flex; align-items:center; gap:12px; padding:10px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:5px;";
            div.innerHTML = `
                <div class="t-avatar" style="width:28px; height:28px; font-size:10px; background: #4BB7AE; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center;">${name.charAt(0)}</div>
                <span style="flex:1; font-weight:600; font-size:13px;">${name}</span>
                <input type="hidden" name="users[]" value="${id}">
                <button type="button" class="remove-p" style="border:none; background:none; color:#94a3b8; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            `;
            div.querySelector('.remove-p').addEventListener('click', () => {
                div.remove();
                if (selectedList.children.length === 0) selectedList.innerHTML = '<div class="empty-state-clean"><p>Busca alumnos</p></div>';
                updatePCount();
            });
            selectedList.appendChild(div);
            updatePCount();
        }

        function updatePCount() { clientsCountEl.textContent = `(${document.querySelectorAll('.participant-item-row').length})`; }

        function prepareStep3() {
            const container = document.getElementById('payment-rows-container');
            const participants = document.querySelectorAll('.participant-item-row');
            const basePrice = document.getElementById('precio_base').value || 0;
            container.innerHTML = '';
            participants.forEach(p => {
                const id = p.dataset.id;
                const name = p.querySelector('span').textContent;
                const row = document.createElement('div');
                row.className = 'payment-row';
                row.style.cssText = "display:grid; grid-template-columns:2fr 1fr 1fr; gap:10px; padding:10px; border-bottom:1px solid #f1f5f9;";
                row.innerHTML = `
                    <span style="font-weight:600; font-size:13px;">${name}</span>
                    <input type="number" step="0.01" name="costs[${id}]" value="${basePrice}" class="input-clean" style="padding:4px 8px; font-size:12px;">
                    <select name="methods[${id}]" class="input-clean" style="padding:4px 8px; font-size:12px;">
                        <option value="BONO">BONO</option><option value="EFECTIVO">EFECTIVO</option><option value="TARJETA">TARJETA</option>
                    </select>
                `;
                container.appendChild(row);
            });
        }

        btnSubmit.addEventListener('click', async () => {
            const payload = {
                centros: Array.from(document.getElementById('centros').selectedOptions).map(o=>o.value),
                nombre_clase: document.getElementById('nombre_clase').value,
                tipo_clase: document.getElementById('tipo_clase').value,
                trainers: Array.from(document.querySelectorAll('input[name="trainers[]"]:checked')).map(i=>i.value),
                fecha_hora: document.getElementById('fecha_hora').value,
                is_recurring: document.getElementById('is_recurring').checked ? 1 : 0,
                recurrence_end: document.getElementById('recurrence_end').value,
                users: Array.from(document.querySelectorAll('input[name="users[]"]')).map(i=>i.value),
                costs: {}, methods: {}
            };
            document.querySelectorAll('input[name^="costs["]').forEach(i => { payload.costs[i.name.match(/\[(\d+)\]/)[1]] = i.value; });
            document.querySelectorAll('select[name^="methods["]').forEach(s => { payload.methods[s.name.match(/\[(\d+)\]/)[1]] = s.value; });

            try {
                Swal.fire({title:'Guardando...', didOpen:()=>Swal.showLoading()});
                const res = await fetch(form.getAttribute('data-url'), {
                    method:'POST', headers:{'Content-Type':'application/json','X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content},
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) { 
                    Swal.fire({icon:'success', title:'Guardado', timer:1500});
                    location.reload(); 
                } else { Swal.fire('Error', data.error || 'Error al guardar', 'error'); }
            } catch(e){ Swal.fire('Error','Error de red','error'); }
        });

        document.getElementById('is_recurring').addEventListener('change', e => {
            document.getElementById('recurrence_options').style.display = e.target.checked ? 'block' : 'none';
        });

        updateUI();
    })();
  </script>

  <style>
    .modal-box { font-family: 'Inter', sans-serif; }
    .nav-step { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; opacity: 0.5; transition: 0.2s; }
    .nav-step.active { opacity: 1; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .nav-step.completed { opacity: 0.8; }
    .nav-step-icon { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; font-weight:700; }
    .nav-step.active .nav-step-icon { background: linear-gradient(135deg, #39c5a7, #eb567a); color:white; border:none; }
    .nav-step.completed .nav-step-icon { background: #39c5a7; color:white; border:none; }
    
    .form-section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .input-group-clean label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 5px; }
    .input-clean { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; }
    .input-clean:focus { border-color: #39c5a7; outline: none; background: white; }

    .trainers-grid-clean { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
    .trainer-card-clean input { display: none; }
    .t-card-content { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .trainer-card-clean input:checked + .t-card-content { border-color: #39c5a7; background: #f0fdfa; }
    .t-avatar { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; font-weight:700; overflow:hidden; }
    .t-name { font-size: 13px; font-weight: 600; }

    .btn-clean-primary { background: #4BB7AE; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s; }
    .btn-clean-primary:hover { background: #3da49c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(75, 183, 174, 0.3); }
    .btn-clean-success { background: linear-gradient(90deg, #39c5a7, #eb567a); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; }
    .btn-clean-text { background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; }
  </style>
</div>
