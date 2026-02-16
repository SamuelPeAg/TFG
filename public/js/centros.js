document.addEventListener('DOMContentLoaded', function() {
    
    // --- CREATE MODAL ---
    const btnAbrirModal = document.getElementById('btnAbrirModal');
    const modalRegistro = document.getElementById('modalRegistro');
    const btnCerrarModal = document.getElementById('btnCerrarModal');

    if(btnAbrirModal && modalRegistro) {
        btnAbrirModal.addEventListener('click', () => {
            modalRegistro.style.display = 'flex';
        });
    }

    if(btnCerrarModal && modalRegistro) {
        btnCerrarModal.addEventListener('click', () => {
             modalRegistro.style.display = 'none';
        });
    }

    // --- EDIT MODAL ---
    const modalEditar = document.getElementById('modalEditar');
    const btnCerrarModalEditar = document.getElementById('btnCerrarModalEditar');

    if(btnCerrarModalEditar && modalEditar) {
        btnCerrarModalEditar.addEventListener('click', () => {
             modalEditar.style.display = 'none';
        });
    }

    window.abrirModalEditar = function(id, nombre, direccion, link) {
        if(!modalEditar) return;

        // Fill form
        document.getElementById('edit_id').value = id;
        document.getElementById('edit_nombre').value = nombre;
        document.getElementById('edit_direccion').value = direccion;
        document.getElementById('edit_google_maps_link').value = link || '';

        // Set action
        const form = document.getElementById('formEditarCentro');
        // Replace temp_id with actual ID
        const url = window.routes.update.replace('temp_id', id);
        form.action = url;

        modalEditar.style.display = 'flex';
    };


    // --- DELETE MODAL ---
    const modalEliminar = document.getElementById('modalEliminar');
    const btnCerrarModalEliminar = document.getElementById('btnCerrarModalEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');

    const closeModalDelete = () => {
        if(modalEliminar) modalEliminar.style.display = 'none';
    };

    if(btnCerrarModalEliminar) btnCerrarModalEliminar.addEventListener('click', closeModalDelete);
    if(btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', closeModalDelete);

    window.abrirModalEliminar = function(id, nombre) {
        if(!modalEliminar) return;

        document.getElementById('delete_nombre_centro').textContent = nombre;
        
        const form = document.getElementById('formEliminarCentro');
        const url = window.routes.destroy.replace('temp_id', id);
        form.action = url;

        modalEliminar.style.display = 'flex';
    };

    // Close on click outside
    window.addEventListener('click', function(e) {
        if (modalRegistro && e.target === modalRegistro) modalRegistro.style.display = 'none';
        if (modalEditar && e.target === modalEditar) modalEditar.style.display = 'none';
        if (modalEliminar && e.target === modalEliminar) modalEliminar.style.display = 'none';
    });

});
