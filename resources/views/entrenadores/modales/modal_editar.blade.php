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
