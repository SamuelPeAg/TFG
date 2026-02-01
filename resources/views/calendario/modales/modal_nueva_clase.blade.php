  <div id="modalNuevaClase" class="modal-overlay" role="dialog" aria-hidden="true">
    <div class="modal-box modal-expanded">
      <button type="button" class="close-icon" id="btnCerrarNuevaClase" style="position: absolute; top: 15px; right: 15px; z-index:10;">&times;</button>

      <div class="modern-modal-header" style="margin-bottom:0; padding-top:25px;">
          <img src="{{ asset('img/logopng.png') }}" alt="Logo" class="modern-logo" style="width:40px; margin-bottom:5px;"> 
          <h2 class="modern-title" style="font-size:18px;">Agendar Clase</h2>
          <p class="modern-subtitle">Configura la sesión y asigna participantes.</p>
      </div>

      <form id="formNuevaClase" action="{{ route('Pagos.store') }}" method="POST" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        @csrf

        <div class="modal-grid" style="flex:1; overflow-y:auto;">
            <!-- COLUMNA IZQUIERDA: DETALLES -->
            <div class="modal-col-left">
                <h4 class="section-title">DETALLES DE LA SESIÓN</h4>

                <!-- Centro -->
                <div class="modern-form-group">
                  <label for="centro" class="modern-label">CENTRO</label>
                  <div class="input-wrapper">
                    <i class="fa-solid fa-building input-icon"></i>
                    <select id="centro" name="centro" class="modern-input" required>
                        <option value="" disabled selected>Selecciona un centro...</option>
                        @foreach($centros as $centro)
                            <option value="{{ $centro->nombre }}">{{ $centro->nombre }}</option>
                        @endforeach
                    </select>
                  </div>
                </div>

                <!-- Clase -->
                <div class="modern-form-group">
                  <label for="nombre_clase" class="modern-label">NOMBRE DE LA CLASE</label>
                  <div class="input-wrapper">
                    <i class="fa-solid fa-dumbbell input-icon"></i>
                    <input id="nombre_clase" type="text" name="nombre_clase" class="modern-input" placeholder="Ej. Pilates Avanzado" required>
                  </div>
                </div>

                <!-- Tipo -->
                <div class="modern-form-group">
                  <label for="tipo_clase" class="modern-label">TIPO DE CLASE</label>
                  <div class="input-wrapper">
                    <i class="fa-solid fa-layer-group input-icon"></i>
                    <select id="tipo_clase" name="tipo_clase" class="modern-input" required onchange="cambiarTipoClase()">
                        <option value="EP" selected>EP (Individual)</option>
                        <option value="DUO">DUO</option>
                        <option value="TRIO">TRIO</option>
                        <option value="GRUPO_PRIVADO">GRUPO PRIVADO</option>
                        <option value="GRUPO">GRUPO</option>
                    </select>
                  </div>
                </div>

                <!-- Fecha y Precio (Row) -->
                <div class="form-row">
                    <div class="modern-form-group">
                        <label for="fecha_hora" class="modern-label">FECHA Y HORA</label>
                        <div class="input-wrapper">
                            <i class="fa-solid fa-clock input-icon"></i>
                            <input id="fecha_hora" type="datetime-local" name="fecha_hora" class="modern-input" required>
                        </div>
                    </div>
                    <div class="modern-form-group">
                        <label for="precio" class="modern-label">PRECIO (€)</label>
                        <div class="input-wrapper">
                            <i class="fa-solid fa-euro-sign input-icon"></i>
                            <input id="precio" type="number" name="precio" step="0.01" class="modern-input" placeholder="0.00" required>
                        </div>
                    </div>
                </div>
                 <!-- Metodo Pago -->
                <div class="modern-form-group">
                    <label for="metodo_pago" class="modern-label">MÉTODO DE PAGO</label>
                    <div class="input-wrapper">
                      <i class="fa-solid fa-credit-card input-icon"></i>
                      <select id="metodo_pago" name="metodo_pago" class="modern-input" required>
                        <option value="TPV">TPV (Tarjeta)</option>
                        <option value="EF">Efectivo</option>
                        <option value="DD">Domiciliación</option>
                        <option value="CC">Cuenta Corriente</option>
                      </select>
                    </div>
                </div>
            </div>

            <!-- COLUMNA DERECHA: PERSONAS -->
            <div class="modal-col-right">
                <!-- Sección Entrenadores -->
                <h4 class="section-title">EQUIPO TÉCNICO</h4>
                <div class="modern-form-group">
                    <label class="modern-label" style="display:flex; justify-content:space-between;">
                        <span>ENTRENADORES</span>
                        <span style="font-size:10px; opacity:0.7;">(Selecciona uno o varios)</span>
                    </label>
                    <div class="trainers-list-container">
                        @if(isset($entrenadores) && $entrenadores->count() > 0)
                            @foreach($entrenadores as $coach)
                                <label class="trainer-option">
                                    <input type="checkbox" name="trainers[]" value="{{ $coach->id }}">
                                    <div class="trainer-card">
                                        <div class="avatar-circle-sm">
                                            {{ strtoupper(substr($coach->name, 0, 1)) }}
                                        </div>
                                        <span class="trainer-name">{{ $coach->name }}</span>
                                        <i class="fa-solid fa-check check-icon"></i>
                                    </div>
                                </label>
                            @endforeach
                        @else
                            <div style="padding:15px; text-align:center; color:#9ca3af; border:1px dashed #e5e7eb; border-radius:10px;">
                                <small>No hay entrenadores disponibles</small>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Sección Clientes -->
                <h4 class="section-title" style="margin-top:10px;">PARTICIPANTES</h4>
                <div class="modern-form-group" style="flex:1;">
                    <div id="usuarios-container" class="clients-container">
                        <!-- Dynamic -->
                        <div class="modern-form-group user-input-group" id="user-group-0" style="position:relative;">
                          <label class="modern-label">Cliente 1</label>
                          <div class="input-wrapper">
                            <i class="fa-solid fa-user input-icon"></i>
                            <input type="text" class="modern-input user-search" placeholder="Buscar alumno..." autocomplete="off" data-index="0" required>
                            <input type="hidden" name="users[]" class="user-id-input" id="user_id_0">
                          </div>
                          <div id="suggestions_0" class="suggestions" hidden></div>
                        </div>
                    </div>
                    
                    <!-- "Añadir Otro Alumno" button hidden by default, we use the modal now mainly, but keep it if needed for manual entry -->
                    <button type="button" id="btnAddUser" class="btn-design btn-outline-custom" style="display:none; width:100%; margin-top:10px;">
                        <i class="fas fa-plus"></i> Añadir Manualmente
                    </button>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button type="submit" class="btn-gradient" style="max-width:300px; margin:0 auto;">GUARDAR CLASE</button>
        </div>
      </form>

      <script type="application/json" id="users_json">
        @json($users->map(fn($u)=>['id'=>$u->id,'name'=>$u->name])->values())
      </script>

    </div>
  </div>
