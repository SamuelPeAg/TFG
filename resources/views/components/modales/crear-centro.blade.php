<div id="modalRegistro" class="modal-overlay"> <!-- ID matches what standard JS usually expects or I will define in centros.js -->
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModal">&times;</button>

        <div class="modal-header-custom">
            <div class="logo-simulado">
                <i class="fas fa-building"></i>
            </div>
            <h2>Añadir Centro</h2>
            <p>Registra un nuevo centro en Factomove.</p>
        </div>

        <form id="formCrearCentro"
              action="{{ route('centros.store') }}"
              method="POST">
            @csrf

            <div class="form-group">
                <label class="form-label-custom">Nombre del Centro</label>
                <div class="input-group-custom">
                    <i class="fas fa-tag"></i>
                    <input
                        type="text"
                        name="nombre"
                        class="form-control-custom"
                        placeholder="Ej. Centro Madrid Norte"
                        required
                        value="{{ old('nombre') }}"
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Dirección</label>
                <div class="input-group-custom">
                    <i class="fas fa-map-marker-alt"></i>
                    <input
                        type="text"
                        name="direccion"
                        class="form-control-custom"
                        placeholder="C/ Ejemplo, 123"
                        required
                        value="{{ old('direccion') }}"
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Link Google Maps (Opcional)</label>
                <div class="input-group-custom">
                    <i class="fas fa-map"></i>
                    <input
                        type="text"
                        name="google_maps_link"
                        class="form-control-custom"
                        placeholder="https://maps.google.com/..."
                        value="{{ old('google_maps_link') }}"
                    >
                </div>
            </div>

            <button
                id="btnSubmitCrearCentro"
                type="submit"
                class="btn-facto"
            >
                Crear Centro
            </button>
        </form>
    </div>
</div>
