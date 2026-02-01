document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalRegistro');
  const btnAbrir = document.getElementById('btnAbrirModal');
  const btnCerrar = document.getElementById('btnCerrarModal');

  if (btnAbrir) btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
  if (btnCerrar) btnCerrar.addEventListener('click', () => modal.style.display = 'none');

  const modalEdit = document.getElementById('modalEditar');
  const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
  const formEdit = document.getElementById('formEditar');

  window.abrirModalEditar = function (id, nombre, email, iban, isAdmin) {
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_email').value = email;
    document.getElementById('edit_iban').value = iban;

    // Use the base URL defined in the view
    if (window.routes && window.routes.update) {
      let urlFinal = window.routes.update.replace('temp_id', id);
      formEdit.action = urlFinal;
    }

    if (document.getElementById('edit_make_admin')) {
      document.getElementById('edit_make_admin').checked = (isAdmin == '1');
    }

    modalEdit.style.display = 'flex';
  }

  if (btnCerrarEdit) btnCerrarEdit.addEventListener('click', () => modalEdit.style.display = 'none');

  // Funciones para modal de eliminación
  window.abrirModalEliminar = function (id, nombre) {
    document.getElementById('nombreEntrenadorEliminar').textContent = nombre;

    if (window.routes && window.routes.destroy) {
      let urlFinal = window.routes.destroy.replace('temp_id', id);
      document.getElementById('formEliminar').action = urlFinal;
    }

    document.getElementById('modalEliminar').style.display = 'flex';
  }

  window.cerrarModalEliminar = function () {
    document.getElementById('modalEliminar').style.display = 'none';
  }

  // Cerrar modal al hacer click fuera
  document.getElementById('modalEliminar')?.addEventListener('click', function (e) {
    if (e.target === this) {
      cerrarModalEliminar();
    }
  });
});
