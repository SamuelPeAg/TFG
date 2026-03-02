// Modal Salir Lógica
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del Modal
    const modalSalir = document.getElementById('modalSalir');
    const btnCancelar = document.getElementById('btnCancelarSalir');
    const btnConfirmar = document.getElementById('btnConfirmarSalir');

    // Elementos del Sidebar (Vienen del include)
    const btnSideLogout = document.getElementById('btnSideLogout');
    const logoutForm = document.getElementById('logout-form');

    // 1. ABRIR MODAL
    if (btnSideLogout) {
        btnSideLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if(modalSalir) modalSalir.classList.add('active');
        });
    }

    // 2. CERRAR MODAL
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            modalSalir.classList.remove('active');
        });
    }

    // 3. CONFIRMAR
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function() {
            if (logoutForm) logoutForm.submit();
        });
    }

    // 4. CLICK FUERA
    if(modalSalir){
        modalSalir.addEventListener('click', function(e) {
            if (e.target === modalSalir) {
                modalSalir.classList.remove('active');
            }
        });
    }
});
