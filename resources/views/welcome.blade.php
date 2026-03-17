@extends('components.headers.header_welcome')

@section('content')
    <!-- FullCalendar CDN -->
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/core/locales/es.global.min.js"></script>
    <style>
        /* --- REWORK PREMIUM LIGHT CSS --- */
        :root {
            --brand-teal: #4BB7AE;
            --brand-coral: #EF5D7A;
        }

        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
            }

            50% {
                transform: translateY(-15px) rotate(1deg);
            }

            100% {
                transform: translateY(0px) rotate(0deg);
            }
        }

        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.4s ease;
        }

        .glass-card:hover {
            background: white;
            border-color: var(--brand-teal);
            transform: translateY(-5px);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
        }

        .excel-grid {
            background-size: 50px 50px;
            background-image:
                linear-gradient(to right, rgba(75, 183, 174, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(75, 183, 174, 0.03) 1px, transparent 1px);
        }

        .text-gradient {
            background: linear-gradient(135deg, var(--brand-teal) 0%, var(--brand-coral) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stat-card {
            background: white;
            border: 1px solid #f1f5f9;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.03);
        }

        .floating-shape {
            position: absolute;
            z-index: 0;
            filter: blur(100px);
            border-radius: 50%;
            pointer-events: none;
        }

        .advantage-box {
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }

        .advantage-box:hover {
            border-color: #f1f5f9;
            background: #fcfdfe;
        }
    </style>

    <div class="excel-grid min-h-screen bg-white text-gray-900 overflow-hidden">

        {{-- Shapes decorativas suaves --}}
        <div class="floating-shape w-96 h-96 bg-brandTeal/5 top-[-10%] left-[-10%] animate-pulse"></div>
        <div class="floating-shape w-[600px] h-[600px] bg-brandCoral/5 bottom-[-20%] right-[-10%]"></div>

        @php
            $user = Auth::guard('web')->user() ?? Auth::guard('entrenador')->user();
            $isCliente = $user && method_exists($user, 'hasRole') && $user->hasRole('cliente');
        @endphp

        @if(!$isCliente)
            {{-- 1. HERO SECTION (PÚBLICO / ADMIN / ENTRENADOR) --}}
            <section class="relative min-h-[90vh] flex items-center pt-24 px-4 sm:px-6 lg:px-8">
                <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <div class="reveal active">
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 mb-8">
                            <span class="w-2 h-2 rounded-full bg-brandTeal animate-ping"></span>
                            <span class="text-xs font-black uppercase tracking-widest text-gray-400">Impulsado por Moverte da
                                Vida</span>
                        </div>

                        <h1 class="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
                            Tu centro, <br>
                            <span class="text-gradient">sincronizado.</span>
                        </h1>

                        <p class="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-12 max-w-xl">
                            Desde el control de sesiones a pie de pista hasta la liquidación final. Una sola herramienta limpia
                            y eficiente.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-5">
                            @guest
                                <a href="{{ route('login') }}"
                                    class="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 transition-all">
                                    Acceder al Sistema <i class="fa-solid fa-chevron-right text-brandTeal"></i>
                                </a>
                            @else
                                <a href="{{ $user->hasRole('admin') || $user->hasRole('entrenador') ? route('calendario') : '#' }}"
                                    class="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 transition-all">
                                    Ir al Panel <i class="fa-solid fa-chevron-right text-brandTeal"></i>
                                </a>
                            @endguest
                            <a href="#solucion"
                                class="px-10 py-5 bg-white border border-gray-200 rounded-2xl font-black text-xl hover:bg-gray-50 text-center transition-all">
                                ¿Cómo funciona?
                            </a>
                        </div>
                    </div>

                    <div class="relative reveal active" style="transition-delay: 200ms;">
                        <div style="animation: float 8s ease-in-out infinite;">
                            <div class="glass-card p-6 rounded-[3rem] shadow-2xl border-white">
                                <div
                                    class="bg-gray-50 rounded-[2.5rem] p-8 overflow-hidden aspect-video relative group border border-gray-100">
                                    <div class="flex justify-between items-start mb-10">
                                        <div>
                                            <p class="text-brandTeal text-xs font-black uppercase tracking-[0.2em]">Agenda de
                                                Hoy</p>
                                            <h4 class="text-gray-900 text-2xl font-black">Mis Sesiones</h4>
                                        </div>
                                        <div class="bg-brandCoral/10 p-3 rounded-2xl">
                                            <i class="fa-solid fa-calendar-day text-brandCoral text-xl"></i>
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <div
                                            class="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center group-hover:border-brandTeal transition-all shadow-sm">
                                            <span class="text-gray-800 font-bold">10:00 - Yoga Vinyasa</span>
                                            <span
                                                class="text-xs bg-brandTeal/10 text-brandTeal px-3 py-1 rounded-full font-black">CONFIRMAR</span>
                                        </div>
                                        <div
                                            class="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center opacity-60">
                                            <span class="text-gray-400 font-bold">12:30 - Personal Tr.</span>
                                            <span
                                                class="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-black">PENDIENTE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {{-- 2. SECCIÓN DEL PROBLEMA AL ÉXITO --}}
            <section id="solucion" class="py-32 relative bg-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div class="reveal">
                            <h2 class="text-brandCoral font-black uppercase tracking-[0.5em] text-xs mb-4">La Transformación
                            </h2>
                            <h3 class="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Del caos del Excel a
                                la gestión viva.</h3>
                            <p class="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
                                Antiguamente, la gestión en **Moverte da Vida** se basaba en el intercambio constante de
                                archivos. Al final de mes, el director recibía **20 archivos distintos**. Un caos de 240
                                documentos al año donde era imposible cuadrar cobros y horas.
                            </p>
                            <div class="grid grid-cols-2 gap-8">
                                <div>
                                    <div
                                        class="stat-card p-6 rounded-3xl text-center border-l-4 border-l-brandCoral bg-gray-50/50">
                                        <p class="text-3xl font-black text-brandCoral">240</p>
                                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Archivos/Año
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <div
                                        class="stat-card p-6 rounded-3xl text-center border-l-4 border-l-brandTeal bg-gray-50/50">
                                        <p class="text-3xl font-black text-brandTeal">100%</p>
                                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digitalizado
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-12 reveal" style="transition-delay: 300ms;">
                            <div class="flex gap-6">
                                <div
                                    class="w-14 h-14 bg-brandTeal/5 rounded-2xl flex items-center justify-center text-brandTeal text-2xl flex-shrink-0 border border-brandTeal/10">
                                    <i class="fa-solid fa-mobile-screen-button"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-black mb-2 italic text-gray-900">El Entrenador conectado</h4>
                                    <p class="text-gray-500">Cada coach tiene su propio panel personal para consultar sus
                                        horarios y gestionar la asistencia al momento.</p>
                                </div>
                            </div>
                            <div class="flex gap-6">
                                <div
                                    class="w-14 h-14 bg-brandCoral/5 rounded-2xl flex items-center justify-center text-brandCoral text-2xl flex-shrink-0 border border-brandCoral/10">
                                    <i class="fa-solid fa-cash-register"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-black mb-2 italic text-gray-900">Control total de cobros</h4>
                                    <p class="text-gray-500">Registro inmediato del método de pago. El entrenador valida el
                                        cobro al terminar la sesión.</p>
                                </div>
                            </div>
                            <div class="flex gap-6">
                                <div
                                    class="w-14 h-14 bg-brandAqua/10 rounded-2xl flex items-center justify-center text-brandTeal text-2xl flex-shrink-0 border border-brandTeal/10">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-black mb-2 italic text-gray-900">Nóminas automáticas</h4>
                                    <p class="text-gray-500">Toda la actividad del equipo alimenta el generador de nóminas
                                        masivo. Cálculos perfectos en 1 clic.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {{-- 3. RESUMEN DE VENTAJAS Y FUNCIONALIDADES --}}
            <section class="py-32 bg-gray-50 rounded-[4rem] mx-4 sm:mx-8 mb-32 relative overflow-hidden border border-gray-100">
                <div class="max-w-7xl mx-auto px-10 relative z-10">
                    <div class="text-center mb-24 reveal">
                        <h2 class="text-brandTeal font-black uppercase tracking-[0.4em] text-xs mb-4">Core Benefits</h2>
                        <h3 class="text-5xl md:text-7xl font-black tracking-tighter text-gray-900">Todo lo que hacemos por ti.
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">

                        {{-- Ventaja 1 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
                            <div
                                class="w-14 h-14 bg-brandTeal/10 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-hotel"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Gestión <br> Multi-Centro</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Controla todas tus sedes (Aira, Open Arena...)
                                desde una única cuenta maestra.</p>
                        </div>

                        {{-- Ventaja 2 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
                            <div
                                class="w-14 h-14 bg-brandCoral/10 text-brandCoral rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-calculator"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Cálculo de <br> Tramos</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Lógica de precios automática integrada según la
                                duración y tipo de sesión.</p>
                        </div>

                        {{-- Ventaja 3 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
                            <div
                                class="w-14 h-14 bg-brandAqua/20 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-user-check"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Control de <br> Asistencia</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Los entrenadores marcan la presencia del cliente al
                                instante desde el móvil.</p>
                        </div>

                        {{-- Ventaja 4 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
                            <div
                                class="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-file-pdf"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">PDFs <br> Automáticos</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Generación instantánea de borradores de nóminas
                                listos para su revisión.</p>
                        </div>

                        {{-- Ventaja 5 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
                            <div
                                class="w-14 h-14 bg-brandTeal/10 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-lock"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Seguridad <br> Bancaria</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Almacenamiento cifrado de IBANs y firmas digitales
                                de todo el personal.</p>
                        </div>

                        {{-- Ventaja 6 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
                            <div
                                class="w-14 h-14 bg-brandCoral/10 text-brandCoral rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Métricas <br> Reales</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Dashboards interactivos con la evolución de
                                ingresos y rentabilidad mensual.</p>
                        </div>

                        {{-- Ventaja 7 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
                            <div
                                class="w-14 h-14 bg-brandAqua/20 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-user-shield"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Roles de <br> Acceso</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Paneles diferenciados para administradores y staff
                                de entrenamiento.</p>
                        </div>

                        {{-- Ventaja 8 --}}
                        <div
                            class="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
                            <div
                                class="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                                <i class="fa-solid fa-cloud"></i>
                            </div>
                            <h5 class="font-black text-gray-900 uppercase tracking-tighter mb-4">Adiós al <br> Papel</h5>
                            <p class="text-gray-500 text-sm leading-relaxed">Elimina los excels y el papel. Información siempre
                                disponible en la nube.</p>
                        </div>

                    </div>
                </div>
            </section>
        @else
            {{-- MODO CLIENTE: HERO PERSONALIZADO --}}
            <section class="relative min-h-[60vh] flex items-center pt-24 px-4 sm:px-6 lg:px-8">
                <div class="max-w-7xl mx-auto w-full text-center">
                    <div class="reveal active">
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brandTeal/10 border border-brandTeal/20 mb-8">
                            <span class="w-2 h-2 rounded-full bg-brandTeal animate-pulse"></span>
                            <span class="text-xs font-black uppercase tracking-widest text-brandTeal">Portal del Usuario</span>
                        </div>

                        <h1 class="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
                            ¡Hola, <span class="text-gradient">{{ $user->name ?? $user->nombre }}</span>! <br>
                            Tus clases te esperan.
                        </h1>

                        <p class="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
                            Revisa tus sesiones programadas, confirma tu asistencia y sigue tu progreso con nosotros.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-5 justify-center">
                            <a href="{{ route('cliente.dashboard') }}"
                                class="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 transition-all">
                                Gestionar mis Clases <i class="fa-solid fa-calendar-check text-brandTeal"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        @endif

        {{-- 4. CALENDARIO DE CLASES (PRESENTE EN AMBOS MODOS, PERO EN MODO CLIENTE ES EL FOCO PRINCIPAL) --}}
        <section id="calendario-clases" class="py-16 md:py-32 bg-white reveal">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                @if($isCliente)
                <div class="text-left mb-12 border-l-8 border-brandTeal pl-6">
                    <h3 class="text-4xl font-black tracking-tighter text-gray-900 mb-2">Agenda de Actividades</h3>
                    <p class="text-gray-500 font-medium text-lg">Selecciona una clase libre para unirte.</p>
                </div>
                @else
                <div class="text-center mb-16">
                    <h2 class="text-brandCoral font-black uppercase tracking-[0.4em] text-xs mb-4">Horarios Vivos</h2>
                    <h3 class="text-5xl font-black tracking-tighter text-gray-900 mb-6">Próximas Sesiones</h3>
                    <p class="text-gray-500 max-w-2xl mx-auto font-medium">Consulta las clases programadas por nuestros
                        entrenadores y reserva tu plaza.</p>
                </div>
                @endif

                {{-- FILTROS DEL CALENDARIO --}}
                <div class="mb-8 flex flex-wrap items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-bold text-gray-700">Filtrar por tipo:</label>
                        <select id="filter-type" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brandTeal transition-all">
                            <option value="all">Todas las clases</option>
                            <option value="Personal">Entrenamiento Personal (EP)</option>
                            <option value="Dúo">Sesiones Dúo</option>
                            <option value="Trío">Sesiones Trío</option>
                            <option value="Grupo">Grupos</option>
                            <option value="Privado">Grupos Privados</option>
                        </select>
                    </div>

                    @if($isCliente)
                    <div class="flex items-center gap-3 ml-auto">
                        <span class="text-sm font-bold text-gray-700">Solo compatibles con mis créditos</span>
                        <button type="button" id="toggle-compatible" class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors duration-200 focus:outline-none">
                            <span id="toggle-circle" class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"></span>
                        </button>
                    </div>
                    @endif
                </div>

                <div
                    class="glass-card p-4 md:p-8 rounded-[3rem] shadow-2xl border-white bg-white/50 relative overflow-hidden">
                    <div id='calendar' class="min-h-[600px]"></div>
                </div>
                
                @if($isCliente)
                <div class="mt-16 text-center">
                    <div class="bg-gray-50 rounded-3xl p-10 border border-gray-100 reveal">
                        <h4 class="text-2xl font-black text-gray-800 mb-4">¿Quieres ver el detalle de tus reservas?</h4>
                        <p class="text-gray-500 mb-8 max-w-xl mx-auto">Accede a tu panel personalizado para cancelar, reprogramar o ver el historial de tus entrenamientos realizados.</p>
                        <a href="{{ route('cliente.dashboard') }}" class="inline-flex items-center gap-3 px-8 py-4 bg-brandCoral text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg shadow-brandCoral/20">
                            Ir a MisClases <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                @endif
            </div>
        </section>

        @if(!$isCliente)
            {{-- 5. FINAL CTA (SOLO PARA PÚBLICO / GUEST) --}}
            @guest
            <section class="py-32 text-center reveal">
                <div class="max-w-4xl mx-auto px-4">
                    <h3 class="text-5xl md:text-7xl font-black tracking-tighter mb-8">Impulsa tu centro hacia el futuro.</h3>
                    <p class="text-xl text-gray-500 mb-12 font-medium">
                        La digitalización inteligente es la ventaja competitiva para centros de alto rendimiento como **Moverte
                        da Vida**.
                    </p>
                    <div class="flex justify-center">
                        <a href="{{ route('login') }}"
                            class="inline-block px-12 py-6 bg-brandCoral text-white rounded-3xl font-black text-2xl shadow-xl hover:scale-110 hover:-rotate-2 transition-all">
                            Acceder al Sistema
                        </a>
                    </div>
                </div>
            </section>
            @endguest
        @endif

        <x-footers.footer_welcome />

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var calendarEl = document.getElementById('calendar');
            var compatiblesOnly = false;
            var currentType = 'all';

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'timeGridWeek',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                },
                slotMinTime: '07:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                events: function(info, successCallback, failureCallback) {
                    let url = new URL('/api/clases', window.location.origin);
                    url.searchParams.append('compatible_only', compatiblesOnly);
                    url.searchParams.append('tipo', currentType);
                    
                    fetch(url)
                        .then(response => response.json())
                        .then(data => successCallback(data))
                        .catch(err => failureCallback(err));
                },
                eventClick: function (info) {
                    const props = info.event.extendedProps;
                    if (props.isFull) {
                        alert('Esta clase está completa.');
                        return;
                    }

                    if (confirm('¿Deseas reservar la clase "' + props.clase + '" con ' + props.entrenador + '?')) {
                        window.location.href = "{{ route('cliente.dashboard') }}";
                    }
                },
                eventContent: function (arg) {
                    const props = arg.event.extendedProps;
                    
                    // Contenedor principal
                    let container = document.createElement('div');
                    container.className = 'p-1 h-full flex flex-col justify-between overflow-hidden text-white';
                    
                    // Cabecera: Nombre Clase
                    let title = document.createElement('div');
                    title.className = 'font-black text-[10px] uppercase leading-tight mb-1 truncate';
                    title.innerText = arg.event.title;
                    
                    // Cuerpo: Entrenador + Fotos
                    let body = document.createElement('div');
                    body.className = 'flex items-center gap-1 mb-1';
                    
                    if (props.entrenador_foto) {
                        let img = document.createElement('img');
                        img.src = props.entrenador_foto;
                        img.className = 'w-5 h-5 rounded-full object-cover border border-white/30';
                        body.appendChild(img);
                    }
                    
                    let coachName = document.createElement('span');
                    coachName.className = 'text-[9px] font-bold opacity-90 truncate';
                    coachName.innerText = props.entrenador;
                    body.appendChild(coachName);

                    // Lista de clientes (bolitas)
                    let clientsList = document.createElement('div');
                    clientsList.className = 'flex -space-x-1.5 overflow-hidden mt-1';
                    
                    if (props.clientes && props.clientes.length > 0) {
                        props.clientes.forEach((c, idx) => {
                            if (idx < 3) { // Mostrar solo los 3 primeros para no saturar
                                if (c.foto) {
                                    let cImg = document.createElement('img');
                                    cImg.src = c.foto;
                                    cImg.className = 'inline-block h-4 w-4 rounded-full ring-1 ring-white object-cover';
                                    cImg.title = c.nombre;
                                    clientsList.appendChild(cImg);
                                } else {
                                    let cLetter = document.createElement('div');
                                    cLetter.className = 'inline-block h-4 w-4 rounded-full bg-gray-400 ring-1 ring-white flex items-center justify-center text-[7px] font-bold';
                                    cLetter.innerText = c.nombre.charAt(0);
                                    cLetter.title = c.nombre;
                                    clientsList.appendChild(cLetter);
                                }
                            }
                        });
                        
                        if (props.clientes.length > 3) {
                            let more = document.createElement('div');
                            more.className = 'inline-block h-4 w-4 rounded-full bg-white/20 ring-1 ring-white flex items-center justify-center text-[7px] font-bold';
                            more.innerText = '+' + (props.clientes.length - 3);
                            clientsList.appendChild(more);
                        }
                    }

                    // Badge de capacidad
                    let footer = document.createElement('div');
                    footer.className = 'flex justify-between items-center mt-auto';
                    
                    let capacity = document.createElement('div');
                    capacity.className = 'text-[8px] font-black bg-black/20 px-1.5 py-0.5 rounded-md';
                    capacity.innerText = `${props.ocupacion}/${props.capacidad}`;
                    
                    footer.appendChild(clientsList);
                    footer.appendChild(capacity);

                    container.appendChild(title);
                    container.appendChild(body);
                    container.appendChild(footer);
                    
                    return { domNodes: [container] };
                }
            });
            calendar.render();

            // Lógica de Filtros
            const typeFilter = document.getElementById('filter-type');
            if (typeFilter) {
                typeFilter.addEventListener('change', function() {
                    currentType = this.value;
                    calendar.refetchEvents();
                });
            }

            const toggleCompatible = document.getElementById('toggle-compatible');
            const toggleCircle = document.getElementById('toggle-circle');
            if (toggleCompatible) {
                toggleCompatible.addEventListener('click', function() {
                    compatiblesOnly = !compatiblesOnly;
                    
                    if (compatiblesOnly) {
                        this.classList.remove('bg-gray-300');
                        this.classList.add('bg-brandTeal');
                        toggleCircle.classList.add('translate-x-6');
                        toggleCircle.classList.remove('translate-x-1');
                    } else {
                        this.classList.add('bg-gray-300');
                        this.classList.remove('bg-brandTeal');
                        toggleCircle.classList.remove('translate-x-6');
                        toggleCircle.classList.add('translate-x-1');
                    }
                    
                    calendar.refetchEvents();
                });
            }
        });

        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    </script>

@endsection