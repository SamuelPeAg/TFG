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
