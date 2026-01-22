<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservar Sesión - Factomove</title>
    
    {{-- Estilos Globales (Tailwind) --}}
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    {{-- FullCalendar CSS --}}
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>

    <style>
        /* Personalización de colores de FullCalendar para coincidir con tu marca */
        :root {
            --brand-teal: #00897b; /* Ajusta a tu código exacto */
            --brand-coral: #ff7043; /* Ajusta a tu código exacto */
        }
        .fc-button-primary {
            background-color: var(--brand-teal) !important;
            border-color: var(--brand-teal) !important;
        }
        .fc-button-active {
            background-color: #00695c !important;
        }
        .fc-event {
            cursor: pointer;
            border: none;
        }
        /* Ocultar scrollbar feo en contenedor */
        .fc-scroller::-webkit-scrollbar {
            width: 8px;
        }
        .fc-scroller::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 4px;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">

    {{-- Header Simple con botón volver --}}
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="{{ route('welcome') }}" class="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition">
                <img src="{{ asset('img/logopng.png') }}" class="h-8 w-auto" alt="Logo">
                <span class="font-bold text-xl">Factomove</span>
            </a>
            <a href="{{ route('welcome') }}" class="text-sm font-medium text-gray-500 hover:text-teal-600">
                <i class="fa-solid fa-arrow-left mr-1"></i> Volver al inicio
            </a>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        
        {{-- Selector de Centro (Visible para cambiar rápidamente) --}}
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Calendario de Reservas</h1>
                <p class="text-gray-500 mt-1">
                    Viendo horarios para: 
                    <span class="font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                        {{ request('center', 'Todos los centros') }}
                    </span>
                </p>
            </div>

            {{-- Formulario para cambiar de centro sin volver atrás --}}
            <form action="{{ route('booking.view') }}" method="GET" class="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <select name="center" class="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer outline-none px-2" onchange="this.form.submit()">
                    <option value="AIRA" {{ request('center') == 'AIRA' ? 'selected' : '' }}>AIRA</option>
                    <option value="OPEN" {{ request('center') == 'OPEN' ? 'selected' : '' }}>OPEN</option>
                    <option value="VIRTUAL" {{ request('center') == 'VIRTUAL' ? 'selected' : '' }}>VIRTUAL</option>
                </select>
                <button type="submit" class="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition">
                    <i class="fa-solid fa-filter"></i>
                </button>
            </form>
        </div>

        {{-- CONTENEDOR DEL CALENDARIO --}}
        <div class="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100">
            <div id='calendar'></div>
        </div>

    </main>

    {{-- MODAL DE RESERVA (Oculto por defecto) --}}
    <div id="bookingModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all scale-100">
            <div class="flex justify-between items-center mb-4 border-b pb-3">
                <h3 class="text-xl font-bold text-gray-900">Confirmar Reserva</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-teal-50 p-4 rounded-lg border border-teal-100">
                    <p class="text-sm text-teal-800 font-bold uppercase mb-1" id="modalCenter">Centro</p>
                    <h4 class="text-lg font-bold text-gray-900" id="modalClassTitle">Nombre Clase</h4>
                    <p class="text-gray-600 flex items-center gap-2 mt-1">
                        <i class="fa-regular fa-clock"></i> <span id="modalTime">Hora</span>
                    </p>
                </div>
                
                <form id="reservationForm" method="POST" action="{{ route('Pagos.store') }}"> {{-- Asegúrate de tener esta ruta --}}
                    @csrf
                    <input type="hidden" name="class_id" id="modalClassId">
                    
                    <div class="text-sm text-gray-500 mb-4">
                        Al confirmar, se descontará una sesión de tu bono o se procederá al cobro.
                    </div>

                    <div class="flex gap-3">
                        <button type="button" onclick="closeModal()" class="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 py-3 bg-teal-600 rounded-lg font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-200 transition">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    {{-- SCRIPT DEL CALENDARIO --}}
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');
            var centerFilter = "{{ request('center') }}"; // Obtiene el centro de la URL

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'timeGridWeek', // Vista inicial: Semana con horas
                locale: 'es', // Español
                firstDay: 1, // Lunes primer día
                slotMinTime: "07:00:00", // Hora inicio calendario
                slotMaxTime: "22:00:00", // Hora fin calendario
                allDaySlot: false, // Quitar fila de "todo el día" si son clases por horas
                height: 'auto',
                
                // Botones del Header
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek' // Botones para cambiar Mes/Semana
                },
                buttonText: {
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana'
                },

                // OBTENER EVENTOS (Aquí conecta con tu Backend Laravel)
                // Debes crear una ruta que devuelva JSON filtrado por centro
                events: function(info, successCallback, failureCallback) {
                    // Simulación de datos (BORRA ESTO y usa fetch real)
                    // En tu backend deberías filtrar: WHERE center = centerFilter
                    
                    // EJEMPLO FETCH REAL:
                    /*
                    fetch(`/api/clases?start=${info.startStr}&end=${info.endStr}&center=${centerFilter}`)
                        .then(response => response.json())
                        .then(data => successCallback(data));
                    */

                    // DATOS DE EJEMPLO PARA QUE VEAS CÓMO QUEDA:
                    var events = [
                        {
                            id: '1',
                            title: 'Crossfit (AIRA)',
                            start: '2026-01-14T10:00:00',
                            end: '2026-01-14T11:00:00',
                            backgroundColor: '#00897b', // Color Teal
                            extendedProps: { center: 'AIRA' }
                        },
                        {
                            id: '2',
                            title: 'Yoga (OPEN)',
                            start: '2026-01-14T18:00:00',
                            end: '2026-01-14T19:00:00',
                            backgroundColor: '#ff7043', // Color Coral
                            extendedProps: { center: 'OPEN' }
                        }
                    ];
                    
                    // Filtro simple de JS (en producción hazlo en backend)
                    if(centerFilter) {
                        events = events.filter(e => e.extendedProps.center === centerFilter);
                    }
                    
                    successCallback(events);
                },

                // AL HACER CLIC EN UN EVENTO
                eventClick: function(info) {
                    openModal(info.event);
                }
            });

            calendar.render();
        });

        // Funciones del Modal
        function openModal(event) {
            document.getElementById('modalClassTitle').innerText = event.title;
            document.getElementById('modalTime').innerText = event.start.toLocaleString();
            document.getElementById('modalCenter').innerText = event.extendedProps.center || "{{ request('center') }}";
            document.getElementById('modalClassId').value = event.id;
            
            document.getElementById('bookingModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('bookingModal').classList.add('hidden');
        }
    </script>

</body>
</html>