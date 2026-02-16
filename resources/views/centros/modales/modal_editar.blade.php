<div id="modalEditar" class="modal-overlay">
    <div class="modal-card">
        <button type="button" class="close-btn" id="btnCerrarModalEditar">&times;</button>

        <div class="modal-header-custom">
            <div class="logo-simulado">
                <i class="fas fa-edit"></i>
            </div>
            <h2>Editar Centro</h2>
            <p>Modifica los datos del centro selected.</p>
        </div>

        <form id="formEditarCentro" method="POST">
            @csrf
            @method('PUT')

            <input type="hidden" id="edit_id" name="id">

            <div class="form-group">
                <label class="form-label-custom">Nombre del Centro</label>
                <div class="input-group-custom">
                    <i class="fas fa-tag"></i>
                    <input
                        type="text"
                        id="edit_nombre"
                        name="nombre"
                        class="form-control-custom"
                        required
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Dirección</label>
                <div class="input-group-custom">
                    <i class="fas fa-map-marker-alt"></i>
                    <input
                        type="text"
                        id="edit_direccion"
                        name="direccion"
                        class="form-control-custom"
                        required
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label-custom">Link Google Maps</label>
                <div class="input-group-custom">
                    <i class="fas fa-map"></i>
                    <input
                        type="text"
                        id="edit_google_maps_link"
                        name="google_maps_link"
                        class="form-control-custom"
                    >
                </div>
            </div>

            <button
                type="submit"
                class="btn-facto"
            >
                Actualizar Centro
            </button>
        </form>
    </div>
</div>
