document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // ELEMENTOS
  // =========================
  const btnAbrirCrear = document.getElementById('toggleCrearUsuario');
  const modalCrear = document.getElementById('modalCrearUsuario');
  const btnCerrarCrear = document.getElementById('btnCerrarModalCrearUsuario');

  const modalEditar = document.getElementById('modalEditarUsuario');
  const btnCerrarEditar = document.getElementById('btnCerrarModalEditarUsuario');
  const formEditar = document.getElementById('formEditarUsuario');

  const inputEditName = document.getElementById('edit_name');
  const inputEditEmail = document.getElementById('edit_email');
  const inputEditiban = document.getElementById('edit_iban');
  const inputEditFirma = document.getElementById('edit_firma');

  // =========================
  // HELPERS
  // =========================
  const openModal = (modal) => {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  };

  const closeAll = () => {
    closeModal(modalCrear);
    closeModal(modalEditar);
  };

  // =========================
  // MODAL CREAR
  // =========================
  if (btnAbrirCrear && modalCrear) {
    btnAbrirCrear.addEventListener('click', () => openModal(modalCrear));
  }

  if (btnCerrarCrear && modalCrear) {
    btnCerrarCrear.addEventListener('click', () => closeModal(modalCrear));
  }

  // =========================
  // MODAL EDITAR
  // =========================
  // Delegación: funciona aunque la tabla crezca
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-edit-user');
    if (!btn) return;

    // 1) Rellenar inputs
    const id = btn.dataset.id || '';
    const name = btn.dataset.name || '';
    const email = btn.dataset.email || '';
    const iban = btn.dataset.iban || '';
    const firma = btn.dataset.firma || '';

    if (inputEditName) inputEditName.value = name;
    if (inputEditEmail) inputEditEmail.value = email;
    if (inputEditiban) inputEditiban.value = iban;
    if (inputEditFirma) inputEditFirma.value = firma;

    // 2) Action del form
    // Opción A: base url en data-update-url-base. Ej: "/users/__ID__"
    if (formEditar) {
      const base = formEditar.dataset.updateUrlBase; // -> "/users/__ID__"
      if (base && id) {
        formEditar.action = base.replace('__ID__', id);
      } else {
        // Opción B (fallback): si tu ruta es /users/{id}
        // Ajusta si tu prefijo es distinto.
        formEditar.action = `/users/${id}`;
      }
    }

    // 3) Abrir modal
    openModal(modalEditar);
  });

  if (btnCerrarEditar && modalEditar) {
    btnCerrarEditar.addEventListener('click', () => closeModal(modalEditar));
  }

  // =========================
  // CERRAR CLICK FUERA (OVERLAY)
  // =========================
  [modalCrear, modalEditar].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // =========================
  // CERRAR CON ESC
  // =========================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // =========================
  // INICIAL: asegurar estado
  // =========================
  // (por si venían visibles)
  closeModal(modalCrear);
  closeModal(modalEditar);
});
