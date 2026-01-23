// Funciones para el modal de logout
function openLogoutModal() {
    document.getElementById('customLogoutModal').style.display = 'flex';
}

function closeLogoutModal() {
    document.getElementById('customLogoutModal').style.display = 'none';
}

// Cerrar modal al hacer click fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('customLogoutModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
