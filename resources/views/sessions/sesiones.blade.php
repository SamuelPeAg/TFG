<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sesiones - Factomove</title>

    {{-- FONTAWESOME --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    {{-- FLATPICKR CSS --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

    <style>
        /* =========================================
           1. ESTILOS GENERALES Y LAYOUT
           ========================================= */
        :root {
            --primary-color: #3c8d89; /* Color azulado del sidebar */
            --primary-dark: #327673;  /* Tono más oscuro para hover/active */
            --text-light: #e0f2f1;    /* Texto claro para el sidebar */
            --bg-light: #f4f6f8;      /* Fondo principal */
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            background-color: var(--bg-light);
            color: #333;
            height: 100vh; /* Asegura que el cuerpo ocupe toda la altura */
        }

        .dashboard-container {
            display: flex;
            height: 100vh; /* Ocupa toda la altura de la ventana */
            overflow: hidden; /* Evita scrolls dobles */
        }

        /* --- SIDEBAR AZULADO --- */
        .sidebar {
            width: 250px;
            background-color: var(--primary-color); /* Color principal */
            color: white;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }

        .logo {
            padding: 25px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .logo img { max-width: 60px; margin-bottom: 10px; }
        .logo h2 { margin: 0; font-size: 1.5rem; font-weight: 600; }

        .main-menu {
            display: flex;
            flex-direction: column;
            padding-top: 20px;
        }
        .menu-item {
            padding: 15px 25px;
            color: var(--text-light);
            text-decoration: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            font-weight: 500;
            border-left: 4px solid transparent; /* Borde invisible por defecto */
        }
        .menu-item i {
            margin-right: 15px;
            font-size: 1.1rem;
            width: 20px;
            text-align: center;
        }
        .menu-item:hover {
            background-color: var(--primary-dark);
            color: white;
        }
        .menu-item.active {
            background-color: var(--primary-dark);
            color: white;
            border-left-color: white; /* Borde blanco para el activo */
        }

        /* --- CONTENIDO PRINCIPAL --- */
        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto; /* Scroll solo en el contenido si es necesario */
            display: flex;
            flex-direction: column;
        }

        .header-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-shrink: 0; /* No encoger el header */
        }
        .title-section h1 { margin: 0; font-size: 1.8rem; color: #333; }

        .search-box {
            background: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        .search-box i { color: #999; }
        .search-box input {
            border: none;
            outline: none;
            margin-left: 10px;
            font-size: 14px;
            width: 200px;
        }

        /* =========================================
           2. ESTILOS DEL CALENDARIO (GRANDE Y CENTRADO)
           ========================================= */
        .calendar-layout {
            flex-grow: 1; /* Ocupa el espacio restante */
            display: flex;
            justify-content: center; /* Centrado horizontal */
            align-items: center;     /* Centrado vertical */
            padding: 20px;           /* Espacio alrededor */
        }

        .calendar-panel {
            width: 100%;
            max-width: 1200px; /* Ancho máximo para pantallas muy grandes */
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            height: 100%; /* Intenta ocupar toda la altura disponible */
            max-height: 800px; /* Altura máxima para no ser excesivo */
        }

        .calendar-container {
            flex-grow: 1; /* El calendario ocupa el espacio disponible en el panel */
            width: 100%;
            min-height: 500px; /* Altura mínima para que se vea grande */
        }

        /* --- FLATPICKR MODIFICADO --- */
        .flatpickr-calendar.inline {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
        }

        .flatpickr-months {
            margin-bottom: 20px !important;
        }
        .flatpickr-current-month {
            font-size: 1.5rem !important;
            padding-top: 0 !important;
        }
        .flatpickr-weekdays {
            margin-bottom: 10px !important;
        }
        .flatpickr-weekday {
            font-size: 1rem !important;
            color: #666 !important;
        }

        .flatpickr-innerContainer, .flatpickr-rContainer, .flatpickr-days {
            width: 100% !important;
            height: calc(100% - 80px) !important; /* Ajuste para la cabecera */
        }

        .dayContainer {
            width: 100% !important;
            min-width: 100% !important;
            max-width: none !important;
            height: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: space-around !important;
            align-content: stretch !important; /* Estira las filas para ocupar la altura */
        }

        .flatpickr-day {
            width: 14.28% !important; /* 100% / 7 días */
            height: auto !important;
            flex-grow: 1 !important; /* Crece para llenar la fila */
            margin: 2px !important;
            border-radius: 15px !important;
            border: none !important;
            font-size: 1.3rem !important; /* Números más grandes */
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: relative;
        }

        .flatpickr-day:hover {
            background: #f0f0f0 !important;
        }

        .flatpickr-day.selected {
            background: var(--primary-color) !important;
            color: white !important;
            border: none !important;
        }

        .flatpickr-day.today {
            border: 2px solid var(--primary-color) !important;
        }
        
        .flatpickr-day.prevMonthDay, .flatpickr-day.nextMonthDay {
            color: #ccc !important;
        }

        /* INDICADOR (PUNTO) */
        .event-dot {
            position: absolute;
            bottom: 15px; /* Un poco más arriba por el tamaño del día */
            left: 50%;
            transform: translateX(-50%);
            width: 10px; /* Punto más grande */
            height: 10px;
            background-color: var(--primary-color);
            border-radius: 50%;
            display: block;
            border: 2px solid white; /* Borde blanco para resaltar */
        }
        
        .flatpickr-day.tiene-sesion.selected .event-dot {
             background-color: white;
             border-color: var(--primary-color);
        }

        #calendar-summary p {
            font-size: 1.1rem;
            color: #666;
            margin-top: 20px;
        }

        /* =========================================
           3. ESTILOS DEL POPUP (MODAL)
           ========================================= */
        .modal-overlay {
            display: none; position: fixed; top: 0; left: 0;
            width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6);
            z-index: 9999; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.3s ease;
        }
        .modal-overlay.active { display: flex; opacity: 1; }

        .modal-box {
            background: white; padding: 30px; border-radius: 20px;
            width: 90%; max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transform: scale(0.95); transition: transform 0.3s ease;
        }
        .modal-overlay.active .modal-box { transform: scale(1); }

        .modal-box h2 {
            color: var(--primary-color); margin-bottom: 25px; font-size: 1.8rem;
            border-bottom: 2px solid #e0f2f1; padding-bottom: 15px;
        }
        
        .modal-details { 
            text-align: left; 
            margin-bottom: 25px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .sesion-card {
            background-color: #f9f9f9;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 5px solid var(--primary-color);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .detail-item {
            display: flex; justify-content: space-between;
            padding: 8px 0; font-size: 1rem;
            align-items: center;
        }
        .detail-item i {
            color: var(--primary-color);
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .btn-close {
            background: var(--primary-color); color: white; border: none;
            padding: 12px 35px; border-radius: 30px; cursor: pointer;
            font-weight: bold; font-size: 1rem;
            transition: background 0.3s ease;
        }
        .btn-close:hover { background: var(--primary-dark); }

        .close-icon {
            position: absolute; top: 20px; right: 25px;
            font-size: 28px; cursor: pointer; color: #aaa;
            transition: color 0.3s ease;
        }
        .close-icon:hover { color: #666; }
    </style>
</head>
<body>

<div class="dashboard-container">

    {{-- SIDEBAR AZULADO --}}
    <aside class="sidebar">
        <div class="logo">
            <img src="{{ asset('img/logopng.png') }}" alt="Logo">
            <h2>Factomove</h2>
        </div>
        <nav class="main-menu">
            <a href="{{ route('trainers.index') }}" class="menu-item"><i class="fa-solid fa-dumbbell"></i> ENTRENADORES</a>
            <a href="{{ route('users.index') }}" class="menu-item"><i class="fa-solid fa-users"></i> USUARIOS</a>
            <a href="{{ route('sesiones') }}" class="menu-item active"><i class="fa-solid fa-calendar-check"></i> SESIONES</a>
            <a href="{{ route('facturas') }}" class="menu-item"><i class="fa-solid fa-file-invoice"></i> FACTURACIÓN</a>
        </nav>
        
        {{-- FOOTER SIDEBAR --}}
        <div style="flex-grow: 1;"></div>
        <div style="padding: 20px; color: var(--text-light);">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-bottom: 20px;">
                <div style="text-align: right; line-height: 1.3;">
                    <span style="font-weight: 700; display: block; font-size: 1.1rem;">{{ auth()->user()->name ?? 'Usuario' }}</span>
                    <span style="font-size: 0.9rem; opacity: 0.8;">Panel de Gestión</span>
                </div>
                <div style="width: 45px; height: 45px; background-color: white; color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                    {{ substr(auth()->user()->name ?? 'U', 0, 1) }}
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin-bottom: 20px;">
            <div class="utility-links">
                <a href="#" class="menu-item"><i class="fa-solid fa-circle-question"></i> AYUDA</a>
                <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">@csrf</form>
                <a href="#" class="menu-item" onclick="event.preventDefault(); if(confirm('¿Cerrar sesión?')) { document.getElementById('logout-form').submit(); }">
                    <i class="fa-solid fa-right-from-bracket"></i> SALIR
                </a>
            </div>
        </div>
    </aside>

    {{-- CONTENIDO PRINCIPAL --}}
    <main class="main-content">
        <div class="header-controls">
            <div class="title-section">
                <h1>Historial de Sesiones</h1>
            </div>
            <div class="controls-bar">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="search-user" placeholder="Buscar usuario...">
                </div>
            </div>
        </div>

        <div class="calendar-layout">
            <div class="calendar-panel">
                <div class="calendar-container">
                    <div id="user-calendar"></div>
                </div>
                <div id="calendar-summary" style="text-align: center;">
                    <p><i class="fa-solid fa-circle-info"></i> Busca un usuario y selecciona los días con punto (<span style="color:var(--primary-color); font-size: 24px;">•</span>)</p>
                </div>
            </div>
        </div>
    </main>

</div>

{{-- POPUP (MODAL) --}}
<div id="infoPopup" class="modal-overlay">
    <div class="modal-box">
        <span class="close-icon" onclick="cerrarPopup()">&times;</span>
        <h2 id="modal-fecha-titulo">Detalles del Día</h2>
        
        <div id="lista-sesiones" class="modal-details">
            </div>

        <button class="btn-close" onclick="cerrarPopup()">Cerrar</button>
    </div>
</div>

{{-- SCRIPTS --}}
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://npmcdn.com/flatpickr/dist/l10n/es.js"></script>

<script>
    // ------------------------------------------------------------------
    // VARIABLES GLOBALES
    // ------------------------------------------------------------------
    let datosSesiones = {}; // Almacenará el JSON que viene de Laravel
    let calendario;         // Guardará la instancia del calendario

    // ------------------------------------------------------------------
    // INICIALIZACIÓN
    // ------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function() {
        
        // 1. Configurar Flatpickr (Calendario)
        calendario = flatpickr("#user-calendar", {
            inline: true,
            locale: "es",
            dateFormat: "Y-m-d",
            disableMobile: true, // Importante para ver los puntos
            
            onReady: function(d, s, instance) {
                // Forzar que el calendario ocupe el 100% del contenedor
                instance.calendarContainer.style.width = "100%";
                instance.calendarContainer.style.height = "100%";
            },

            // Función para pintar los puntos en los días con datos
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                var fechaCelda = fp.formatDate(dayElem.dateObj, "Y-m-d");

                // Verificamos si hay datos en el array para esa fecha
                if (datosSesiones[fechaCelda] && datosSesiones[fechaCelda].length > 0) {
                    dayElem.classList.add('tiene-sesion');
                    // Inyectamos el punto
                    dayElem.innerHTML += "<span class='event-dot'></span>";
                }
            },

            // Función al hacer click en un día
            onChange: function(selectedDates, dateStr, instance) {
                if (datosSesiones[dateStr]) {
                    // Pasamos la LISTA completa de sesiones al popup
                    mostrarPopup(datosSesiones[dateStr], dateStr);
                }
            }
        });

        // 2. Lógica del Buscador (AJAX)
        const inputBuscador = document.getElementById('search-user');
        
        inputBuscador.addEventListener('keyup', function(e) {
            let texto = e.target.value;

            // Esperar a que escriba al menos 2 letras
            if(texto.length >= 2) {
                // Hacemos la petición a tu ruta de Laravel
                fetch('/prueba-db?q=' + texto)
                .then(response => {
                    if (!response.ok) throw new Error("Error en la red");
                    return response.json();
                })
                .then(data => {
                    // Actualizamos los datos globales
                    datosSesiones = data;
                    
                    // Redibujamos el calendario para mostrar los nuevos puntos
                    calendario.redraw();
                })
                .catch(error => console.error('Error al buscar:', error));
            } else if (texto.length === 0) {
                // Si borra todo, limpiamos el calendario
                datosSesiones = {};
                calendario.redraw();
            }
        });
    });

    // ------------------------------------------------------------------
    // FUNCIONES DEL POPUP
    // ------------------------------------------------------------------
    function mostrarPopup(listaDeSesiones, fecha) {
        
        // Título del Modal
        // Formatear fecha para que se vea más bonita (ej: 15 de Enero, 2026)
        const fechaObj = new Date(fecha);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('modal-fecha-titulo').textContent = fechaObj.toLocaleDateString('es-ES', opciones);
        
        const contenedor = document.getElementById('lista-sesiones');
        contenedor.innerHTML = ''; // Limpiamos lo que hubiera antes

        // Recorremos la lista de sesiones y creamos una "tarjeta" por cada una
        listaDeSesiones.forEach(sesion => {
            
            let htmlSesion = `
                <div class="sesion-card">
                    <div class="detail-item">
                        <div><i class="fa-solid fa-building"></i> <strong>Centro:</strong></div>
                        <span>${sesion.centro}</span>
                    </div>
                    <div class="detail-item">
                        <div><i class="fa-solid fa-dumbbell"></i> <strong>Clase:</strong></div>
                        <span>${sesion.clase}</span>
                    </div>
                    <div class="detail-item">
                        <div><i class="fa-solid fa-user-tie"></i> <strong>Entrenador:</strong></div>
                        <span>${sesion.entrenador}</span>
                    </div>
                    <div class="detail-item">
                        <div><i class="fa-regular fa-clock"></i> <strong>Hora:</strong></div>
                        <span>${sesion.hora}</span>
                    </div>
                    <div class="detail-item" style="border-top: 1px dashed #ddd; margin-top:10px; padding-top:10px;">
                        <div><i class="fa-solid fa-euro-sign"></i> <strong>Precio:</strong></div>
                        <span style="color: var(--primary-color); font-weight: 800; font-size: 1.2rem;">${sesion.precio}</span>
                    </div>
                </div>
            `;
            
            contenedor.innerHTML += htmlSesion;
        });

        // Mostrar el modal
        document.getElementById('infoPopup').classList.add('active');
    }

    function cerrarPopup() {
        document.getElementById('infoPopup').classList.remove('active');
    }

    // Cerrar si se hace click fuera de la cajita blanca
    window.onclick = function(event) {
        const modal = document.getElementById('infoPopup');
        if (event.target === modal) cerrarPopup();
    }
</script>

</body>
</html>