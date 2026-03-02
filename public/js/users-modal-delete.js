// Funciones para Modal de Eliminación de Usuarios
function abrirModalEliminarUsuario(id, nombre) {
    document.getElementById('nombreUsuarioEliminar').textContent = nombre;
    
    let urlBase = "{{ route('users.destroy', 'temp_id') }}";
    let urlFinal = urlBase.replace('temp_id', id);
    
    document.getElementById('formEliminarUsuario').action = urlFinal;
    document.getElementById('modalEliminarUsuario').style.display = 'flex';
}

function cerrarModalEliminarUsuario() {
    document.getElementById('modalEliminarUsuario').style.display = 'none';
}

// Cerrar modal al hacer click fuera
document.addEventListener('DOMContentLoaded', function() {
    const modalElement = document.getElementById('modalEliminarUsuario');
    if (modalElement) {
        modalElement.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalEliminarUsuario();
            }
        });
    }
});
