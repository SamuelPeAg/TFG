<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sesiones - Factomove</title>

    {{-- CSS PRINCIPAL --}}
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">
    
    {{-- FONTAWESOME --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    {{-- FLATPICKR CSS --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

    <style>
        /* =========================================
           1. ESTILOS DEL POPUP (MODAL)
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
            width: 90%; max-width: 450px; text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            transform: scale(0.9); transition: transform 0.3s ease;
        }
        .modal-overlay.active .modal-box { transform: scale(1); }

        .modal-box h2 {
            color: #00897b; margin-bottom: 20px; font-size: 24px;
            border-bottom: 2px solid #e0f2f1; padding-bottom: 10px;
        }
        .modal-details { text-align: left; margin-bottom: 20px; }
        .detail-item {
            display: flex; justify-content: space-between;
            padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 16px;
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
           2. ESTILO EXACTO DE TU IMAGEN (WIDE CLEAN)
           ========================================= */
        
        /* Contenedor principal del calendario: transparente para que parezca limpio */
        .calendar-container {
            width: 100%;
            margin-top: 20px;
            background: transparent; /* Transparente como en tu foto */
        }

        /* Forzar ancho completo y quitar bordes/sombras del plugin */
        .flatpickr-calendar.inline {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
        }

        .flatpickr-innerContainer, .flatpickr-rContainer, .flatpickr-days {
            width: 100% !important;
            overflow: visible !important;
        }

        .dayContainer {
            width: 100% !important;
            min-width: 100% !important;
            max-width: none !important;
            display: flex;
            justify-content: space-around;
            padding: 0 !important;
        }

        /* --- CABECERA (MES Y AÑO) --- */
        .flatpickr-months {
            position: relative !important;
            background: transparent !important;
            margin-bottom: 40px !important;
            height: 50px !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* El contenedor del texto Mes/Año centrado */
        .flatpickr-current-month {
            position: absolute !important;
            width: auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            padding: 0 !important;
            font-size: 1.5rem !important; /* Tamaño grande */
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* Texto del Mes y Año en NEGRO/GRIS (no azul) */
        .flatpickr-current-month span.cur-month {
            font-weight: normal !important;
            color: #333 !important;
            margin-right: 8px !important;
        }
        .flatpickr-current-month input.cur-year {
            font-weight: normal !important;
            color: #333 !important;
        }

        /* Flechas de navegación: A LOS EXTREMOS */
        .flatpickr-prev-month, .flatpickr-next-month {
            position: absolute !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            height: 40px !important;
            width: 40px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 10;
        }
        
        .flatpickr-prev-month { left: 0 !important; }
        .flatpickr-next-month { right: 0 !important; }

        .flatpickr-prev-month svg, .flatpickr-next-month svg {
            fill: #000 !important; /* Flechas negras */
            width: 16px;
            height: 16px;
        }
        .flatpickr-prev-month:hover svg, .flatpickr-next-month:hover svg {
            fill: #00897b !important;
        }

        /* --- DÍAS DE LA SEMANA (Mon, Tue...) --- */
        .flatpickr-weekdays {
            width: 100% !important;
            margin-bottom: 20px !important;
        }
        .flatpickr-weekday {
            font-size: 16px !important;
            color: #333 !important; /* Color oscuro */
            font-weight: normal !important;
            background: transparent !important;
            text-align: center !important;
        }

        /* --- DÍAS DEL MES (NÚMEROS) --- */
        .flatpickr-day {
            height: 90px !important;       /* Mucha altura vertical */
            line-height: 90px !important;  /* Centrado vertical */
            width: 14.28% !important;      /* 100 / 7 = 14.28% exacto */
            max-width: none !important;
            font-size: 16px !important;
            color: #333 !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;   /* Cuadrados o ligeramente redondeados si prefieres */
            background: transparent !important;
        }

        /* Efecto Hover */
        .flatpickr-day:hover {
            background: #f0f0f0 !important;
            border-radius: 10px !important;
        }

        /* Día seleccionado */
        .flatpickr-day.selected {
            background: transparent !important; /* En tu foto no parece tener fondo de color fuerte */
            color: #00897b !important;
            font-weight: bold !important;
            border: 1px solid #00897b !important; /* Solo un borde fino */
            border-radius: 10px !important;
        }
        
        /* Días de otros meses (gris claro) */
        .flatpickr-day.prevMonthDay, .flatpickr-day.nextMonthDay {
            color: #ccc !important;
        }
    </style>
</head>
<body>

<div class="dashboard-container">

    {{-- SIDEBAR --}}
    <aside class="sidebar" style="display: flex; flex-direction: column; height: 100vh;">
        <div class="logo">
            <img src="{{ asset('img/logopng.png') }}" alt="">
            <h2>Factomove</h2>
        </div>
        <nav class="main-menu">
            <a href="{{ route('entrenadores.index') }}" class="menu-item"><i class="fa-solid fa-dumbbell"></i> ENTRENADORES</a>
            <a href="{{ route('users.index') }}" class="menu-item"><i class="fa-solid fa-users"></i> USUARIOS</a>
            <a href="{{ route('sesiones') }}" class="menu-item active"><i class="fa-solid fa-calendar-check"></i> SESIONES</a>
            <a href="{{ route('facturas') }}" class="menu-item"><i class="fa-solid fa-file-invoice"></i> FACTURACIÓN</a>
        </nav>
        <div style="flex-grow: 1;"></div>
        <div style="display: flex; align-items: center; justify-content: flex-end; padding: 0 20px; gap: 10px; margin-bottom: 15px;">
            <div style="display: flex; flex-direction: column; text-align: right; line-height: 1.3;">
                <span style="font-weight: 700; color: #ffffff; font-size: 14px;"></span>
                <span style="font-size: 11px; color: #e0f2f1; opacity: 0.8;">Panel de Gestión</span>
            </div>
            <div style="width: 40px; height: 40px; background-color: #ffffff; color: #00897b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">
            </div>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.2); margin: 0 20px 20px 20px;">
        <div class="utility-links" style="margin-bottom: 20px;">
            <a href="#" class="menu-item"><i class="fa-solid fa-circle-question"></i> AYUDA</a>
            <form method="POST" action="{{ route('logout') }}" id="logout-form" style="display: none;">@csrf</form>
            <a href="#" class="menu-item" onclick="event.preventDefault(); if(confirm('¿Seguro que deseas cerrar sesión?')) { document.getElementById('logout-form').submit(); }">
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
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="search-user" placeholder="Buscar usuario...">
                </div>
            </div>
        </div>

        <div class="calendar-layout">
            <div class="calendar-panel" style="width: 100%;">
                <div class="calendar-container">
                    <div id="user-calendar"></div>
                </div>
                <div id="calendar-summary" class="calendar-summary" style="margin-top: 50px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); text-align: left;">
                    <p style="color: #666; font-size: 14px; margin: 0;">La información de la sesión seleccionada aparecerá aquí.</p>
                </div>
            </div>
        </div>
    </main>

</div>

{{-- POPUP --}}
<div id="infoPopup" class="modal-overlay">
    <div class="modal-box">
        <span class="close-icon" onclick="cerrarPopup()">&times;</span>
        <h2>Detalles de la Sesión</h2>
        <div class="modal-details">
            <div class="detail-item"><strong><i class="fa-solid fa-building"></i> Centro:</strong> <span id="pop-centro">--</span></div>
            <div class="detail-item"><strong><i class="fa-solid fa-dumbbell"></i> Clase:</strong> <span id="pop-clase">--</span></div>
            <div class="detail-item"><strong><i class="fa-solid fa-user-tie"></i> Entrenador:</strong> <span id="pop-entrenador">--</span></div>
            <div class="detail-item"><strong><i class="fa-regular fa-clock"></i> Fecha y Hora:</strong> <span id="pop-fecha-hora">--</span></div>
            <div class="detail-item"><strong><i class="fa-solid fa-euro-sign"></i> Precio:</strong> <span id="pop-precio" style="color: #00897b; font-weight: 800;">--</span></div>
        </div>
        <button class="btn-close" onclick="cerrarPopup()">Cerrar</button>
    </div>
</div>

{{-- JS --}}
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://npmcdn.com/flatpickr/dist/l10n/es.js"></script>
<script>
    // DATOS DE PRUEBA
    const datosSesiones = {
        '2025-12-18': { centro: 'Factomove Central', clase: 'Crossfit Avanzado', entrenador: 'Carlos Pérez', hora: '10:00 AM', precio: '15,00€' },
        '2025-12-20': { centro: 'Factomove Norte', clase: 'Yoga Flex', entrenador: 'Ana López', hora: '18:30 PM', precio: '12,00€' }
    };

    document.addEventListener('DOMContentLoaded', function() {
        flatpickr("#user-calendar", {
            inline: true,
            locale: "es",
            dateFormat: "Y-m-d",
            onReady: function(d, s, instance) {
                instance.calendarContainer.style.width = "100%"; 
            },
            onChange: function(selectedDates, dateStr, instance) {
                if (datosSesiones[dateStr]) {
                    mostrarPopup(datosSesiones[dateStr], dateStr);
                }
            }
        });
    });

    function mostrarPopup(datos, fecha) {
        document.getElementById('pop-centro').textContent = datos.centro;
        document.getElementById('pop-clase').textContent = datos.clase;
        document.getElementById('pop-entrenador').textContent = datos.entrenador;
        document.getElementById('pop-precio').textContent = datos.precio;
        document.getElementById('pop-fecha-hora').textContent = fecha + ' - ' + datos.hora;
        document.getElementById('infoPopup').classList.add('active');
    }

    function cerrarPopup() {
        document.getElementById('infoPopup').classList.remove('active');
    }

    window.onclick = function(event) {
        const modal = document.getElementById('infoPopup');
        if (event.target === modal) cerrarPopup();
    }
</script>

</body>
</html>