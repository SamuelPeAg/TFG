@extends('components.headers.header_welcome')

@section('content')

    {{-- 1. HERO SECTION --}}
    <section class="relative pt-20 pb-20 md:pt-32 md:pb-32 bg-white overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
            <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brandAqua/30 blur-3xl"></div>
            <div class="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-brandTeal/10 blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
            <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                El movimiento <span class="text-brandCoral">es medicina</span>, <br>
                el movimiento <span class="text-brandTeal">da vida</span>.
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                No estamos diseñados para estar quietos. Tu salud empieza con tu próxima decisión.
            </p>
        </div>
    </section>

    {{-- 2. SECCIÓN FILOSOFÍA --}}
    <section class="py-12 md:py-20 bg-gray-50 relative border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16 reveal">
                <h2 class="text-brandTeal font-bold tracking-wide uppercase text-xs md:text-sm">Nuestra Filosofía</h2>
                <h3 class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Más allá de la estética
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {{-- Beneficio 1 --}}
                <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-brandTeal reveal group">
                    <div class="w-16 h-16 rounded-full bg-brandTeal/10 flex items-center justify-center mb-6 text-brandTeal group-hover:scale-110 transition-transform duration-300">
                        <i class="fa-solid fa-heart-pulse text-3xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Salud Metabólica</h4>
                    <p class="text-gray-600">
                        El movimiento regula tus hormonas, mejora tu sensibilidad a la insulina y mantiene tu corazón fuerte.
                    </p>
                </div>

                {{-- Beneficio 2 --}}
                <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-brandCoral reveal group" style="transition-delay: 100ms;">
                    <div class="w-16 h-16 rounded-full bg-brandCoral/10 flex items-center justify-center mb-6 text-brandCoral group-hover:scale-110 transition-transform duration-300">
                        <i class="fa-solid fa-brain text-3xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Claridad Mental</h4>
                    <p class="text-gray-600">
                        Al moverte, liberas neurotransmisores que reducen el estrés y la ansiedad. Una mente en movimiento es resiliente.
                    </p>
                </div>

                {{-- Beneficio 3 --}}
                <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-brandAqua reveal group" style="transition-delay: 200ms;">
                    <div class="w-16 h-16 rounded-full bg-brandAqua/10 flex items-center justify-center mb-6 text-brandTeal group-hover:scale-110 transition-transform duration-300">
                        <i class="fa-solid fa-person-running text-3xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Funcionalidad</h4>
                    <p class="text-gray-600">
                        Entrenamos para la vida real. Para que puedas cargar la compra o jugar con tus hijos sin fatiga.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {{-- 3. NUEVO BLOQUE "DISCRETO" DE RESERVA --}}
    {{-- Diseño tipo "Barra Flotante" limpia --}}
    <section class="relative z-20 -mt-8 md:-mt-10 px-4 reveal">
        <div class="max-w-5xl mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-6 md:p-8">
            
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {{-- Título / Icono --}}
                <div class="flex items-center gap-4 w-full lg:w-auto border-b lg:border-b-0 border-gray-100 pb-4 lg:pb-0">
                    <div class="w-12 h-12 rounded-full bg-brandTeal/10 flex items-center justify-center text-brandTeal shrink-0">
                        <i class="fa-regular fa-calendar-check text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 whitespace-nowrap">Agenda tu Sesión</h3>
                </div>

                {{-- Formulario Horizontal --}}
                <div class="flex flex-col md:flex-row w-full gap-4">
                    
                    {{-- Campo: Fecha (Calendario Desplegable) --}}
                    <div class="relative w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-regular fa-calendar text-gray-400"></i>
                        </div>
                        <input type="date" 
                               class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brandTeal focus:border-brandTeal sm:text-sm transition duration-150 ease-in-out cursor-pointer"
                               placeholder="Selecciona fecha">
                    </div>

                    {{-- Campo: Actividad (Select) --}}
                    <div class="relative w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-solid fa-dumbbell text-gray-400"></i>
                        </div>
                        <select class="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brandTeal focus:border-brandTeal sm:text-sm appearance-none transition duration-150 ease-in-out cursor-pointer">
                            <option value="" disabled selected>Selecciona actividad</option>
                            <option value="crossfit">CrossFit</option>
                            <option value="entrenamiento_personal">Entrenamiento Personal</option>
                            <option value="spinning">Spinning</option>
                        </select>
                        {{-- Flecha custom --}}
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <i class="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                    </div>

                    {{-- Botón: Buscar --}}
                    <a href="{{ route('booking.view') }}" class="w-full md:w-auto bg-brandTeal text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-opacity-90 hover:shadow-lg transition flex items-center justify-center whitespace-nowrap">
                        Buscar Horarios
                    </a>

                </div>

            </div>
        </div>
    </section>

    {{-- 4. SECCIÓN IMAGEN + TEXTO (ZIG-ZAG) --}}
    <section class="py-12 md:py-24 bg-brandAqua/20 overflow-hidden mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div class="w-full md:w-1/2 reveal">
                <div class="relative rounded-2xl overflow-hidden shadow-2xl transform md:-rotate-2 hover:rotate-0 transition duration-500">
                    <img src="{{ asset('img/entrenador.png') }}" 
                         alt="Estilo de vida activo" 
                         class="w-full h-[400px] object-cover"
                         onerror="this.src='https://images.unsplash.com/photo-1552674605-469555942c77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <p class="text-white font-bold text-lg">"Tu cuerpo es tu vehículo más importante"</p>
                    </div>
                </div>
            </div>
            <div class="w-full md:w-1/2 reveal text-center md:text-left">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6 leading-tight">
                    Rompe con el <br><span class="text-brandCoral">sedentarismo</span>
                </h2>
                <p class="text-lg text-gray-700 mb-6 leading-relaxed">
                    Vivimos en una sociedad que nos empuja a estar sentados. En Factomove no solo te damos una rutina de gimnasio; te damos las herramientas para monitorizar tu actividad diaria y cambiar tus hábitos.
                </p>
                <div class="space-y-4">
                    <div class="flex items-center gap-4 justify-center md:justify-start bg-white/50 p-4 rounded-lg">
                        <i class="fa-solid fa-check text-brandTeal text-xl"></i>
                        <span class="text-gray-800 font-medium">Monitorización de actividad diaria</span>
                    </div>
                    <div class="flex items-center gap-4 justify-center md:justify-start bg-white/50 p-4 rounded-lg">
                        <i class="fa-solid fa-check text-brandTeal text-xl"></i>
                        <span class="text-gray-800 font-medium">Planes adaptados a tu ritmo de vida</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- CTA FINAL --}}
    <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4 text-center reveal">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">¿Listo para darle vida a tus años?</h2>
            <p class="text-xl text-gray-500 mb-10">
                No esperes al lunes. El mejor momento para empezar a cuidar de tu cuerpo es ahora mismo.
            </p>
            <a href="{{ route('booking.view') }}" class="inline-flex items-center justify-center bg-brandCoral text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:bg-opacity-90 hover:shadow-2xl hover:-translate-y-1 transition transform duration-200">
                <span>Empezar a Entrenar Hoy</span>
                <i class="fa-solid fa-calendar-check ml-3"></i>
            </a>
        </div>
    </section>

    <x-footers.footer_welcome />

@endsection