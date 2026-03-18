@extends('layouts.client')

@section('title', 'Mis Clases')

@section('content')
<div class="max-w-6xl mx-auto">
    
    <!-- User Header & Credits -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-brandTeal/10 rounded-2xl flex items-center justify-center text-brandTeal">
                <i class="fa-solid fa-user text-2xl"></i>
            </div>
            <div>
                <h1 class="text-2xl font-bold text-slate-800">¡Hola, {{ $user->name }}!</h1>
                <p class="text-slate-500 font-medium">Gestiona tus reservas de la semana.</p>
            </div>
        </div>
        
        <div class="bg-gradient-to-br from-brandTeal to-brandCoral rounded-3xl p-6 px-8 text-white shadow-xl flex items-center gap-5 min-w-[240px] transform hover:scale-105 transition-transform duration-300">
            <div class="bg-white/20 p-4 rounded-2xl">
                <i class="fa-solid fa-ticket text-2xl text-white"></i>
            </div>
            <div>
                <span class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tus Créditos</span>
                <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-extrabold tracking-tight">{{ $totalCreditos }}</span>
                    <span class="text-slate-400 text-sm font-medium">disponibles</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Feedback Messages -->
    @if(session('success'))
        <div class="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl mb-8 border border-emerald-100 shadow-sm">
            <i class="fa-solid fa-circle-check text-xl"></i>
            <span class="font-medium">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="flex items-center gap-3 bg-rose-50 text-rose-700 px-6 py-4 rounded-2xl mb-8 border border-rose-100 shadow-sm">
            <i class="fa-solid fa-circle-exclamation text-xl"></i>
            <span class="font-medium">{{ session('error') }}</span>
        </div>
    @endif

    <!-- Filter Bar -->
    <div class="mb-10 flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm reveal">
        <div class="flex flex-wrap items-center gap-6">
            <div class="flex items-center gap-3">
                <label class="text-sm font-bold text-slate-700">Filtrar por tipo:</label>
                <select id="dashboard-filter-type" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-brandTeal transition-all text-slate-700">
                    <option value="all">Todas las clases</option>
                    <option value="ep">Entrenamiento Personal (EP)</option>
                    <option value="duo">Sesiones Dúo</option>
                    <option value="trio">Sesiones Trío</option>
                    <option value="grupo">Grupos</option>
                </select>
            </div>
            
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-slate-700">Solo compatibles con mis créditos</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="dashboard-filter-compatible" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandTeal"></div>
                </label>
            </div>
        </div>
        
        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            Mostrando <span id="visible-count" class="text-brandTeal">--</span> sesiones
        </div>
    </div>

    <!-- Calendar View -->
    <div class="space-y-12" id="dashboard-clases-container">
        @forelse($clasesAgrupadas as $fecha => $clases)
            @php
                $carbonFecha = \Carbon\Carbon::parse($fecha);
                $esHoy = $carbonFecha->isToday();
            @endphp
            
            <div class="day-section relative" data-date="{{ $fecha }}">
                <!-- Day Header -->
                <div class="flex items-center gap-4 mb-6 sticky top-24 bg-slate-50/90 backdrop-blur-sm py-2 z-10 transition-all duration-300">
                    <div class="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center border-t-4 {{ $esHoy ? 'border-t-brandTeal' : 'border-t-slate-300' }}">
                        <span class="text-lg font-bold text-slate-800 leading-none">{{ $carbonFecha->format('d') }}</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ $carbonFecha->translatedFormat('M') }}</span>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-800 capitalize">
                            {{ $carbonFecha->translatedFormat('l') }}
                            @if($esHoy) <span class="ml-2 text-xs bg-brandTeal/10 text-brandTeal px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Hoy</span> @endif
                        </h2>
                        <p class="text-sm text-slate-500 font-medium italic"><span class="day-visible-count">{{ $clases->count() }}</span> clases programadas</p>
                    </div>
                </div>

                <!-- Classes Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 clase-grid">
                    @foreach($clases as $clase)
                        <div class="clase-card-wrapper bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 {{ $clase->ya_reservada ? 'ring-2 ring-brandTeal ring-offset-2' : '' }}"
                             data-tipo="{{ strtolower($clase->tipo) }}"
                             data-compatible="{{ $clase->tiene_credito ? 'true' : 'false' }}">
                            
                            <div>
                                <div class="flex justify-between items-start mb-4">
                                    <div class="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        {{ $clase->tipo }}
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-black text-slate-800">{{ $clase->fecha_hora->format('H:i') }}</div>
                                        <div class="text-[10px] text-slate-400 font-bold uppercase">60 min</div>
                                    </div>
                                </div>

                                <h3 class="text-xl font-extrabold text-slate-900 mb-4">{{ $clase->nombre }}</h3>

                                <div class="space-y-3 mb-8">
                                    <div class="flex items-center gap-3 text-slate-600">
                                        <i class="fa-solid fa-user-tie text-slate-400"></i>
                                        <span class="text-sm font-semibold truncate">{{ $clase->entrenador_nombre }}</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-slate-600">
                                        <i class="fa-solid fa-location-dot text-slate-400"></i>
                                        <span class="text-sm font-semibold">{{ $clase->centro }}</span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        @php 
                                            $disponibles = $clase->capacidad - $clase->ocupacion;
                                            $colorCupos = $disponibles <= 2 ? 'text-amber-500' : 'text-emerald-500';
                                        @endphp
                                        <i class="fa-solid fa-users text-slate-400"></i>
                                        <span class="text-sm font-bold {{ $colorCupos }}">
                                            {{ $disponibles }} plazas libres
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Button -->
                            @if($clase->ya_reservada)
                                <div class="space-y-3">
                                    <div class="w-full py-3 bg-brandTeal/10 text-brandTeal font-bold rounded-2xl flex items-center justify-center gap-2 border border-brandTeal/20">
                                        <i class="fa-solid fa-calendar-check"></i>
                                        Inscrito
                                    </div>
                                    <form action="{{ route('cliente.abandonar') }}" method="POST" onsubmit="return confirm('¿Estás seguro de que quieres abandonar esta clase? Se te devolverá el crédito.')">
                                        @csrf
                                        <input type="hidden" name="pago_id" value="{{ $clase->id_pago }}">
                                        <button type="submit" class="w-full py-2 text-rose-500 text-xs font-bold hover:text-rose-700 transition-colors flex items-center justify-center gap-1">
                                            <i class="fa-solid fa-circle-xmark"></i> Abandonar clase
                                        </button>
                                    </form>
                                </div>
                            @elseif($clase->ocupacion >= $clase->capacidad)
                                <button disabled class="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed">
                                    Clase Completa
                                </button>
                            @elseif($clase->tiene_credito)
                                <form action="{{ route('cliente.reservar') }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="fecha_hora" value="{{ $clase->fecha_hora->format('Y-m-d H:i:s') }}">
                                    <input type="hidden" name="nombre_clase" value="{{ $clase->nombre }}">
                                    <input type="hidden" name="centro" value="{{ $clase->centro }}">
                                    <button type="submit" class="w-full py-4 bg-white border-2 border-brandTeal text-brandTeal hover:bg-brandTeal hover:text-white font-bold rounded-2xl transition-all duration-200 active:scale-95 shadow-sm">
                                        Reservar Clase
                                    </button>
                                </form>
                            @else
                                <div class="w-full py-3 px-4 bg-rose-50 text-rose-500 font-bold rounded-2xl text-center border border-rose-100 text-xs">
                                    No tienes créditos compatibles
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @empty
            <div class="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                <div class="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fa-solid fa-calendar-day text-4xl text-slate-300"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">No hay clases programadas</h3>
                <p class="text-slate-500 max-w-sm mx-auto font-medium">Vuelve más tarde para ver las nuevas sesiones creadas por nuestros entrenadores.</p>
            </div>
        @endforelse
    </div>
