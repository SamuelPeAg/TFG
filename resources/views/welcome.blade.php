@extends('components.headers.header_welcome')
{{-- Nota: No hace falta poner dos @extends, con el del header y llamando al footer abajo suele bastar, o usar un layout maestro --}}

@section('content')

    {{-- SECCIÓN ROLES --}}
    <section id="roles" class="py-12 md:py-20 bg-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12 md:mb-16 reveal">
                <h2 class="text-brandTeal font-bold tracking-wide uppercase text-xs md:text-sm">Roles del sistema</h2>
                <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Una experiencia adaptada a cada rol
                </p>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                    Factomove se adapta al tipo de usuario que accede al sistema, ofreciendo herramientas específicas para cada necesidad.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                
                {{-- Card Cliente --}}
                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group">
                    <div class="w-14 h-14 rounded-xl bg-brandTeal/10 flex items-center justify-center mb-6 text-brandTeal">
                        <i class="fa-solid fa-user text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Cliente</h3>
                    <p class="text-gray-600 mb-6 text-sm md:text-base">Visualiza tus rutinas, sesiones y progreso de forma clara. Recibe recordatorios y seguimiento de tus entrenadores.</p>

                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden relative">
                        {{-- Añadido 'object-top' para que si se corta la imagen, se vea la parte de arriba --}}
                        <img src="{{ asset('img/cliente.png') }}" alt="Cliente" class="w-full h-full object-cover object-top">
                    </div>
                </div>

                {{-- Card Entrenador --}}
                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group" style="transition-delay: 100ms;">
                    <div class="w-14 h-14 rounded-xl bg-brandCoral/10 flex items-center justify-center mb-6 text-brandCoral">
                        <i class="fa-solid fa-stopwatch text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Entrenador</h3>
                    <p class="text-gray-600 mb-6 text-sm md:text-base">Gestiona tus clientes, crea planes de entrenamiento y controla la asistencia y resultados, todo desde un panel único.</p>
                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden relative">
                        <img src="{{ asset('img/entrenador.png') }}" alt="Entrenador" class="w-full h-full object-cover object-top">
                    </div>
                </div>

                {{-- Card Admin --}}
                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group" style="transition-delay: 200ms;">
                    <div class="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center mb-6 text-gray-700">
                        <i class="fa-solid fa-lock text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Admin</h3>
                    <p class="text-gray-600 mb-6 text-sm md:text-base">Administra usuarios, permisos y estadísticas globales de la plataforma para tomar mejores decisiones.</p>
                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden relative">
                        <img src="{{ asset('img/admin.png') }}" alt="Admin" class="w-full h-full object-cover object-top">
                    </div>
                </div>

            </div>
        </div>
    </section>

    {{-- SECCIÓN INFO + MOCKUP --}}
    <section class="py-12 md:py-20 bg-brandAqua/20 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            
            {{-- Texto --}}
            <div class="w-full md:w-1/2 reveal text-center md:text-left">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6 leading-tight">
                    Factomove simplifica la <br><span class="text-brandTeal">gestión del movimiento</span>
                </h2>
                <p class="text-lg text-gray-700 mb-6">
                    Diseñada para centros deportivos, entrenadores personales y personas que quieren mejorar su salud. Toda la información se organiza por roles, ofreciendo una experiencia clara y adaptada.
                </p>
                <div class="flex items-start gap-4 mb-4 justify-center md:justify-start">
                    <i class="fa-solid fa-check-circle text-brandCoral mt-1 shrink-0"></i>
                    <p class="text-gray-600 text-left">Desde el panel de inicio podrás ver los datos más importantes de un vistazo.</p>
                </div>
                <div class="flex items-start gap-4 justify-center md:justify-start">
                    <i class="fa-solid fa-check-circle text-brandCoral mt-1 shrink-0"></i>
                    <p class="text-gray-600 text-left">Sesiones próximas, progreso, avisos y estadísticas al alcance de tu mano.</p>
                </div>
            </div>

            {{-- Mockup Teléfono --}}
            <div class="w-full md:w-1/2 reveal flex justify-center mt-8 md:mt-0">
                {{-- Añadida transformación scale para que en móviles pequeños no ocupe tanto --}}
                <div class="transform scale-90 md:scale-100 origin-center">
                    <div class="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col justify-center items-center">
                        <div class="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                        <div class="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                        <div class="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                        <div class="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                        
                        <div class="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                            <img src="{{ asset('img/mockup.png') }}" 
                                 alt="App Mockup" 
                                 class="w-full h-full object-cover">
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    {{-- SECCIÓN FEATURES --}}
    <section id="features" class="py-12 md:py-20 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-12 reveal">
                ¿Por qué Factomove?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div class="text-center p-6 reveal">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brandTeal/10 text-brandTeal mb-6">
                        <i class="fa-solid fa-layer-group text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Todo en un mismo lugar</h3>
                    <p class="text-gray-600">
                        Centraliza la gestión de usuarios, sesiones y pagos sin perder tiempo en hojas de cálculo o múltiples herramientas.
                    </p>
                </div>

                <div class="text-center p-6 reveal" style="transition-delay: 100ms;">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brandCoral/10 text-brandCoral mb-6">
                        <i class="fa-solid fa-chart-line text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Seguimiento real del progreso</h3>
                    <p class="text-gray-600">
                        Registra entrenamientos, objetivos y mejoras para que cada cliente vea cómo avanza día a día.
                    </p>
                </div>

                <div class="text-center p-6 reveal" style="transition-delay: 200ms;">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-700 mb-6">
                        <i class="fa-solid fa-user-shield text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Roles y accesos seguros</h3>
                    <p class="text-gray-600">
                        Cada usuario ve solo lo que necesita gracias a un sistema de roles basado en el correo con el que inicia sesión.
                    </p>
                </div>
            </div>
            
            <div class="mt-16 text-center reveal">
                <a href="{{ route('register') }}" class="inline-block bg-brandCoral text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-200 w-full sm:w-auto">
                    Comenzar Ahora
                </a>
            </div>
        </div>
    </section>
  
    {{-- AQUI AÑADIMOS EL FOOTER --}}
    <x-footers.footer_welcome />

@endsection