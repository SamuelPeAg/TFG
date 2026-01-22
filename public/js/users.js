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

const checkboxes = document.querySelectorAll('.user-check');
      const selectAll = document.getElementById('selectAll');
      const floatingBar = document.getElementById('floatingBar');
      const countSpan = document.getElementById('countSelected');
      
      const modalGrupo = document.getElementById('modalGrupo');
      const modalGestion = document.getElementById('modalGestionGrupos');
      const inputsContainer = document.getElementById('hiddenInputsContainer');

      function updateFloatingBar() {
          const selected = document.querySelectorAll('.user-check:checked');
          if(countSpan) countSpan.innerText = selected.length;
          
          if(selected.length >= 2) {
              if(floatingBar) floatingBar.classList.add('active');
          } else {
              if(floatingBar) floatingBar.classList.remove('active');
          }
      }

      checkboxes.forEach(cb => cb.addEventListener('change', updateFloatingBar));

      if(selectAll) {
          selectAll.addEventListener('change', function() {
              checkboxes.forEach(cb => cb.checked = this.checked);
              updateFloatingBar();
          });
      }

      function abrirModalGrupo() {
          if(!modalGrupo) return;
          inputsContainer.innerHTML = ''; 
          const selected = document.querySelectorAll('.user-check:checked');
          selected.forEach(cb => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'users[]'; 
              input.value = cb.value;
              inputsContainer.appendChild(input);
          });
          modalGrupo.style.display = 'flex';
      }

      function cerrarModalGrupo() {
          if(modalGrupo) modalGrupo.style.display = 'none';
      }

      function abrirModalGestionGrupos() {
          if(modalGestion) modalGestion.style.display = 'flex';
      }
      function cerrarModalGestionGrupos() {
          if(modalGestion) modalGestion.style.display = 'none';
      }

      const modalCrear = document.getElementById('modalCrearUsuario');
      const btnAbrirCrear = document.getElementById('toggleCrearUsuario');
      const btnCerrarCrear = document.getElementById('btnCerrarModalCrearUsuario');
      
      if(btnAbrirCrear) btnAbrirCrear.addEventListener('click', () => modalCrear.style.display = 'flex');
      if(btnCerrarCrear) btnCerrarCrear.addEventListener('click', () => modalCrear.style.display = 'none');

      const modalEditar = document.getElementById('modalEditarUsuario');
      const btnCerrarEditar = document.getElementById('btnCerrarModalEditarUsuario');
      
      document.addEventListener('click', function(e) {
          const btn = e.target.closest('.js-edit-user');
          if (btn) {
              const id = btn.dataset.id;
              document.getElementById('edit_name').value = btn.dataset.name;
              document.getElementById('edit_email').value = btn.dataset.email;
              document.getElementById('edit_iban').value = btn.dataset.iban || '';
              document.getElementById('edit_firma').value = btn.dataset.firma || '';
              
              const form = document.getElementById('formEditarUsuario');
              form.action = `/users/${id}`; 

              modalEditar.style.display = 'flex';
          }
      });

      if(btnCerrarEditar) btnCerrarEditar.addEventListener('click', () => modalEditar.style.display = 'none');
  