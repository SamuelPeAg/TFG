  <div id="modalSeleccionClientes" class="modal-overlay" aria-hidden="true" style="z-index:10000;">
    <div class="modal-box" style="max-width:500px; padding:30px; height:80vh; display:flex; flex-direction:column;">
        <button type="button" class="close-icon btn-close-clients" style="position: absolute; top: 15px; right: 15px; background:none; border:none; font-size:24px; color:#9ca3af; cursor:pointer;">&times;</button>
        
        <h3 class="modern-title" style="font-size:1.4rem; margin-bottom:5px;">Seleccionar Clientes</h3>
        <p class="modern-subtitle" style="margin-bottom:20px;">Busca y marca los participantes</p>

        <div class="search-box" style="width:100%; margin-bottom:15px; border-radius:10px; background:#f9fafb;">
            <i class="fa-solid fa-search" style="color:#9ca3af;"></i>
            <div class="search-anchor">
                <input type="text" id="inputBuscarClientesModal" placeholder="Buscar por nombre..." style="background:transparent; border:none; outline:none; width:100%; font-size:14px;">
            </div>
        </div>

        <div id="listaClientesModal" style="flex:1; overflow-y:auto; padding-right:5px; display:flex; flex-direction:column; gap:8px;">
            <!-- JS Rendered -->
        </div>

        <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
             <button type="button" id="btnConfirmarClientes" class="btn-gradient">AÑADIR SELECCIONADOS</button>
        </div>
    </div>
  </div>
