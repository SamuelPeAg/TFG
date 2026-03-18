@extends('layouts.client')

@section('title', 'Panel de Cliente')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 reveal">
    
    <!-- Premium Welcome Header -->
    <div class="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 md:p-12 mb-12 shadow-2xl shadow-slate-900/20">
        <div class="absolute top-0 right-0 w-64 h-64 bg-brandTeal/20 blur-[100px] -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-brandCoral/10 blur-[100px] -ml-32 -mb-32"></div>
        
        <div class="relative flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-brandTeal to-emerald-400 flex items-center justify-center text-white shadow-lg rotate-3">
                    <i class="fa-solid fa-bolt-lightning text-3xl"></i>
                </div>
                <div>
                    <h1 class="text-3xl md:text-4xl font-black text-white mb-2">¡Bienvenido, {{ $user->name }}!</h1>
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Tu progreso te espera hoy</p>
                    </div>
                </div>
            </div>
            
            <!-- Credits Badge -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-6 min-w-[280px]">
                <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <i class="fa-solid fa-ticket text-brandTeal text-xl"></i>
                </div>
                <div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tu Saldo Actual</div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-4xl font-black text-white tracking-tighter">{{ $totalCreditos }}</span>
                        <span class="text-slate-500 text-sm font-bold uppercase">Créditos</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Alert Messages -->
    @if(session('success'))
        <div class="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-3xl mb-8 border border-emerald-100 shadow-sm animate-bounce-short">
            <i class="fa-solid fa-circle-check text-xl"></i>
            <span class="font-bold">{{ session('success') }}</span>
        </div>
    @endif

    <!-- Control Bar -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
        <!-- View Toggle & Quick Filter -->
        <div class="flex flex-wrap items-center gap-4">
            <div class="bg-slate-100 p-1.5 rounded-2xl flex shadow-inner">
                <button id="btn-view-grid" class="flex items-center gap-2 px-6 py-2.5 bg-white shadow-sm text-brandTeal text-xs font-black rounded-xl transition-all">
                    <i class="fa-solid fa-grip-vertical"></i>
                    <span>LISTA</span>
                </button>
                <button id="btn-view-calendar" class="flex items-center gap-2 px-6 py-2.5 text-slate-500 text-xs font-extrabold rounded-xl transition-all hover:text-brandTeal">
                    <i class="fa-solid fa-calendar-days"></i>
                    <span>CALENDARIO</span>
                </button>
            </div>

            <button id="btn-show-my-bookings" class="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 hover:border-brandTeal hover:bg-white transition-all rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest shadow-sm">
                <i class="fa-solid fa-bookmark"></i>
                <span>Mis Reservas</span>
            </button>
        </div>

        <!-- Dynamic Filters -->
        <div class="flex flex-wrap items-center gap-6 bg-white p-3 px-6 rounded-3xl border border-slate-100 shadow-sm">
            <div class="flex items-center gap-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar:</label>
                <select id="dashboard-filter-type" class="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brandTeal transition-all text-slate-700">
                    <option value="all">Todas</option>
                    <option value="ep">Personal</option>
                    <option value="duo">Dúo / Trío</option>
                    <option value="grupo">Grupos</option>
                </select>
            </div>
            <div class="h-6 w-px bg-slate-100"></div>
            <div class="flex items-center gap-3">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compatibles</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="dashboard-filter-compatible" class="sr-only peer">
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandTeal"></div>
                </label>
            </div>
        </div>
    </div>

    <!-- MAIN CONTENT AREA -->
    <div id="grid-container" class="space-y-16 reveal">
        @forelse($clasesAgrupadas as $fecha => $clases)
            @php
                $carbonFecha = \Carbon\Carbon::parse($fecha);
                $esHoy = $carbonFecha->isToday();
            @endphp
            
            <section class="day-section" data-date="{{ $fecha }}">
                <div class="flex items-baseline gap-4 mb-8">
                    <h2 class="text-3xl font-black text-slate-900 capitalize">{{ $carbonFecha->translatedFormat('l, d') }}</h2>
                    <span class="text-sm font-black text-brandTeal uppercase tracking-widest">{{ $carbonFecha->translatedFormat('F') }}</span>
                    @if($esHoy)
                        <span class="px-3 py-1 bg-emerald-400 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm shadow-emerald-400/20">Hoy</span>
                    @endif
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    @foreach($clases as $clase)
                        <article class="clase-card-wrapper group relative bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 {{ $clase->ya_reservada ? 'ring-4 ring-brandTeal/20 border-brandTeal/30' : '' }}"
                                 data-tipo="{{ strtolower($clase->tipo) }}"
                                 data-compatible="{{ $clase->tiene_credito ? 'true' : 'false' }}"
                                 data-reservada="{{ $clase->ya_reservada ? 'true' : 'false' }}">
                            
                            @if($clase->ya_reservada)
                                <div class="absolute -top-3 -right-3 w-10 h-10 bg-brandTeal text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                                    <i class="fa-solid fa-check text-xl"></i>
                                </div>
                            @endif

                            <div class="flex justify-between items-start mb-6">
                                <div class="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {{ $clase->tipo }}
                                </div>
                                <div class="flex flex-col items-end">
                                    <span class="text-2xl font-black text-slate-900 leading-none tracking-tighter">{{ $clase->fecha_hora->format('H:i') }}</span>
                                    <span class="text-[10px] font-bold text-brandCoral uppercase mt-1">60 MIN</span>
                                </div>
                            </div>

                            <h3 class="text-2xl font-black text-slate-800 mb-6 leading-tight group-hover:text-brandTeal transition-colors">{{ $clase->nombre }}</h3>

                            <!-- Trainer Card -->
                            <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100/50 transition-colors group-hover:bg-brandTeal/5">
                                <div class="h-14 w-14 rounded-2xl bg-white p-0.5 shadow-sm overflow-hidden">
                                     @if($clase->entrenador_foto)
                                        <img src="{{ $clase->entrenador_foto }}" class="h-full w-full object-cover rounded-[14px]">
                                    @else
                                        <div class="h-full w-full rounded-[14px] bg-brandTeal flex items-center justify-center text-white font-black">
                                            {{ $clase->entrenador_inicial }}
                                        </div>
                                    @endif
                                </div>
                                <div>
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-0.5">Entrenador</span>
                                    <span class="text-sm font-black text-slate-700">{{ $clase->entrenador_nombre }}</span>
                                </div>
                            </div>

                            <!-- Info Grid -->
                            <div class="grid grid-cols-2 gap-4 mb-8">
                                <div class="flex flex-col">
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ubicación</span>
                                    <div class="flex items-center gap-2 text-slate-700">
                                        <i class="fa-solid fa-location-dot text-brandTeal text-xs"></i>
                                        <span class="text-xs font-black">{{ $clase->centro }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Disponibilidad</span>
                                    <div class="flex items-center gap-2">
                                        @php 
                                            $disponibles = $clase->capacidad - $clase->ocupacion;
                                            $colorCupos = $disponibles <= 1 ? 'text-rose-500' : ($disponibles <= 3 ? 'text-amber-500' : 'text-emerald-500');
                                        @endphp
                                        <i class="fa-solid fa-users {{ $colorCupos }} text-xs"></i>
                                        <span class="text-xs font-black {{ $colorCupos }}">{{ $disponibles }} plazas</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer: Avatars & Action -->
                            <div class="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-slate-50">
                                <div class="flex -space-x-3">
                                    @foreach(collect($clase->alumnos)->take(5) as $alumno)
                                        <div class="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden shadow-sm" title="{{ $alumno->nombre }}">
                                            @if($alumno->foto)
                                                <img src="{{ $alumno->foto }}" class="h-full w-full object-cover">
                                            @else
                                                <div class="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">{{ $alumno->inicial }}</div>
                                            @endif
                                        </div>
                                    @endforeach
                                    @if(count($clase->alumnos) > 5)
                                        <div class="w-8 h-8 rounded-full ring-2 ring-white bg-slate-800 text-white flex items-center justify-center text-[9px] font-black">+{{ count($clase->alumnos) - 5 }}</div>
                                    @endif
                                </div>

                                @if($clase->ya_reservada)
                                    <form action="{{ route('cliente.abandonar') }}" method="POST" onsubmit="confirmarAbandono(event, '{{ $clase->nombre }}')">
                                        @csrf
                                        <input type="hidden" name="pago_id" value="{{ $clase->id_pago }}">
                                        <button type="submit" class="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-700 transition-colors py-2">
                                            Cancelar Clase
                                        </button>
                                    </form>
                                @elseif($clase->ocupacion >= $clase->capacidad)
                                    <span class="text-slate-300 text-[10px] font-black uppercase tracking-widest">Agotado</span>
                                @elseif($clase->tiene_credito)
                                     <form action="{{ route('cliente.reservar') }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="fecha_hora" value="{{ $clase->fecha_hora->format('Y-m-d H:i:s') }}">
                                        <input type="hidden" name="nombre_clase" value="{{ $clase->nombre }}">
                                        <input type="hidden" name="centro" value="{{ $clase->centro }}">
                                        <button type="submit" class="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brandTeal shadow-lg shadow-slate-900/10 transition-all hover:scale-105 active:scale-95">
                                            Reservar
                                        </button>
                                    </form>
                                @else
                                    <span class="text-rose-400 text-[9px] font-black uppercase tracking-tighter text-right leading-tight">Créditos insuficientes</span>
                                @endif
                            </div>
                        </article>
                    @endforeach
                </div>
            </section>
        @empty
            <div class="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
                <div class="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <i class="fa-solid fa-calendar-day text-4xl text-slate-300"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-4">¡Todo despejado por aquí!</h3>
                <p class="text-slate-500 font-bold max-w-sm mx-auto">Parece que no hay clases programadas para estas fechas. Vuelve más tarde o consulta con tu centro.</p>
            </div>
        @endforelse
    </div>

    <!-- CALENDAR VIEW CONTAINER -->
    <div id="calendar-container" class="hidden animate-fade-in-up">
        <div class="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-50">
            <div id='calendar-client' class="min-h-[700px]"></div>
        </div>
    </div>
</div>

<style>
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-bounce-short { animation: bounce 1s ease-in-out 1; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    /* FullCalendar Premium Styles */
    .fc { --fc-border-color: #f1f5f9; font-family: 'Inter', sans-serif; border: none !important; }
    .fc-header-toolbar { margin-bottom: 3rem !important; }
    .fc-toolbar-title { font-size: 2rem !important; font-weight: 900 !important; color: #0f172a; letter-spacing: -0.03em; }
    .fc-button { background: #fff !important; border: 1px solid #e2e8f0 !important; color: #475569 !important; font-weight: 800 !important; text-transform: uppercase !important; font-size: 0.7rem !important; padding: 0.8rem 1.4rem !important; border-radius: 16px !important; transition: all 0.2s !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important; }
    .fc-button:hover { background: #f8fafc !important; color: #1e293b !important; transform: translateY(-1px); }
    .fc-button-primary:not(:disabled).fc-button-active { background: #0f172a !important; color: #fff !important; border-color: #0f172a !important; }
    .fc-daygrid-day-top { flex-direction: row-reverse !important; padding: 8px !important; }
    .fc-col-header-cell { background: #f8fafc; padding: 1.5rem 0 !important; border: none !important; border-bottom: 2px solid #f1f5f9 !important; }
    .fc-col-header-cell-cushion { color: #94a3b8; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
    .fc-v-event { border-radius: 12px; border: none; padding: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .fc-event-main { padding: 4px; }
    .fc-event-title { font-weight: 900; font-size: 0.85rem; }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // COMMON ELEMENTS
        const filterType = document.getElementById('dashboard-filter-type');
        const filterCompatible = document.getElementById('dashboard-filter-compatible');
        const btnMyBookings = document.getElementById('btn-show-my-bookings');
        const countSpan = document.getElementById('visible-count');
        
        const gridContainer = document.getElementById('grid-container');
        const calendarContainer = document.getElementById('calendar-container');
        const btnGrid = document.getElementById('btn-view-grid');
        const btnCalendar = document.getElementById('btn-view-calendar');

        let showingOnlyMyBookings = false;
        let calendar = null;

        // --- GRID LOGIC ---
        function applyGridFilters() {
            if (gridContainer.classList.contains('hidden')) return;

            const selectedType = filterType.value;
            const onlyCompatible = filterCompatible.checked;
            let total = 0;

            document.querySelectorAll('.day-section').forEach(day => {
                let dayMatches = 0;
                day.querySelectorAll('.clase-card-wrapper').forEach(card => {
                    const type = card.dataset.tipo;
                    const compatible = card.dataset.compatible === 'true';
                    const reserved = card.dataset.reservada === 'true';

                    const typeMatch = (selectedType === 'all' || type.includes(selectedType));
                    const compMatch = (!onlyCompatible || compatible);
                    const bookMatch = (!showingOnlyMyBookings || reserved);

                    if (typeMatch && compMatch && bookMatch) {
                        card.style.display = 'flex';
                        dayMatches++;
                        total++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                day.style.display = dayMatches === 0 ? 'none' : 'block';
            });
            if (countSpan) countSpan.innerText = total;
        }

        // --- TOGGLE VIEW ---
        function setView(view) {
            if (view === 'grid') {
                gridContainer.classList.remove('hidden');
                calendarContainer.classList.add('hidden');
                btnGrid.classList.add('bg-white', 'shadow-sm', 'text-brandTeal');
                btnGrid.classList.remove('text-slate-500');
                btnCalendar.classList.remove('bg-white', 'shadow-sm', 'text-brandTeal');
                btnCalendar.classList.add('text-slate-500');
                applyGridFilters();
            } else {
                gridContainer.classList.add('hidden');
                calendarContainer.classList.remove('hidden');
                btnCalendar.classList.add('bg-white', 'shadow-sm', 'text-brandTeal');
                btnCalendar.classList.remove('text-slate-500');
                btnGrid.classList.remove('bg-white', 'shadow-sm', 'text-brandTeal');
                btnGrid.classList.add('text-slate-500');
                if (!calendar) initCalendar();
                else { calendar.render(); calendar.refetchEvents(); }
            }
        }

        btnGrid.addEventListener('click', () => setView('grid'));
        btnCalendar.addEventListener('click', () => setView('calendar'));

        // --- CALENDAR LOGIC ---
        function initCalendar() {
            const calendarEl = document.getElementById('calendar-client');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: window.innerWidth < 1024 ? 'listWeek' : 'timeGridWeek',
                locale: 'es',
                firstDay: 1,
                allDaySlot: false,
                slotMinTime: '07:00:00',
                slotMaxTime: '22:00:00',
                nowIndicator: true,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay,listWeek'
                },
                events: function(info, successCallback, failureCallback) {
                    const url = new URL('{{ route("cliente.api.clases") }}');
                    url.searchParams.append('start', info.startStr);
                    url.searchParams.append('end', info.endStr);
                    url.searchParams.append('tipo', filterType.value);
                    url.searchParams.append('compatible_only', filterCompatible.checked);
                    fetch(url).then(r => r.json()).then(d => successCallback(d)).catch(e => failureCallback(e));
                },
                eventClick: (info) => showSessionDetails(info.event),
                height: 'auto'
            });
            calendar.render();
        }

        // --- FILTERS ---
        filterType.addEventListener('change', () => { applyGridFilters(); if(calendar) calendar.refetchEvents(); });
        filterCompatible.addEventListener('change', () => { applyGridFilters(); if(calendar) calendar.refetchEvents(); });
        btnMyBookings.addEventListener('click', () => {
             showingOnlyMyBookings = !showingOnlyMyBookings;
             btnMyBookings.classList.toggle('ring-2', showingOnlyMyBookings);
             btnMyBookings.classList.toggle('ring-brandTeal', showingOnlyMyBookings);
             applyGridFilters();
        });

        applyGridFilters();
    });

    // --- GLOBAL ACTIONS ---
    function showSessionDetails(event) {
        const p = event.extendedProps;
        const html = `
            <div class="text-left space-y-8 py-4">
                <div class="flex items-center gap-6 p-6 bg-slate-900 rounded-[32px] shadow-xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brandTeal/10 blur-3xl"></div>
                    <div class="h-20 w-20 rounded-2xl bg-white p-0.5 shadow-md flex-shrink-0">
                         ${p.entrenador_foto ? `<img src="${p.entrenador_foto}" class="h-full w-full object-cover rounded-[14px]">` : `<div class="w-full h-full rounded-[14px] bg-brandTeal flex items-center justify-center text-white font-black text-2xl">${p.entrenador[0]}</div>`}
                    </div>
                    <div>
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Entrenador Principal</span>
                        <h4 class="text-2xl font-black text-white leading-tight">${p.entrenador}</h4>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ubicación</span>
                        <p class="text-slate-800 font-black text-sm">${p.centro}</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Disponibilidad</span>
                        <p class="text-slate-800 font-black text-sm">${p.ocupacion} / ${p.capacidad} Plazas</p>
                    </div>
                </div>

                <div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-2">Alumnos Registrados</span>
                    <div class="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        ${p.clientes.map(c => `
                            <div class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl">
                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 overflow-hidden">
                                     ${c.foto ? `<img src="${c.foto}" class="h-full w-full object-cover">` : c.nombre[0]}
                                </div>
                                <span class="text-xs font-black text-slate-700 truncate">${c.nombre}</span>
                            </div>
                        `).join('') || '<p class="text-xs text-slate-400 italic px-2">Nadie inscrito todavía</p>'}
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: `<div class="pt-4"><span class="text-[10px] font-black text-brandCoral uppercase tracking-widest block mb-2">${p.tipo_clase}</span><span class="text-3xl font-black text-slate-900 leading-none">${p.clase}</span></div>`,
            html: html,
            showCancelButton: true,
            confirmButtonText: p.ya_reservada ? 'Ya estás inscrito' : (p.isFull ? 'Completo' : 'Confirmar Reserva'),
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#0f172a',
            showConfirmButton: !p.ya_reservada && !p.isFull,
            reverseButtons: true,
            customClass: { popup: 'rounded-[50px] p-8', title: 'text-left px-4' }
        }).then((res) => {
            if (res.isConfirmed) submitReservaForm(event.start, p.clase, p.centro);
        });
    }

    function confirmarAbandono(event, nombre) {
        event.preventDefault();
        Swal.fire({
            title: '¿Abandonar clase?',
            text: `Vas a cancelar tu reserva para "${nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5D7A',
            confirmButtonText: 'Sí, cancelar'
        }).then((res) => { if (res.isConfirmed) event.target.submit(); });
    }

    function submitReservaForm(start, nombre, centro) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '{{ route("cliente.reservar") }}';
        const data = {
            _token: '{{ csrf_token() }}',
            fecha_hora: start.toISOString().replace('T',' ').substring(0,19),
            nombre_clase: nombre,
            centro: centro
        };
        for(let key in data){
            const input = document.createElement('input');
            input.type = 'hidden'; input.name = key; input.value = data[key];
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
    }
</script>
@endsection
