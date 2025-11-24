document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicialización de Flatpickr (Selector de Fecha)
    const fechaInput = document.getElementById('input-fecha');

    if (fechaInput) {
        flatpickr(fechaInput, {
            mode: "multiple", // Permite seleccionar múltiples días
            dateFormat: "d/m/Y", // Formato de fecha (Día/Mes/Año)
            locale: "es", // Establece el idioma a español
            weekNumbers: true, // Muestra el número de semana

            // Configuración del idioma español (Flatpickr no lo tiene por defecto)
            locale: {
                weekdays: {
                    shorthand: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                    longhand: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                },
                months: {
                    shorthand: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                    longhand: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                },
                firstDayOfWeek: 1, // Lunes es el primer día
                rangeSeparator: " al ",
                time_24hr: true,
                ordinal: function() { return ""; },
            }
        });
    }

    // 2. Control del Panel Lateral del Formulario
    const openFormBtn = document.getElementById('open-form-sidebar');
    const closeFormBtn = document.getElementById('close-form-sidebar');
    const cancelFormBtn = document.getElementById('cancel-form-sidebar'); // Botón Cancelar del formulario
    const rightSidebar = document.getElementById('right-sidebar-form');
    let overlay = document.querySelector('.overlay'); // Intentar obtener el overlay si existe

    // Crear el overlay si no existe (lo mejor es que esté en el HTML)
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);
    }

    function openSidebar() {
        rightSidebar.classList.add('open');
        overlay.classList.add('visible');
    }

    function closeSidebar() {
        rightSidebar.classList.remove('open');
        overlay.classList.remove('visible');
    }

    if (openFormBtn) {
        openFormBtn.addEventListener('click', openSidebar);
    }
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', closeSidebar);
    }
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', closeSidebar);
    }
    // Cerrar sidebar al hacer clic en el overlay
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

const btnVerCalendario = document.getElementById('btn-ver-calendario');
    const inputFecha = document.getElementById('input-fecha'); // Asegúrate de que este ID existe en tu input

    if (btnVerCalendario) {
        btnVerCalendario.addEventListener('click', function() {
            // 1. Abrimos el sidebar primero (reutilizamos tu función)
            openSidebar();
            
            // 2. Esperamos un poquito (300ms) a que se deslice el sidebar y abrimos el calendario
            setTimeout(() => {
                if (inputFecha && inputFecha._flatpickr) {
                    inputFecha.focus(); // Ponemos el foco
                    inputFecha._flatpickr.open(); // Forzamos la apertura de Flatpickr
                } else {
                    alert("El calendario no se ha inicializado correctamente.");
                }
            }, 300);
        });
    }

// Cierre del DOMContentLoaded
});
    // 3. Función de Ejemplo para el Botón "GUARDAR SESIÓN"
   // 3. Función de Ejemplo para el Botón "GUARDAR SESIÓN"
const guardarBtn = document.querySelector('.action-group .primary-action');
if (guardarBtn) {
    guardarBtn.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        // --- RECOGEMOS LOS NUEVOS VALORES ---
        const nombreSesion = document.getElementById('input-nombre-sesion').value;
        const cliente = document.getElementById('input-cliente').value;
        const precio = document.getElementById('input-precio').value;
        // ------------------------------------
        const fechas = document.getElementById('input-fecha').value;
        const centro = document.getElementById('select-centro').value;

        if (!nombreSesion || !cliente || !precio || !fechas || !centro) {
            alert('¡Atención! Debes rellenar todos los campos: Nombre, Cliente, Precio, fecha(s) y Centro.');
            return;
        }

        console.log('--- Datos de la Sesión ---');
        console.log('Nombre:', nombreSesion);
        console.log('Cliente:', cliente);
        console.log('Precio:', precio + '€');
        console.log('Día(s) seleccionado(s):', fechas);
        console.log('Centro seleccionado:', centro);

        alert('Sesión(es) ' + nombreSesion + ' guardada(s) con éxito para el cliente ' + cliente);
    });
}

// El resto del código de inicialización de Flatpickr se mantiene igual.

