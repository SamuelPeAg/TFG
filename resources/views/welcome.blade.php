@extends('layouts.landing')

@section('content')

    <header class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brandAqua blur-3xl opacity-50"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-brandAqua blur-3xl opacity-50"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 reveal">
                Bienvenido a <span class="text-brandTeal">Factomove</span>
            </h1>
            
            <p class="mt-4 max-w-3xl mx-auto text-xl text-gray-600 mb-10 reveal">
                La plataforma que conecta a <span class="font-bold text-brandCoral">clientes</span>, 
                <span class="font-bold text-brandCoral">entrenadores</span> y 
                <span class="font-bold text-brandCoral">administradores</span> en un mismo lugar. 
                Gestiona sesiones, datos y progreso de forma sencilla.
            </p>

            <div class="flex flex-col sm:flex-row justify-center gap-4 mb-16 reveal">
                @if (Route::has('register'))
                    <a href="{{ route('register') }}" class="bg-brandCoral text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 hover:shadow-brandCoral/50 transition transform hover:-translate-y-1">
                        Crear cuenta
                    </a>
                @endif
                @if (Route::has('login'))
                    <a href="{{ route('login') }}" class="border-2 border-brandTeal text-brandTeal px-8 py-4 rounded-full font-bold text-lg hover:bg-brandTeal hover:text-white transition">
                        Iniciar sesión
                    </a>
                @endif
            </div>

            <div class="relative max-w-5xl mx-auto reveal">
                <div class="aspect-video rounded-2xl border-4 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 group hover:border-brandTeal hover:bg-brandTeal/5 transition-colors duration-300">
                    <i class="fa-solid fa-image text-5xl mb-4 group-hover:scale-110 transition-transform"></i>
                    <span class="font-bold text-lg">[Espacio para imagen principal]</span>
                    <span class="text-sm mt-2">(Entrenamiento / Salud / Movimiento)</span>
                </div>
            </div>
        </div>
    </header>

    <section id="roles" class="py-20 bg-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16 reveal">
                <h2 class="text-brandTeal font-bold tracking-wide uppercase text-sm">Roles del sistema</h2>
                <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Una experiencia adaptada a cada rol
                </p>
                <p class="mt-4 max-w-2xl mx-auto text-gray-500">
                    Factomove se adapta al tipo de usuario que accede al sistema, ofreciendo herramientas específicas para cada necesidad.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                
                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group">
                    <div class="w-14 h-14 rounded-xl bg-brandTeal/10 flex items-center justify-center mb-6 text-brandTeal">
                        <i class="fa-solid fa-user text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Cliente</h3>
                    <p class="text-gray-600 mb-6">Visualiza tus rutinas, sesiones y progreso de forma clara. Recibe recordatorios y seguimiento de tus entrenadores.</p>
                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
                        [Imagen Cliente]
                    </div>
                </div>

                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group" style="transition-delay: 100ms;">
                    <div class="w-14 h-14 rounded-xl bg-brandCoral/10 flex items-center justify-center mb-6 text-brandCoral">
                        <i class="fa-solid fa-stopwatch text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Entrenador</h3>
                    <p class="text-gray-600 mb-6">Gestiona tus clientes, crea planes de entrenamiento y controla la asistencia y resultados, todo desde un panel único.</p>
                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
                        [Imagen Entrenador]
                    </div>
                </div>

                <div class="bg-gray-50 p-6 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent hover:border-brandAqua reveal group" style="transition-delay: 200ms;">
                    <div class="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center mb-6 text-gray-700">
                        <i class="fa-solid fa-lock text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Modo Admin</h3>
                    <p class="text-gray-600 mb-6">Administra usuarios, permisos y estadísticas globales de la plataforma para tomar mejores decisiones.</p>
                    <div class="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
                        [Imagen Admin]
                    </div>
                </div>

            </div>
        </div>
    </section>

    <section class="py-20 bg-brandAqua/20 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            
            <div class="md:w-1/2 reveal">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                    Factomove simplifica la <br><span class="text-brandTeal">gestión del movimiento</span>
                </h2>
                <p class="text-lg text-gray-700 mb-6">
                    Diseñada para centros deportivos, entrenadores personales y personas que quieren mejorar su salud. Toda la información se organiza por roles, ofreciendo una experiencia clara y adaptada.
                </p>
                <div class="flex items-start gap-4 mb-4">
                    <i class="fa-solid fa-check-circle text-brandCoral mt-1"></i>
                    <p class="text-gray-600">Desde el panel de inicio podrás ver los datos más importantes de un vistazo.</p>
                </div>
                <div class="flex items-start gap-4">
                    <i class="fa-solid fa-check-circle text-brandCoral mt-1"></i>
                    <p class="text-gray-600">Sesiones próximas, progreso, avisos y estadísticas al alcance de tu mano.</p>
                </div>
            </div>

            <div class="md:w-1/2 w-full reveal">
                <div class="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl flex flex-col justify-center items-center">
                    <div class="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                    <div class="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div class="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                    <div class="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                    
                    <div class="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col items-center justify-center text-center p-4">
                        <div class="bg-gray-100 p-6 rounded-full mb-4">
                            <i class="fa-solid fa-mobile-screen text-4xl text-brandTeal"></i>
                        </div>
                        <span class="font-bold text-gray-400">[Mockup de la App]</span>
                        <span class="text-xs text-gray-400 mt-2">Móvil o Escritorio</span>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <section id="features" class="py-20 relative">
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
                <a href="{{ route('register') }}" class="inline-block bg-brandCoral text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-200">
                    Comenzar Ahora
                </a>
            </div>
        </div>
    </section>
@endsection