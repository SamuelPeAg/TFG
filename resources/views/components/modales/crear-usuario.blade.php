{{-- resources/views/components/modales/crear-usuario.blade.php --}}
<div id="modalCrearUsuario" class="modal-overlay" aria-hidden="true">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModalCrearUsuario">&times;</button>
        <div class="modal-header-custom">
            <div class="logo-simulado"><i class="fas fa-user-plus"></i></div>
            <h2>Crear Usuario</h2>
        </div>
        <form action="{{ route('users.store') }}" method="POST">
            @csrf
            
            {{-- CAMPO NOMBRE --}}
            <div class="form-group">
                <label class="form-label-custom">Nombre</label>
                <div class="input-group-custom">
                    <i class="fas fa-user"></i>
                    <input type="text" name="name" class="form-control-custom" placeholder="Ej. Juan Pérez" required>
                </div>
            </div>

            {{-- CAMPO EMAIL --}}
            <div class="form-group">
                <label class="form-label-custom">Email</label>
                <div class="input-group-custom">
                    <i class="fas fa-envelope"></i>
                    <input type="email" name="email" class="form-control-custom" placeholder="usuario@email.com" required>
                </div>
            </div>

            {{-- CAMPO PASS --}}
            <div class="form-group">
                <label class="form-label-custom">Pass</label>
                <div class="input-group-custom">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" class="form-control-custom" placeholder="********" required>
                </div>
            </div>

            {{-- CAMPO IBAN --}}
            <div class="form-group">
                <label class="form-label-custom">IBAN</label>
                <div class="input-group-custom">
                    <i class="fas fa-credit-card"></i>
                    <input type="text" name="IBAN" class="form-control-custom" placeholder="ES00 0000 0000 0000...">
                </div>
            </div>

            {{-- CAMPO FIRMA --}}
            <div class="form-group">
                <label class="form-label-custom">Firma</label>
                <div class="input-group-custom">
                    <i class="fas fa-pen-nib"></i>
                    <input type="text" name="firma_digital" class="form-control-custom" placeholder="Código de firma...">
                </div>
            </div>

            <button type="submit" class="btn-facto">Crear</button>
        </form>
    </div>
</div>