<div id="modalEditar" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>
        <div class="modal-header-custom">
            <div id="default_header_icon_trainer" class="logo-simulado"><i class="fas fa-user-edit"></i></div>
            
            <!-- Contenedor Foto Perfil (Oculto por defecto) -->
            <div id="photo_header_container_trainer" style="display:none; position: relative; width: 100px; height: 100px; margin: 0 auto 15px;">
                <img id="modal_edit_photo_img_trainer" src="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid white;">
                
                <button type="button" id="btn_delete_photo_action_trainer" style="position: absolute; bottom: 0; right: 0; background: #ef5d7a; color: white; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <i class="fas fa-trash-alt" style="font-size: 12px;"></i>
                </button>
            </div>

            <h2>Editar Entrenador</h2>
            <p>Actualiza los datos del profesional.</p>
        </div>

        <form id="formEditar" method="POST">
            @csrf
            @method('PUT') 

            <input type="checkbox" name="delete_profile_photo" id="delete_profile_photo_input_trainer" value="1" style="display:none;">

            {{-- 
            <div id="divDeletePhotoTrainer" ...>
                ...
            </div> 
            --}} 

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
                <label class="form-label-custom">iban</label>
                <div class="input-group-custom">
                    <i class="fas fa-credit-card"></i>
                    <input type="text" name="iban" id="edit_iban" class="form-control-custom" placeholder="ES00 0000 0000 0000 0000 0000">
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

            <button type="submit" class="btn-facto">Actualizar Datos</button>
        </form>
    </div>
</div>
