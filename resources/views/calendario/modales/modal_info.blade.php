<div id="infoPopup" class="modal-overlay" aria-hidden="true" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); z-index:1050; justify-content:center; align-items:center;">
    <div class="modal-box modal-expanded reveal shadow-2xl overflow-hidden" style="max-width:900px; width:95%; background:white; position:relative; border-radius:40px; border:none; padding:0;">
        
        <!-- Header Image/Color with Overlay Close -->
        <div id="modal-fecha-titulo" class="relative py-12 px-8 text-center text-white bg-slate-900 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-brandTeal/20 to-brandCoral/10"></div>
            <button type="button" class="close-icon absolute top-6 right-8 text-white/50 hover:text-white transition-colors duration-200" id="btnCerrarPopup">
                <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
            <div class="relative z-10">
                <h2 class="text-3xl font-black uppercase tracking-tighter">Detalles de la Sesión</h2>
            </div>
        </div>

        <!-- Content populated by JS -->
        <div id="lista-Pagos" class="modal-details min-h-[400px]"></div>

        <!-- Footer -->
        <div class="p-8 bg-slate-50 flex items-center justify-center">
            <button type="button" class="px-12 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-brandCoral transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95" id="btnCerrarPopup2">
                Cerrar Panel
            </button>
        </div>
    </div>
</div>
