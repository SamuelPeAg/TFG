<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Clases | Factomove</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/core/locales/es.global.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brandTeal: '#4BB7AE',
                        brandCoral: '#EF5D7A',
                        brandAqua: '#A5EFE2',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');
        
        body { background-color: #fbfcfe; font-family: 'Inter', sans-serif; }
        .reveal { opacity: 0; animation: reveal 0.8s cubic-bezier(0, 1, 0, 1) forwards; }
        @keyframes reveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* FullCalendar Customizations */
        .fc { --fc-border-color: #f1f5f9; border: none !important; }
        .fc-toolbar-title { font-size: 1.8rem !important; font-weight: 900 !important; color: #0f172a; letter-spacing: -0.02em; }
        .fc-button { 
            background: var(--brand-teal) !important; 
            border: none !important; 
            color: #ffffff !important; 
            font-weight: 900 !important; 
            text-transform: uppercase !important; 
            font-size: 0.8rem !important; 
            padding: 0.8rem 1.4rem !important; 
            border-radius: 14px !important; 
            transition: all 0.3s !important; 
            box-shadow: 0 4px 12px rgba(75, 183, 174, 0.3) !important; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .fc-button:hover { 
            filter: brightness(1.1) !important; 
            transform: translateY(-2px) !important; 
            box-shadow: 0 8px 20px rgba(75, 183, 174, 0.4) !important; 
        }
        .fc-button-primary:not(:disabled).fc-button-active { 
            background: #ffffff !important; 
            color: var(--brand-teal) !important; 
            border: 2px solid var(--brand-teal) !important; 
            box-shadow: none !important;
        }
        .fc-button .fc-icon { font-size: 1.2em !important; font-weight: bold !important; color: #ffffff !important; }
        .fc-button-primary:not(:disabled).fc-button-active .fc-icon { color: var(--brand-teal) !important; }
        .fc-col-header-cell { background: #f8fafc; padding: 1.2rem 0 !important; border: none !important; }
        .fc-col-header-cell-cushion { color: #94a3b8; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
        .fc-v-event { border-radius: 10px; border: none; padding: 0.4rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        
        /* Modal tweaks */
        .modal-overlay { z-index: 1000 !important; }
        
        /* Shifting the alert to leave the center modal visible */
        .shift-left-alert {
            margin-left: -320px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
    </style>
    
    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="{{ asset('css/calendario.css') }}">
</head>

<body class="antialiased text-slate-900 bg-slate-50">
    <div class="dashboard-container">
        @auth
            @if(auth()->user()->hasRole('admin'))
                @include('components.sidebar.sidebar_admin')
            @elseif(auth()->user()->hasRole('entrenador'))
                @include('components.sidebar.sidebar_entrenador')
            @endif
        @endauth

        <main class="main-content">
            <div id="calendar-config" style="display: none;"
                 data-base-url="{{ url('/') }}"
                 data-user-role="{{ Auth::check() ? (Auth::user()->roles->pluck('name')->first() ?? '') : '' }}"
                 data-user-id="{{ Auth::id() }}"
                 data-is-admin="{{ Auth::check() && Auth::user()->hasRole('admin') ? 'true' : 'false' }}"
                 data-is-trainer="{{ Auth::check() && Auth::user()->hasRole('entrenador') ? 'true' : 'false' }}"
                 data-trainers='@json($entrenadores->map(fn($c) => ['id' => $c->id, 'name' => $c->name])->values())'>
            </div>
            <div class="p-6 md:p-10 reveal">
                
                <!-- Premium Header for Admin/Trainer -->
                <div class="relative overflow-hidden bg-[#1a243a] rounded-[40px] p-8 md:p-12 mb-10 shadow-2xl shadow-slate-900/10">
                    <div class="absolute top-0 right-0 w-80 h-80 bg-brandTeal/15 blur-[120px] -mr-40 -mt-40"></div>
                    <div class="absolute bottom-0 left-0 w-80 h-80 bg-brandCoral/10 blur-[120px] -ml-40 -mb-40"></div>
                    
                    <div class="relative flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div class="flex items-center gap-6">
                            <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-brandTeal to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-brandTeal/20 rotate-3">
                                <i class="fa-solid fa-calendar-check text-3xl"></i>
                            </div>
                            <div>
                                <h1 class="text-3xl md:text-4xl font-black text-white mb-2">Cuadrante de Clases</h1>
                                <p class="text-slate-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-brandTeal animate-pulse"></span>
                                    Gestiona y supervisa todas las sesiones
                                </p>
                            </div>
                        </div>

                        <!-- Action Bar Info -->
                        <div class="flex flex-wrap items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
                            <!-- Center Selector -->
                            <div class="bg-brandTeal/10 backdrop-blur-xl border border-brandTeal/20 rounded-2xl px-4 py-2 flex items-center gap-3 min-w-[200px]">
                                <i class="fa-solid fa-house-medical text-brandTeal"></i>
                                <select id="filter-center" class="bg-transparent border-none outline-none text-white text-sm font-bold w-full cursor-pointer focus:ring-0">
                                    <option value="" class="bg-slate-900 text-white">Todos los centros</option>
                                    @foreach($centros as $centro)
                                        <option value="{{ $centro->nombre }}" class="bg-slate-900 text-white">{{ $centro->nombre }}</option>
                                    @endforeach
                                </select>
                            </div>

                            <!-- Search Box -->
                            <div class="bg-brandTeal/10 backdrop-blur-xl border border-brandTeal/20 rounded-2xl px-4 py-2 flex items-center gap-3 w-full lg:w-80 relative group">
                                <i class="fa-solid fa-magnifying-glass text-slate-500"></i>
                                <input type="text" id="search-user" placeholder="Buscar usuario..." autocomplete="off" 
                                       class="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-slate-500 focus:ring-0">
                                <button id="btn-clear-filters" class="hidden group-focus-within:block hover:text-brandCoral text-slate-500 transition-colors" title="Limpiar Filtros">
                                    <i class="fa-solid fa-circle-xmark"></i>
                                </button>
                                <div id="search_user_suggestions" class="suggestions" hidden></div>
                            </div>

                            <!-- New Class Button -->
                            <button id="btnNuevaClase" class="px-8 py-4 bg-brandTeal text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl hover:bg-white hover:text-brandTeal transition-all duration-300 shadow-xl shadow-brandTeal/20 active:scale-95 flex items-center gap-3">
                                <i class="fa-solid fa-plus text-[14px]"></i>
                                <span>NUEVA CLASE</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Calendar Container -->
                <div class="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-50 relative">
                    <div id="fullCalendarEl" class="min-h-[750px]"></div>
                    
                    <div id="calendar-summary" class="mt-8 flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <i class="fa-solid fa-circle-info text-brandTeal"></i>
                        Haz clic en el calendario para añadir una clase o selecciona una existente.
                    </div>
                </div>
            </div>
        </main>
    </div>

    @include('calendario.modales.modal_salir')
    @include('calendario.modales.modal_info')
    @include('calendario.modales.modal_nueva_clase')
    @include('calendario.modales.modal_seleccion_clientes')

    <script>
        (function() {
            const config = document.getElementById('calendar-config');
            window.BASE_URL = config.getAttribute('data-base-url');
            window.CURRENT_USER_ROLE = config.getAttribute('data-user-role');
            window.CURRENT_USER_ID = config.getAttribute('data-user-id');
            window.IS_ADMIN = config.getAttribute('data-is-admin') === 'true';
            window.IS_TRAINER = config.getAttribute('data-is-trainer') === 'true';
            window.TRAINERS = JSON.parse(config.getAttribute('data-trainers'));
        })();
    </script>

    @vite('resources/js/app.js')
    <script src="{{ asset('js/wizard_clase.js') }}?v=1.2"></script>
    <script src="{{ asset('js/calendario.js') }}?v=1.3"></script>
    <script src="{{ asset('js/calendario-modal-logout.js') }}"></script>
</body>
</html>