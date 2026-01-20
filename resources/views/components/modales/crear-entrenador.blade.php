{{-- resources/views/components/modales/crear-entrenador.blade.php --}}
<div id="modalRegistro" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>
        <div class="modal-header-custom">
            <div class="logo-simulado"><i class="fas fa-layer-group"></i></div>
            <h2>Añadir Entrenador</h2>
            <p>Registra un profesional en Factomove.</p>
        </div>

        <form action="{{ route('entrenadores.store') }}" method="POST">
            @csrf
            <div class="form-group">
                <label class="form-label-custom">Nombre Completo</label>
                <div class="input-group-custom">
                    <i class="fas fa-user"></i>
                    <input type="text" name="nombre" class="form-control-custom" placeholder="Ej. Maria Garcia" required value="{{ old('nombre') }}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label-custom">Correo Electrónico</label>
                <div class="input-group-custom">
                    <i class="fas fa-envelope"></i>
                    <input type="email" name="email" class="form-control-custom" placeholder="tucorreo@ejemplo.com" required value="{{ old('email') }}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label-custom">iban</label>
                <div class="input-group-custom">
                    <i class="fas fa-credit-card"></i>
                    <input type="text" name="iban" class="form-control-custom" placeholder="ES00 0000..." required value="{{ old('iban') }}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label-custom">Contraseña</label>
                <div class="input-group-custom">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" class="form-control-custom" placeholder="Mínimo 8 caracteres" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label-custom">Confirmar Contraseña</label>
                <div class="input-group-custom">
                    <i class="fas fa-check-double"></i>
                    <input type="password" name="password_confirmation" class="form-control-custom" placeholder="Repite tu contraseña" required>
                </div>
            </div>
            
            @if(auth()->check() && auth()->user()->hasRole('admin'))
            <div class="form-group" style="margin-top:10px;">
                <label class="form-label-custom">Dar rol de admin</label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" name="make_admin" id="make_admin" value="1">
                    <small>Marcar para dar también rol <strong>admin</strong> al entrenador</small>
                </div>
            </div>
            @endif

            <button type="submit" class="btn-facto">Crear Entrenador</button>
        </form>
    </div>
</div>