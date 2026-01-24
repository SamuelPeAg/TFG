<div id="modalRegistro" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>

        <div class="modal-header-custom">
            <div class="logo-simulado">
                <i class="fas fa-layer-group"></i>
            </div>
            <h2>Añadir Entrenador</h2>
            <p>Registra un profesional en Factomove.</p>
        </div>

        <form id="formCrearEntrenador"
              action="{{ route('entrenadores.store') }}"
              method="POST">
            @csrf

            <div class="form-group">
                <label class="form-label-custom">Nombre Completo</label>
                <div class="input-group-custom">
                    <i class="fas fa-user"></i>
                    <input
                        type="text"
                        name="nombre"
                        class="form-control-custom"
                        placeholder="Ej. Maria Garcia"
                        required
                        value="{{ old('nombre') }}"
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Correo Electrónico</label>
                <div class="input-group-custom">
                    <i class="fas fa-envelope"></i>
                    <input
                        type="email"
                        name="email"
                        class="form-control-custom"
                        placeholder="tucorreo@ejemplo.com"
                        required
                        value="{{ old('email') }}"
                    >
                </div>
            </div>

            <button
                id="btnSubmitCrearEntrenador"
                type="submit"
                class="btn-facto"
            >
                Crear Entrenador
            </button>
        </form>
    </div>
</div>
