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
        <form id="formNuevaClaseWizard" onsubmit="return false;" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            @csrf
            
            <!-- Scrollable Step Area -->
            <div class="wizard-body" style="flex: 1; overflow-y: auto; padding: 32px;">
                
                <!-- STEP 1 -->
                <div id="step-1" class="wizard-step">
                    <div class="form-section-title">DETALLES GENERALES</div>
                    
                    <div class="form-grid-2">
                         <!-- Centro -->
                         <div class="input-group-clean">
                            <label>Centro Deportivo</label>
                            <select id="centro" name="centro" class="input-clean" required>
                                <option value="" disabled selected>Selecciona centro...</option>
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
                            <div class="select-cards-container">
                                <!-- Custom Radio Cards structure controlled by JS or simple select. Stick to select for simplicity but styled better, or use cards if possible. 
                                     To ensure compatibility with existing JS logic "window.handleTipoChange()", we keep the SELECT but hide it visually or style it? 
                                     Let's use a nice styled SELECT first to avoid breaking changes, as requested professional structure. -->
                                <div class="custom-select-wrapper">
                                    <select id="tipo_clase" name="tipo_clase" class="input-clean" required onchange="window.handleTipoChange()">
                                        <option value="EP" selected>EP (Individual)</option>
                                        <option value="DUO">DUO</option>
                                        <option value="TRIO">TRIO</option>
                                        <option value="GRUPO_PRIVADO">GRUPO PRIVADO</option>
                                        <option value="GRUPO">GRUPO</option>
                                    </select>
                                    <div class="select-icon"><i class="fa-solid fa-chevron-down"></i></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 32px;">
                        <div class="form-section-title">EQUIPO TÉCNICO</div>
                        <div class="trainers-grid-clean">
                            @if(isset($entrenadores) && $entrenadores->count() > 0)
                                @foreach($entrenadores as $coach)
                                    <label class="trainer-card-clean">
                                        <input type="checkbox" name="trainers[]" value="{{ $coach->id }}">
                                        <div class="t-card-content">
                                            <div class="t-avatar">{{ strtoupper(substr($coach->name, 0, 1)) }}</div>
                                            <div class="t-info">
                                                <span class="t-name">{{ $coach->name }}</span>
                                                <span class="t-role">Entrenador</span>
                                            </div>
                                            <div class="t-check"><i class="fa-solid fa-circle-check"></i></div>
                                        </div>
                                    </label>
                                @endforeach
                            @else
                                <div class="empty-msg">No hay entrenadores disponibles</div>
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
                             <input id="precio_base" type="number" step="0.01" class="input-clean" placeholder="0.00" required>
                        </div>
                    </div>

                    <div style="margin-top: 40px;">
                        <div class="form-section-title">PARTICIPANTES <span id="clients-count" style="font-weight:400; font-size:11px; color:#94a3b8; margin-left:5px;"></span></div>
                        
                        <!-- Inline Search -->
                        <div class="client-search-wrapper" style="position:relative; margin-bottom: 15px;">
                            <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:12px; top:12px; color:#94a3b8;"></i>
                            <input type="text" id="client-search-input" class="input-clean" style="padding-left: 36px;" placeholder="Buscar alumno por nombre..." autocomplete="off">
                            <div id="client-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:200px; overflow-y:auto; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50; margin-top:4px;"></div>
                        </div>

                        <div id="selected-clients-list" class="participants-grid-clean">
                            <!-- JS Fills this -->
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
                     <button type="submit" id="btn-submit-wizard" class="btn-clean-success" style="display: none;">
                        <i class="fa-solid fa-check"></i> CONFIRMAR Y GUARDAR
                     </button>
                </div>
            </div>
        </form>
    </div>
  </div>

  <!-- Include Scripts -->
  <script src="{{ asset('js/wizard_clase.js') }}"></script>
  <script type="application/json" id="users_json">
      @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values())
  </script>

  <!-- Clean CSS Styles -->
  <style>
    /* Reset & Fonts */
    .wizard-box { font-family: 'Inter', sans-serif; }
    
    /* Nav Items */
    .nav-step {
        display: flex; align-items: center; gap: 12px; padding: 12px 16px;
        border-radius: 10px; cursor: default; transition: all 0.2s;
        margin-bottom: 4px;
    }
    .nav-step.active { background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    
    /* Active Step Icon: Teal-Pink Gradient */
    .nav-step.active .nav-step-icon { 
        background: linear-gradient(135deg, #39c5a7, #eb567a); 
        color: white; 
        border: none;
    }
    .nav-step.active .step-label { color: #0f172a; font-weight: 700; }
    
    .nav-step:not(.active) { opacity: 0.6; }
    .nav-step.completed .nav-step-icon { background: #39c5a7; border-color: #39c5a7; color: white; }

    .nav-step-icon {
        width: 32px; height: 32px; border-radius: 50%; border: 2px solid #cbd5e1;
        color: #64748b; font-weight: 700; display: flex; align-items: center; justify-content: center;
        background: white; flex-shrink: 0; font-size: 14px;
    }
    .step-label { display: block; font-size: 14px; color: #475569; font-weight: 600; }
    .step-desc { display: block; font-size: 11px; color: #94a3b8; }

    /* Forms */
    .form-section-title { font-size: 12px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    
    .input-group-clean label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    .input-clean {
        width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
        font-size: 14px; color: #1e293b; background: #f8fafc; transition: all 0.2s;
    }
    .input-clean:focus { background: white; border-color: #39c5a7; outline: none; box-shadow: 0 0 0 3px rgba(57, 197, 167, 0.1); }

    /* Trainers Grid */
    .trainers-grid-clean { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .trainer-card-clean { cursor: pointer; position: relative; }
    .trainer-card-clean input { position: absolute; opacity: 0; }
    .t-card-content {
        border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;
        background: white; transition: all 0.2s;
    }
    /* Trainer Checked State */
    .trainer-card-clean input:checked + .t-card-content { border-color: #39c5a7; background: #f0fdfa; box-shadow: 0 4px 6px -1px rgba(57, 197, 167, 0.1); }
    
    /* Trainer Avatar with Gradient */
    .t-avatar { 
        width: 36px; height: 36px; 
        background: linear-gradient(135deg, #39c5a7, #eb567a); 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        font-weight: 700; color: white; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    
    .t-info { flex: 1; display: flex; flex-direction: column; }
    .t-name { font-size: 13px; font-weight: 600; color: #334155; }
    .t-role { font-size: 11px; color: #94a3b8; }
    .t-check { display: none; color: #39c5a7; }
    .trainer-card-clean input:checked + .t-card-content .t-check { display: block; }

    /* Participants */
    .participants-grid-clean { margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .empty-state-clean { grid-column: 1/-1; text-align: center; color: #cbd5e1; padding: 40px; border: 2px dashed #f1f5f9; border-radius: 12px; }
    .empty-state-clean i { font-size: 24px; margin-bottom: 8px; }

    /* Payments Table */
    .payments-table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr; background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .payment-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; align-items: center; background: white; }
    .payment-row:last-child { border-bottom: none; }

    /* Buttons */
    .btn-clean-primary { background: #0f172a; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
    .btn-clean-primary:hover { background: #1e293b; transform: translateY(-1px); }
    
    .btn-clean-secondary { background: white; color: #334155; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; }
    .btn-clean-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

    .btn-clean-text { background: transparent; color: #64748b; border: none; font-weight: 600; font-size: 14px; cursor: pointer; padding: 10px 16px; }
    .btn-clean-text:hover { color: #334155; }

    /* Success Button Gradient Update */
    .btn-clean-success { 
        background: linear-gradient(90deg, #39c5a7 0%, #eb567a 100%); 
        color: white; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; 
        cursor: pointer; box-shadow: 0 4px 6px -1px rgba(235, 86, 122, 0.2); 
    }
    .btn-clean-success:hover { box-shadow: 0 6px 8px -2px rgba(235, 86, 122, 0.4); transform: translateY(-1px); }

    /* Animation */
    .wizard-step { animation: fadeIn 0.4s ease; }

    /* RESPONSIVE MOBILE */
    @media (max-width: 768px) {
        .modal-box {
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
        }

        .wizard-sidebar {
            width: 100% !important;
            height: auto !important;
            flex-direction: row !important;
            align-items: center;
            padding: 10px 15px !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0;
            gap: 10px;
        }

        .sidebar-header, .sidebar-footer { display: none !important; }

        .wizard-nav {
            flex-direction: row !important;
            gap: 10px !important;
            justify-content: center;
            width: 100%;
        }

        .nav-step {
            padding: 5px !important;
            background: transparent !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
        }

        .nav-step-info { display: none; }
        .nav-step-icon { width: 36px; height: 36px; font-size: 14px; }

        .wizard-main { width: 100% !important; }
        .wizard-header { padding: 15px 20px !important; }
        .wizard-body { padding: 20px !important; }
        .wizard-footer { padding: 15px 20px !important; }

        .form-grid-2 { grid-template-columns: 1fr !important; gap: 15px !important; }

        /* Payment Table Mobile */
        .table-header { display: none !important; }
        .payment-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            padding: 15px !important;
            border: 1px solid #f1f5f9;
            margin-bottom: 10px;
            border-radius: 8px;
        }
    }
  </style>
</div>
