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

  window.abrirModalEditar = function (id, nombre, email, iban, isAdmin, dni, telefono, direccion, fecha_nacimiento) {
    if (document.getElementById('edit_nombre')) document.getElementById('edit_nombre').value = nombre;
    if (document.getElementById('edit_email')) document.getElementById('edit_email').value = email;
    if (document.getElementById('edit_iban')) document.getElementById('edit_iban').value = iban;
    if (document.getElementById('edit_dni')) document.getElementById('edit_dni').value = dni || '';
    if (document.getElementById('edit_telefono')) document.getElementById('edit_telefono').value = telefono || '';
    if (document.getElementById('edit_direccion')) document.getElementById('edit_direccion').value = direccion || '';
    if (document.getElementById('edit_fecha_nacimiento')) document.getElementById('edit_fecha_nacimiento').value = fecha_nacimiento || '';

    if (formEdit) {
      // En este caso, el index.blade.php usaba PHP para generar la ruta
      // pero podemos pasarla o generarla. Como es una ruta nombrada en PHP:
      // formEdit.action = `/entrenadores/${id}`;
      // Para ser más seguros con las rutas de Laravel, solemos inyectar un template.
      // Pero el usuario ya tenía una lógica de reemplazo en el index.
      const urlBase = "/entrenadores/temp_id"; // Ajustar si es diferente
      formEdit.action = urlBase.replace('temp_id', id);
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

  // ===== Modal ELIMINAR =====
  window.abrirModalEliminar = function (id, nombre) {
    const spanNombre = document.getElementById('nombreEntrenadorEliminar');
    if (spanNombre) spanNombre.textContent = nombre;

    const formEliminar = document.getElementById('formEliminar');
    if (formEliminar) {
      const urlBase = "/entrenadores/temp_id";
      formEliminar.action = urlBase.replace('temp_id', id);
    }

    const modalEliminar = document.getElementById('modalEliminar');
    if (modalEliminar) modalEliminar.style.display = 'flex';
  };

  window.cerrarModalEliminar = function () {
    const modalEliminar = document.getElementById('modalEliminar');
    if (modalEliminar) modalEliminar.style.display = 'none';
  };

  // ===== Modal PERFIL =====
  window.abrirModalPerfil = function (id, nombre, email, dni, telefono, direccion, fecha_nacimiento, foto, iban) {
    if (document.getElementById('perfil_nombre')) document.getElementById('perfil_nombre').textContent = nombre;
    if (document.getElementById('perfil_email')) document.getElementById('perfil_email').textContent = email;
    if (document.getElementById('perfil_dni')) document.getElementById('perfil_dni').textContent = dni || '-';
    if (document.getElementById('perfil_telefono')) document.getElementById('perfil_telefono').textContent = telefono || '-';
    if (document.getElementById('perfil_direccion')) document.getElementById('perfil_direccion').textContent = direccion || '-';
    if (document.getElementById('perfil_fecha_nacimiento')) document.getElementById('perfil_fecha_nacimiento').textContent = fecha_nacimiento || '-';
    if (document.getElementById('perfil_iban')) document.getElementById('perfil_iban').textContent = iban || '-';

    const visual = document.getElementById('perfil_visual');
    if (visual) {
      if (foto && foto !== '') {
        visual.innerHTML = `<img src="${foto}" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        const initialText = nombre ? nombre.trim().charAt(0).toUpperCase() : '?';
        visual.innerHTML = `<span style="font-size: 70px; font-weight: 900; color: #ffffff !important; display: block; line-height: 1; margin: 0; padding: 0;">${initialText}</span>`;
      }
    }

    const modalPerfil = document.getElementById('modalPerfil');
    if (modalPerfil) modalPerfil.style.display = 'flex';
  };

  window.cerrarModalPerfil = function () {
    const modalPerfil = document.getElementById('modalPerfil');
    if (modalPerfil) modalPerfil.style.display = 'none';
  };

  const modalPerfil = document.getElementById('modalPerfil');
  if (modalPerfil) {
    modalPerfil.addEventListener('click', function (e) {
      if (e.target === this) window.cerrarModalPerfil();
    });
  }
});
