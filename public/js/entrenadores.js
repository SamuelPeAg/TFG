document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalRegistro');
  const btnAbrir = document.getElementById('btnAbrirModal');
  const btnCerrar = document.getElementById('btnCerrarModal');

  if (btnAbrir) btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
  if (btnCerrar) btnCerrar.addEventListener('click', () => modal.style.display = 'none');

  const modalEdit = document.getElementById('modalEditar');
  const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
  const formEdit = document.getElementById('formEditar');

  window.abrirModalEditar = function (id, nombre, email, iban, isAdmin, foto) {
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_email').value = email;
    document.getElementById('edit_iban').value = iban;

    // Logic for delete photo option (New UI)
    const defaultIcon = document.getElementById('default_header_icon_trainer');
    const photoContainer = document.getElementById('photo_header_container_trainer');
    const photoImg = document.getElementById('modal_edit_photo_img_trainer');
    const deleteBtn = document.getElementById('btn_delete_photo_action_trainer');
    const deleteInput = document.getElementById('delete_profile_photo_input_trainer');

    // Reset state
    if (deleteInput) deleteInput.checked = false;

    if (foto && foto.trim() !== '') {
      // Show Photo
      if (defaultIcon) defaultIcon.style.display = 'none';
      if (photoContainer) photoContainer.style.display = 'block';
      if (photoImg) photoImg.src = `/storage/${foto}`;
    } else {
      // Show Icon
      if (defaultIcon) defaultIcon.style.display = 'flex';
      if (photoContainer) photoContainer.style.display = 'none';
    }

    // Handle Delete Button Click
    if (deleteBtn) {
      const newBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newBtn, deleteBtn);

      newBtn.addEventListener('click', () => {
        if (confirm('¿Quieres eliminar la foto de perfil?')) {
          // Mark for deletion
          if (deleteInput) deleteInput.checked = true;

          // Switch UI back to icon
          if (photoContainer) photoContainer.style.display = 'none';
          if (defaultIcon) defaultIcon.style.display = 'flex';
        }
      });
    }

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
