{{-- Modal de Confirmación de Eliminación --}}
<div id="modalEliminar" class="modal-overlay">
    <div class="modal-card" style="max-width: 400px;">
        <button type="button" class="close-btn" onclick="cerrarModalEliminar()">&times;</button>
        <div class="modal-header-custom">
            <div class="logo-simulado" style="color: #EF5D7A;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 style="color: #EF5D7A;">¿Eliminar Entrenador?</h2>
            <p>Esta acción no se puede deshacer</p>
        </div>

        <div style="padding: 0 20px 20px; text-align: center;">
            <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                Estás a punto de eliminar a:
            </p>
            <p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 25px;">
                <i class="fas fa-user-circle" style="color: #4BB7AE; margin-right: 8px;"></i>
                <span id="nombreEntrenadorEliminar"></span>
            </p>

            <form id="formEliminar" method="POST" style="display: inline;">
                @csrf
                @method('DELETE')
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button type="button" onclick="cerrarModalEliminar()" 
                        style="padding: 12px 24px; border-radius: 10px; border: 1px solid #ddd; background: #f5f5f5; color: #555; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        Cancelar
                    </button>
                    <button type="submit" 
                        style="padding: 12px 24px; border-radius: 10px; border: none; background: linear-gradient(90deg, #EF5D7A, #ff6b8a); color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 93, 122, 0.3); transition: all 0.2s;">
                        <i class="fas fa-trash-alt" style="margin-right: 6px;"></i>
                        Sí, Eliminar
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Modal Editar --}}
<div id="modalEditar" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>
        <div class="modal-header-custom">
            <div class="logo-simulado"><i class="fas fa-user-edit"></i></div>
            <h2>Editar Entrenador</h2>
            <p>Actualiza los datos del profesional.</p>
        </div>

        <form id="formEditar" method="POST">
            @csrf
            @method('PUT') 

            <div class="form-group">
                <label class="form-label-custom">Nombre Completo</label>
                <div class="input-group-custom">
                    <i class="fas fa-user"></i>
                    <input type="text" name="nombre" id="edit_nombre" class="form-control-custom" required readonly>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Correo Electrónico</label>
                <div class="input-group-custom">
                    <i class="fas fa-envelope"></i>
                    <input type="email" name="email" id="edit_email" class="form-control-custom" required readonly>
                </div>
            </div>


            <div class="form-group">
                <label class="form-label-custom">Nueva Contraseña (Opcional)</label>
                <div class="input-group-custom">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" class="form-control-custom" placeholder="Dejar en blanco para no cambiar">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Confirmar Nueva Contraseña</label>
                <div class="input-group-custom">
                    <i class="fas fa-check-double"></i>
                    <input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite solo si cambiaste arriba">
                </div>
            </div>

            @if(auth()->check() && auth()->user()->hasRole('admin'))
            <div class="form-group" style="margin-top:10px;">
                <label class="form-label-custom">Dar rol de admin</label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" name="make_admin" id="edit_make_admin" value="1">
                    <small>Marcar para dar/quitar rol <strong>admin</strong></small>
                </div>
            </div>
            @endif

           

            <button type="submit" class="btn-facto">Actualizar Datos</button>
        </form>
    </div>
</div>

{{-- Modal Perfil Detallado Rediseñado --}}
<div id="modalPerfil" class="modal-overlay">
    <div class="modal-card" style="max-width: 750px; padding: 0; overflow: hidden; border-radius: 30px; background: #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <button type="button" class="close-btn" style="top: 25px; right: 25px; z-index: 50; background: rgba(0,0,0,0.05); width: 40px; height: 40px; border-radius: 50%; color: #64748b; font-size: 20px;" onclick="cerrarModalPerfil()">&times;</button>
        
        <div style="display: flex; flex-direction: row; min-height: 500px;">
            <!-- COLUMNA IZQUIERDA: Identidad -->
            <div style="width: 320px; background: linear-gradient(180deg, #4BB7AE 0%, #38C1A3 100%); padding: 50px 30px; color: #ffffff !important; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                
                <div id="perfil_avatar_wrapper" style="width: 160px; height: 160px; border-radius: 50%; background: #ffffff; padding: 6px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); margin-bottom: 25px;">
                    <div id="perfil_visual" style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4BB7AE, #EF5D7A);">
                        <!-- PHOTO OR INITIAL INJECTED BY JS -->
                    </div>
                </div>

                <h2 id="perfil_nombre" style="font-size: 28px; font-weight: 900; margin: 0; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #ffffff !important;"></h2>
                <p id="perfil_email" style="font-size: 15px; color: rgba(255,255,255,1) !important; margin-top: 10px; word-break: break-all; font-weight: 650;"></p>
                
                <div style="margin-top: 30px; padding: 10px 25px; background: rgba(255,255,255,0.2); border-radius: 30px; font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid rgba(255,255,255,0.4); color: #ffffff !important;">
                    Entrenador Certificado
                </div>
            </div>

            <!-- COLUMNA DERECHA: Datos -->
            <div style="flex: 1; padding: 50px 45px; position: relative; background: #ffffff;">
                <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 35px; display: flex; align-items: center; gap: 12px;">
                    <span style="width: 35px; height: 3px; background: #4BB7AE; border-radius: 2px;"></span>
                    DATOS DEL PROFESIONAL
                </h3>

                <div style="display: grid; grid-template-columns: 1fr; gap: 28px;">
                    <div style="display: flex; gap: 18px; align-items: flex-start;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #EF5D7A; font-size: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-id-card"></i>
                        </div>
                        <div>
                            <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">DNI / Pasaporte</span>
                            <span id="perfil_dni" style="font-size: 16px; font-weight: 700; color: #334155;"></span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 18px; align-items: flex-start;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #EF5D7A; font-size: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div>
                            <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Teléfono</span>
                            <span id="perfil_telefono" style="font-size: 16px; font-weight: 700; color: #334155;"></span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 18px; align-items: flex-start;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #EF5D7A; font-size: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div style="flex: 1;">
                            <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">IBAN / Cuenta</span>
                            <span id="perfil_iban" style="font-size: 14px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', 'Courier New', monospace;"></span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 18px; align-items: flex-start;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #EF5D7A; font-size: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Dirección</span>
                            <span id="perfil_direccion" style="font-size: 16px; font-weight: 700; color: #334155;"></span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 25px; border-top: 1px solid #f1f5f9;">
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <div style="color: #94a3b8; font-size: 18px;"><i class="fas fa-birthday-cake"></i></div>
                            <div>
                                <span style="display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Nacimiento</span>
                                <span id="perfil_fecha_nacimiento" style="font-size: 14px; font-weight: 700; color: #475569;"></span>
                            </div>
                        </div>
                        <div style="background: #f0fdf4; padding: 8px 16px; border-radius: 10px; border: 1px solid #d1fae5;">
                            <span style="color: #059669; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite;"></span>
                                ACTIVO
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        </style>
    </div>
</div>
