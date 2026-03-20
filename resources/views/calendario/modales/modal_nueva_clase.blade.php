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
                    <span class="step-label">Accesibilidad</span>
                    <span class="step-desc">Filtro de suscripciones</span>
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
                        <!-- Capacidad -->
                        <div id="capacidad-container" class="input-group-clean" style="display: none; margin-top: 15px;">
                            <label>Límite de Personas (Solo para Grupos)</label>
                            <input id="capacidad" type="number" name="capacidad" class="input-clean" min="1" placeholder="Ej. 10">
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

                <!-- STEP 3 (NEW): ACCESIBILIDAD -->
                <div id="step-3" class="wizard-step" style="display:none;">
                    <div class="form-section-title">CONTROL DE ACCESO POR SUSCRIPCIÓN</div>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Selecciona qué paquetes de suscripción tienen permitido el acceso a esta sesión específica.</p>
                    
                    <div class="subscriptions-grid-clean" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                        @foreach($suscripciones as $sus)
                            <label class="subscription-access-card" style="display: block; cursor: pointer;">
                                <input type="checkbox" name="suscripciones_permitidas[]" value="{{ $sus->id }}" style="opacity:0; position:absolute; pointer-events:none;" class="sus-checkbox">
                                <div class="sus-card-content" style="border: 2px solid #f1f5f9; border-radius: 16px; padding: 16px; transition: all 0.2s; position: relative; background: #fafafa;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <span style="font-weight: 800; font-size: 15px; color: #0f172a;">{{ $sus->nombre }}</span>
                                        <div class="check-dot" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; background: white;">
                                            <i class="fa-solid fa-check" style="font-size: 10px; color: white; display: none;"></i>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                                            Tipo: {{ $sus->tipo_credito }}
                                        </span>
                                        <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">
                                            Centro: {{ $sus->centro->nombre ?? 'Global' }}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        @endforeach
                    </div>
                    <div style="margin-top: 25px; padding: 12px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 12px; color: #0369a1; font-size: 13px;">
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
    /* --- Select2 Overrides for Modern UI --- */
    .select2-container--default .select2-selection--multiple {
        background-color: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        min-height: 48px !important;
        padding: 4px 8px !important;
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
        transition: all 0.2s ease !important;
    }
    .select2-container--default.select2-container--focus .select2-selection--multiple {
        border-color: #4BB7AE !important;
        background-color: #ffffff !important;
        box-shadow: 0 0 0 4px rgba(75, 183, 174, 0.1) !important;
    }
    .select2-container--default .select2-selection--multiple .select2-selection__choice {
        background-color: #4BB7AE !important;
        border: none !important;
        border-radius: 8px !important;
        color: white !important;
        padding: 4px 10px 4px 28px !important; /* Spacing for the X on the left */
        margin: 4px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
    }
    .select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
        color: rgba(255,255,255,0.8) !important;
        border: none !important;
        background: rgba(0,0,0,0.1) !important;
        height: 100% !important;
        width: 24px !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        border-radius: 8px 0 0 8px !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s !important;
    }
    .select2-container--default .select2-selection--multiple .select2-selection__choice__remove:hover {
        background: rgba(0,0,0,0.2) !important;
        color: white !important;
    }
    .select2-container--default .select2-search--inline .select2-search__field {
        margin: 4px !important;
        height: 32px !important;
        font-family: inherit !important;
    }
    /* Hide the default small X in corners to match our cleaner badge style if necessary */
    .select2-container--default .select2-selection--multiple .select2-selection__choice__display {
        padding-left: 0 !important;
    }
  </style>
</div>
