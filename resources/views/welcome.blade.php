@extends('components.headers.header_welcome')

@section('content')

    {{-- 1. HERO SECTION MODERNIZADO --}}
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-50">
        {{-- Fondos Abstractos (Mesh Gradients) --}}
        <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brandTeal/20 rounded-full blur-[100px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brandCoral/15 rounded-full blur-[120px]"></div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
                <span class="w-2 h-2 rounded-full bg-brandCoral animate-ping"></span>
                <span class="text-xs font-bold tracking-wider text-gray-500 uppercase">Factomove Lifestyle</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-gray-900 tracking-tight leading-none mb-8">
                El movimiento <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brandCoral to-brandTeal">es medicina.</span>
            </h1>

            <p class="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
                Tu cuerpo no está diseñado para estar quieto. <br>
                <span class="font-medium text-gray-900">Empieza hoy tu cambio real.</span>
            </p>

            <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <a href="#reservas" class="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-brandTeal transition-all duration-300 shadow-lg hover:shadow-brandTeal/50 transform hover:-translate-y-1">
                    Reservar Sesión
                </a>
                <a href="#filosofia" class="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all duration-300">
                    Nuestra Filosofía
                </a>
            </div>
        </div>
    </section>

    {{-- 2. FILOSOFÍA (DISEÑO ASIMÉTRICO / BENTO) --}}
    <section id="filosofia" class="py-24 bg-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-16 text-center md:text-left">
                <h2 class="text-brandTeal font-bold tracking-widest uppercase text-sm mb-2">Por qué Factomove</h2>
                <h3 class="text-4xl font-extrabold text-gray-900">Más allá de la estética</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 bg-gray-50 rounded-3xl p-8 md:p-12 hover:shadow-xl transition-shadow duration-300 border border-gray-100 group relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-64 h-64 bg-brandTeal/10 rounded-full blur-3xl group-hover:bg-brandTeal/20 transition-all"></div>
                    <div class="relative z-10">
                        <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brandTeal text-3xl shadow-sm mb-6">
                            <i class="fa-solid fa-heart-pulse"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-gray-900 mb-3">Salud Metabólica</h4>
                        <p class="text-gray-600 text-lg leading-relaxed max-w-lg">
                            El movimiento regula tus hormonas y mantiene tu corazón fuerte. No se trata solo de verse bien, sino de que tu cuerpo funcione como una máquina perfecta.
                        </p>
                    </div>
                </div>

                <div class="bg-brandCoral text-white rounded-3xl p-8 md:p-12 shadow-lg shadow-brandCoral/30 transform transition-transform hover:-translate-y-1">
                    <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 backdrop-blur-sm">
                        <i class="fa-solid fa-brain"></i>
                    </div>
                    <h4 class="text-xl font-bold mb-3">Claridad Mental</h4>
                    <p class="text-white/90 leading-relaxed">
                        Reduce el estrés y la ansiedad a través de la liberación de neurotransmisores.
                    </p>
                </div>

                <div class="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 hover:border-brandAqua transition-colors duration-300">
                    <div class="w-14 h-14 bg-brandAqua/20 rounded-2xl flex items-center justify-center text-brandTeal text-2xl mb-6">
                        <i class="fa-solid fa-person-running"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-3">Funcionalidad</h4>
                    <p class="text-gray-600 leading-relaxed">
                        Entrenamos para la vida real. Gana vitalidad para afrontar tu día a día sin dolores.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {{-- 3. ROMPE EL SEDENTARISMO --}}
    <section class="py-24 bg-gray-900 text-white relative overflow-hidden">
        {{-- Decoración de fondo --}}
        <div class="absolute top-0 right-0 w-1/2 h-full bg-brandTeal/5 skew-x-12"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div class="w-full md:w-1/2">
                <div class="relative group">
                    <div class="absolute -inset-1 bg-gradient-to-r from-brandCoral to-brandTeal rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div class="relative rounded-2xl overflow-hidden ring-1 ring-gray-800">
                        <img src="{{ asset('img/entrenador.png') }}" class="w-full object-cover transform transition duration-500 group-hover:scale-105" alt="Entrenador Factomove">
                    </div>
                </div>
            </div>
            
            <div class="w-full md:w-1/2">
                <h2 class="text-3xl md:text-5xl font-black mb-6 leading-tight">
                    Rompe con el <br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-brandCoral to-white">sedentarismo.</span>
                </h2>
                <p class="text-gray-400 text-lg mb-8 leading-relaxed">
                    Vivimos en una sociedad que nos empuja a estar sentados. En <strong class="text-white">Factomove</strong> utilizamos tecnología y metodología para monitorizar tu actividad diaria y asegurar que el cambio sea real y sostenible.
                </p>

                <ul class="space-y-4">
                    <li class="flex items-center gap-4">
                        <div class="w-8 h-8 rounded-full bg-brandTeal flex items-center justify-center text-xs">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <span class="font-medium text-gray-200">Monitorización de actividad diaria</span>
                    </li>
                    <li class="flex items-center gap-4">
                        <div class="w-8 h-8 rounded-full bg-brandCoral flex items-center justify-center text-xs">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <span class="font-medium text-gray-200">Planes 100% adaptados a tu ritmo</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>

    {{-- 4. SELECCIÓN DE CENTRO (INTEGRADO CON TU CALENDAR.BLADE.PHP) --}}
    <section id="reservas" class="py-24 bg-gray-50 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-brandTeal font-bold tracking-widest uppercase text-sm mb-2">Empieza ahora</h2>
                <h3 class="text-4xl md:text-5xl font-black text-gray-900">Elige tu espacio</h3>
                <p class="mt-4 text-gray-500">Selecciona dónde quieres entrenar hoy</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {{-- CENTRO AIRA --}}
                {{-- Nota: Esto apunta a la ruta que carga views/booking/calendar.blade.php --}}
                <a href="{{ route('booking.view', ['center' => 'AIRA']) }}" class="group bg-white rounded-[2rem] p-2 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div class="bg-gray-50 rounded-[1.5rem] p-8 h-full flex flex-col items-center text-center border border-transparent group-hover:border-brandTeal/30 transition-colors">
                        <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl text-brandTeal shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <i class="fa-solid fa-dumbbell"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-gray-900 mb-2">Centro AIRA</h4>
                        <p class="text-sm text-gray-500 mb-8">Maquinaria especializada y fuerza.</p>
                        
                        <div class="mt-auto w-full">
                            <span class="block w-full py-3 rounded-xl bg-brandTeal text-white font-bold text-sm group-hover:bg-gray-900 transition-colors">
                                Ver Horario AIRA
                            </span>
                        </div>
                    </div>
                </a>

                {{-- CENTRO OPEN --}}
                <a href="{{ route('booking.view', ['center' => 'OPEN']) }}" class="group bg-white rounded-[2rem] p-2 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div class="bg-gray-50 rounded-[1.5rem] p-8 h-full flex flex-col items-center text-center border border-transparent group-hover:border-brandCoral/30 transition-colors">
                        <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl text-brandCoral shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <i class="fa-solid fa-sun"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-gray-900 mb-2">Centro OPEN</h4>
                        <p class="text-sm text-gray-500 mb-8">Aire libre y entrenamiento funcional.</p>
                        
                        <div class="mt-auto w-full">
                            <span class="block w-full py-3 rounded-xl bg-brandCoral text-white font-bold text-sm group-hover:bg-gray-900 transition-colors">
                                Ver Horario OPEN
                            </span>
                        </div>
                    </div>
                </a>

                {{-- VIRTUAL --}}
                <a href="{{ route('booking.view', ['center' => 'VIRTUAL']) }}" class="group bg-white rounded-[2rem] p-2 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div class="bg-gray-50 rounded-[1.5rem] p-8 h-full flex flex-col items-center text-center border border-transparent group-hover:border-brandAqua/50 transition-colors">
                        <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl text-brandAqua shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <i class="fa-solid fa-laptop"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-gray-900 mb-2">VIRTUAL</h4>
                        <p class="text-sm text-gray-500 mb-8">Entrena desde casa o viaje.</p>
                        
                        <div class="mt-auto w-full">
                            <span class="block w-full py-3 rounded-xl bg-teal-400 text-white font-bold text-sm group-hover:bg-gray-900 transition-colors">
                                Ver Horario VIRTUAL
                            </span>
                        </div>
                    </div>
                </a>

            </div>
        </div>
    </section>

    <div class="border-t border-gray-100"></div>

    <x-footers.footer_welcome />

@endsection