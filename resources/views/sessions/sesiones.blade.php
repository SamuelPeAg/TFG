<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sesiones - Factomove</title>

    {{-- CSS PRINCIPAL (Asegúrate de que este archivo exista o usa tus estilos globales) --}}
    {{-- <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}"> --}}
    
    {{-- FONTAWESOME --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    {{-- FLATPICKR CSS --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

    <style>
        /* =========================================
           1. ESTILOS GENERALES Y LAYOUT
           ========================================= */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            background-color: #f4f6f8;
            color: #333;
        }

        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }

        /* SIDEBAR (Estilos básicos para que se vea bien si no carga el CSS externo) */
        .sidebar {
            width: 250px;
            background-color: #1e1e2d; /* Color oscuro ejemplo */
            color: white;
            flex-shrink: 0;
        }
        .logo { padding: 20px; text-align: center; }
        .logo img { max-width: 50px; }
        .main-menu { display: flex; flex-direction: column; }
        .menu-item {
            padding: 15px 20px;
            color: #a2a3b7;
            text-decoration: none;
            transition: 0.3s;
            display: block;
        }
        .menu-item:hover, .menu-item.active {
            background-color: #1b1b28;
            color: #00897b;
            border-left: 3px solid #00897b;
        }

        /* CONTENIDO PRINCIPAL */
        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto;
        }

        .header-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .search-box {
            background: white;
            padding: 10px 15px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .search-box input {
            border: none;
            outline: none;
            margin-left: 10px;
            font-size: 14px;
        }

        /* =========================================
           2. ESTILOS DEL POPUP (MODAL)
           ========================================= */
        .modal-overlay {
            display: none; position: fixed; top: 0; left: 0;
            width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6);
            z-index: 9999; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.3s ease;
        }
        .modal-overlay.active { display: flex; opacity: 1; }

        .modal-box {
            background: white; padding: 30px; border-radius: 15px;
            width: 90%; max-width: 500px; /* Un poco más ancho para listas */
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            transform: scale(0.9); transition: transform 0.3s ease;
        }
        .modal-overlay.active .modal-box { transform: scale(1); }

        .modal-box h2 {
            color: #00897b; margin-bottom: 20px; font-size: 24px;
            border-bottom: 2px solid #e0f2f1; padding-bottom: 10px;
        }
        
        /* Contenedor scrolleable para las sesiones */
        .modal-details { 
            text-align: left; 
            margin-bottom: 20px;
            max-height: 400px; /* Limite de altura */
            overflow-y: auto;  /* Scroll si hay muchas sesiones */
            padding-right: 5px;
        }
        
        .sesion-card {
            background-color: #fafafa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #00897b;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .detail-item {
            display: flex; justify-content: space-between;
            padding: 5px 0; font-size: 15px;
        }
        
        .btn-close {
            background: #00897b; color: white; border: none;
            padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold;
        }
        .close-icon {
            position: absolute; top: 15px; right: 20px;
            font-size: 24px; cursor: pointer; color: #aaa;
        }

        /* =========================================
           3. ESTILOS CALENDARIO (WIDE CLEAN)
           ========================================= */
        .calendar-container {
            width: 100%;
            margin-top: 20px;
            background: white; /* Fondo blanco para resaltar */
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .flatpickr-calendar.inline {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
        }

        .flatpickr-day {
            height: 90px !important;
            line-height: 90px !important;
            font-size: 16px !important;
            border-radius: 10px !important;
            margin: 2px !important;
            width: 13.5% !important; /* Ajuste para espaciado */
        }

        .flatpickr-day.selected {
            background: #e0f2f1 !important;
            color: #00897b !important;
            border: 2px solid #00897b !important;
        }

        /* INDICADOR (PUNTO VERDE) */
        .event-dot {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background-color: #00897b;
            border-radius: 50%;
            display: block;
        }
        
        .flatpickr-day.tiene-sesion {
            font-weight: bold;
            background-color: #fafffe;
        }
    </style>
</head>
<body>

<div class="dashboard-container">

    {{-- SIDEBAR --}}
    <aside class="sidebar" style="display: flex; flex-direction: column; height: 100vh;">
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
        <div style="display: flex; align-items: center; justify-content: flex-end; padding: 0 20px; gap: 10px; margin-bottom: 15px;">
            <div style="display: flex; flex-direction: column; text-align: right; line-height: 1.3;">
                <span style="font-weight: 700; color: #ffffff; font-size: 14px;">{{ auth()->user()->name ?? 'Usuario' }}</span>
                <span style="font-size: 11px; color: #e0f2f1; opacity: 0.8;">Panel de Gestión</span>
            </div>
            <div style="width: 40px; height: 40px; background-color: #ffffff; color: #00897b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">
                {{ substr(auth()->user()->name ?? 'U', 0, 1) }}
            </div>
        </div>
        
        {{-- LOGOUT --}}
        <div class="utility-links" style="padding: 20px;">
            <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">@csrf</form>
            <a href="#" class="menu-item" onclick="event.preventDefault(); if(confirm('¿Cerrar sesión?')) { document.getElementById('logout-form').submit(); }">
                <i class="fa-solid fa-right-from-bracket"></i> SALIR
            </a>
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
                    <i class="fa-solid fa-magnifying-glass" style="color: #999;"></i>
                    <input type="text" id="search-user" placeholder="Escribe para buscar usuario...">
                </div>
            </div>
        </div>

        <div class="calendar-layout">
            <div class="calendar-panel">
                <div class="calendar-container">
                    <div id="user-calendar"></div>
                </div>
                <div id="calendar-summary" style="margin-top: 20px; text-align: center; color: #666;">
                    <p><i class="fa-solid fa-circle-info"></i> Busca un usuario y selecciona los días con punto (<span style="color:#00897b; font-size: 20px;">•</span>)</p>
                </div>
            </div>
        </div>
    </main>

</div>

{{-- POPUP (MODAL) ADAPTADO PARA LISTAS --}}
<div id="infoPopup" class="modal-overlay">
    <div class="modal-box">
        <span class="close-icon" onclick="cerrarPopup()">&times;</span>
        <h2 id="modal-fecha-titulo">Detalles del Día</h2>
        
        {{-- Aquí se inyectan las tarjetas de sesión dinámicamente --}}
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
            
            // Función para pintar los puntos en los días con datos
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                var fechaCelda = fp.formatDate(dayElem.dateObj, "Y-m-d");

                // Verificamos si hay datos en el array para esa fecha
                if (datosSesiones[fechaCelda] && datosSesiones[fechaCelda].length > 0) {
                    dayElem.classList.add('tiene-sesion');
                    // Inyectamos el punto verde
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
                    
                    console.log("Datos recibidos:", data); // Para depurar en consola
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
        document.getElementById('modal-fecha-titulo').textContent = "Sesiones: " + fecha;
        
        const contenedor = document.getElementById('lista-sesiones');
        contenedor.innerHTML = ''; // Limpiamos lo que hubiera antes

        // Recorremos la lista de sesiones y creamos una "tarjeta" por cada una
        listaDeSesiones.forEach(sesion => {
            
            let htmlSesion = `
                <div class="sesion-card">
                    <div class="detail-item">
                        <strong><i class="fa-solid fa-building"></i> Centro:</strong> 
                        <span>${sesion.centro}</span>
                    </div>
                    <div class="detail-item">
                        <strong><i class="fa-solid fa-dumbbell"></i> Clase:</strong> 
                        <span>${sesion.clase}</span>
                    </div>
                    <div class="detail-item">
                        <strong><i class="fa-solid fa-user-tie"></i> Entrenador:</strong> 
                        <span>${sesion.entrenador}</span>
                    </div>
                    <div class="detail-item">
                        <strong><i class="fa-regular fa-clock"></i> Hora:</strong> 
                        <span>${sesion.hora}</span>
                    </div>
                    <div class="detail-item" style="border-top: 1px dashed #ddd; margin-top:5px; padding-top:5px;">
                        <strong><i class="fa-solid fa-euro-sign"></i> Precio:</strong> 
                        <span style="color: #00897b; font-weight: 800;">${sesion.precio}</span>
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