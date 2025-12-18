@extends('components.headers.header_welcome')

@section('content')

    {{-- 1. ENCABEZADO DE LA PÁGINA (MODIFICADO) --}}
    {{-- He reducido el padding vertical (pt-10 pb-6) y añadido la sección de perfil --}}
    <section class="bg-brandTeal pt-10 pb-8 text-center text-white relative overflow-hidden shadow-md">
        <div class="absolute inset-0 opacity-10 pattern-dots"></div>
        
        {{-- SECCIÓN PERFIL DE USUARIO (ARRIBA DERECHA) --}}
        @auth
        <div class="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-3 z-20">
            {{-- Texto: Nombre y Rol --}}
            <div class="text-right hidden xs:block"> {{-- hidden en móviles muy pequeños si quieres --}}
                <h4 class="font-bold text-white text-base md:text-lg leading-tight shadow-sm drop-shadow-md">
                    {{ Auth::user()->name }}
                </h4>
                <p class="text-brandAqua/80 text-[10px] md:text-xs font-medium uppercase tracking-wider">
                    Panel de Gestión
                </p>
            </div>

            {{-- Avatar Circular --}}
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-200">
                <span class="text-brandTeal font-extrabold text-lg md:text-xl uppercase">
                    {{-- Obtenemos la primera letra del nombre --}}
                    {{ substr(Auth::user()->name, 0, 1) }}
                </span>
            </div>
        </div>
        @endauth

        {{-- TÍTULO Y SUBTÍTULO (MÁS PEQUEÑOS) --}}
        <div class="relative z-10 max-w-7xl mx-auto px-4 mt-8 md:mt-2"> 
            <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
                Reserva tu Sesión
            </h1>
            <p class="text-brandAqua/80 text-sm md:text-base max-w-2xl mx-auto">
                Selecciona un día en el calendario para ver las clases disponibles.
            </p>
        </div>
    </section>

    {{-- 2. CALENDARIO FUNCIONAL --}}
    <section class="py-8 md:py-12 bg-gray-50 min-h-screen">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {{-- Controles del Mes --}}
            <div class="flex justify-between items-center mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
                <button id="prevMonthBtn" class="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <h2 class="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <i class="fa-regular fa-calendar text-brandCoral"></i> 
                    <span id="currentMonthYear">Cargando...</span>
                </h2>
                <button id="nextMonthBtn" class="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {{-- Grid del Calendario --}}
            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                
                {{-- Días de la semana --}}
                <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    @foreach(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as $day)
                        <div class="py-3 text-center font-bold text-gray-500 text-xs md:text-sm uppercase tracking-wider">{{ $day }}</div>
                    @endforeach
                </div>

                {{-- Días del mes --}}
                <div id="calendarGrid" class="grid grid-cols-7 divide-x divide-y divide-gray-100">
                    {{-- Se rellena con JS --}}
                </div>
            </div>
        </div>
    </section>

    {{-- 3. MODAL (POPUP) --}}
    <div id="sessionModal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onclick="closeModal()"></div>

        <div class="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
            <div class="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
                
                <div class="bg-brandTeal px-4 py-4 sm:px-6 flex justify-between items-center">
                    <h3 class="text-lg leading-6 font-bold text-white flex items-center gap-2">
                        <i class="fa-regular fa-calendar-check"></i>
                        Sesiones para el <span id="modalDateText">--/--/----</span>
                    </h3>
                    <button type="button" onclick="closeModal()" class="text-brandAqua hover:text-white transition focus:outline-none">
                        <i class="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                <div class="px-4 py-5 sm:p-6 bg-gray-50 max-h-[70vh] overflow-y-auto space-y-4">
                    {{-- Ejemplo estático --}}
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div class="flex flex-col sm:flex-row justify-between gap-4">
                            <div class="flex items-start gap-4">
                                <div class="bg-gray-100 rounded-lg p-3 text-center min-w-[80px]">
                                    <span class="block text-gray-900 font-bold text-xl">09:00</span>
                                    <span class="block text-xs text-gray-500">60 min</span>
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-gray-900">Entrenamiento Funcional</h4>
                                    <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <i class="fa-solid fa-location-dot text-brandCoral"></i>
                                        <span>Sala Principal</span>
                                    </div>
                                </div>
                            </div>
                            <button class="w-full sm:w-auto bg-brandTeal text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition shadow-sm">
                                Reservar
                            </button>
                        </div>
                    </div>
                    
                    <p class="text-center text-gray-400 text-sm mt-4">No hay más sesiones programadas para este día.</p>
                </div>
            </div>
        </div>
    </div>

    {{-- LÓGICA JAVASCRIPT (Misma lógica, solo cambia el ID del contenedor del mes si lo cambiaste) --}}
    <script>
        const currentMonthYear = document.getElementById('currentMonthYear');
        const calendarGrid = document.getElementById('calendarGrid');
        const prevBtn = document.getElementById('prevMonthBtn');
        const nextBtn = document.getElementById('nextMonthBtn');

        let date = new Date();
        let currYear = date.getFullYear();
        let currMonth = date.getMonth();

        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        function renderCalendar() {
            let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(); 
            let lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(); 
            let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); 
            let liTag = "";

            for (let i = firstDayofMonth; i > 0; i--) { 
                liTag += `<div class="min-h-[100px] md:min-h-[120px] bg-gray-50/50 p-2 border-b border-r border-gray-100"></div>`;
            }

            for (let i = 1; i <= lastDateofMonth; i++) {
                let isToday = i === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear();
                let activeClass = isToday ? 'bg-brandTeal/5 border-2 border-brandTeal/30' : 'hover:bg-brandAqua/5';
                let numberClass = isToday ? 'bg-brandTeal text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700';

                let eventHtml = '';
                if(i % 3 === 0) { 
                     eventHtml = `<div class="space-y-1 mt-2"><div class="text-[10px] bg-brandTeal/10 text-brandTeal px-1 py-0.5 rounded border border-brandTeal/20 truncate font-medium">09:00 CrossFit</div></div>`;
                } else if (i % 5 === 0) {
                     eventHtml = `<div class="space-y-1 mt-2"><div class="text-[10px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded border border-purple-200 truncate font-medium">18:00 Yoga</div><div class="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded truncate hidden md:block">2 más...</div></div>`;
                }

                liTag += `<div onclick="openModal('${currYear}-${currMonth+1}-${i}')" class="min-h-[100px] md:min-h-[120px] p-2 cursor-pointer transition relative group border-gray-100 ${activeClass}">
                        <span class="font-bold block mb-1 ${numberClass}">${i}</span>
                        ${eventHtml}
                    </div>`;
            }
            currentMonthYear.innerText = `${months[currMonth]} ${currYear}`;
            calendarGrid.innerHTML = liTag;
        }

        prevBtn.addEventListener("click", () => {
            currMonth = currMonth - 1;
            if(currMonth < 0) {
                date = new Date(currYear, currMonth);
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date();
            }
            renderCalendar();
        });

        nextBtn.addEventListener("click", () => {
            currMonth = currMonth + 1;
            if(currMonth > 11) {
                date = new Date(currYear, currMonth);
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date();
            }
            renderCalendar();
        });

        renderCalendar();

        function openModal(dateString) {
            document.getElementById('modalDateText').innerText = dateString;
            document.getElementById('sessionModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('sessionModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        
        document.addEventListener('keydown', function(event) {
            if (event.key === "Escape") closeModal();
        });
    </script>

    <x-footers.footer_welcome />

@endsection