document.addEventListener('DOMContentLoaded', () => {
  // ===== Modal CREAR =====
  const modalCrear = document.getElementById('modalRegistro');
  const btnAbrir = document.getElementById('btnAbrirModal');
  const btnCerrar = document.getElementById('btnCerrarModal');

  if (btnAbrir && modalCrear) {
    btnAbrir.addEventListener('click', () => {
      modalCrear.style.display = 'flex';
    });
  }

  if (btnCerrar && modalCrear) {
    btnCerrar.addEventListener('click', () => {
      modalCrear.style.display = 'none';
    });
  }

  // ===== Evitar doble submit en CREAR =====
  const formCrear = document.getElementById('formCrearEntrenador');
  const btnCrear = document.getElementById('btnSubmitCrearEntrenador');

  if (formCrear && btnCrear) {
    formCrear.addEventListener('submit', () => {
      btnCrear.disabled = true;
      btnCrear.style.opacity = '0.7';
      btnCrear.textContent = 'Creando...';
    });
  }

  // ===== Modal EDITAR =====
  const modalEdit = document.getElementById('modalEditar');
  const btnCerrarEdit = document.getElementById('btnCerrarModalEditar');
  const formEdit = document.getElementById('formEditar');

  // Función global para que el onclick del botón la encuentre
  window.abrirModalEditar = function (id, nombre, email, iban, isAdmin) {
    const inpNombre = document.getElementById('edit_nombre');
    const inpEmail = document.getElementById('edit_email');
    const inpIban = document.getElementById('edit_iban');

    if (inpNombre) inpNombre.value = nombre ?? '';
    if (inpEmail) inpEmail.value = email ?? '';
    if (inpIban) inpIban.value = iban ?? '';

    // La ruta final la montamos con data-url-template (lo ponemos en el blade)
    if (formEdit) {
      const template = formEdit.dataset.updateUrlTemplate; // ej: /entrenadores/__ID__
      if (template) formEdit.action = template.replace('__ID__', id);
    }

    const chk = document.getElementById('edit_make_admin');
    if (chk) chk.checked = (isAdmin == '1');

    if (modalEdit) modalEdit.style.display = 'flex';
  };

  if (btnCerrarEdit && modalEdit) {
    btnCerrarEdit.addEventListener('click', () => {
      modalEdit.style.display = 'none';
    });
  }
});