</div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const filterType = document.getElementById('dashboard-filter-type');
            const filterCompatible = document.getElementById('dashboard-filter-compatible');
            const visibleCountEl = document.getElementById('visible-count');
            
            function applyFilters() {
                const selectedType = filterType.value;
                const onlyCompatible = filterCompatible.checked;
                let globalCount = 0;

                document.querySelectorAll('.day-section').forEach(daySection => {
                    let dayVisibleCount = 0;
                    const cards = daySection.querySelectorAll('.clase-card-wrapper');
                    
                    cards.forEach(card => {
                        const cardType = card.dataset.tipo;
                        const isCompatible = card.dataset.compatible === 'true';

                        let matchesType = (selectedType === 'all' || cardType.includes(selectedType));
                        let matchesCompatible = (!onlyCompatible || isCompatible);

                        if (matchesType && matchesCompatible) {
                            card.style.display = 'flex';
                            dayVisibleCount++;
                            globalCount++;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    // Hide day section if no classes are visible
                    if (dayVisibleCount === 0) {
                        daySection.style.display = 'none';
                    } else {
                        daySection.style.display = 'block';
                        daySection.querySelector('.day-visible-count').innerText = dayVisibleCount;
                    }
                });

                visibleCountEl.innerText = globalCount;
            }

            if (filterType) filterType.addEventListener('change', applyFilters);
            if (filterCompatible) filterCompatible.addEventListener('change', applyFilters);

            // Initial run
            applyFilters();
        });
    </script>
@endsection
