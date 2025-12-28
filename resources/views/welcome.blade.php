@extends('components.headers.header_welcome')

@section('content')

    {{-- 1. HERO SECTION --}}
    <section class="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-white overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brandAqua blur-3xl"></div>
            <div class="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-brandTeal blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
            <h1 class="text-4xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                El movimiento <span class="highlight-coral text-brandCoral">es medicina</span>, <br>
                el movimiento <span class="highlight-teal text-brandTeal">da vida</span>.
            </h1>
            <p class="mt-8 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed italic">
                No estamos diseñados para estar quietos. <br>
                <span class="font-bold text-gray-800 not-italic">Tu salud empieza con tu próxima decisión.</span>
            </p>
        </div>
    </section>

    {{-- 2. SECCIÓN FILOSOFÍA --}}
    <section class="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16 reveal">
                <h2 class="text-brandTeal font-bold tracking-widest uppercase text-sm mb-2">Nuestra Filosofía</h2>
                <h3 class="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Más allá de la estética
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-l-8 border-brandTeal reveal group">
                    <div class="w-14 h-14 rounded-xl bg-brandTeal flex items-center justify-center mb-6 text-white shadow-lg">
                        <i class="fa-solid fa-heart-pulse text-2xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Salud Metabólica</h4>
                    <p class="text-gray-600">El movimiento regula tus hormonas y mantiene tu corazón fuerte.</p>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-l-8 border-brandCoral reveal group">
                    <div class="w-14 h-14 rounded-xl bg-brandCoral flex items-center justify-center mb-6 text-white shadow-lg">
                        <i class="fa-solid fa-brain text-2xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Claridad Mental</h4>
                    <p class="text-gray-600">Libera neurotransmisores que reducen el estrés y la ansiedad.</p>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-l-8 border-brandAqua reveal group">
                    <div class="w-14 h-14 rounded-xl bg-brandTeal flex items-center justify-center mb-6 text-white shadow-lg">
                        <i class="fa-solid fa-person-running text-2xl"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Funcionalidad</h4>
                    <p class="text-gray-600">Entrenamos para la vida real. Vitalidad para tu día a día.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- 3. SECCIÓN IMAGEN + TEXTO --}}
    <section class="py-12 md:py-24 bg-white overflow-hidden mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div class="w-full md:w-1/2 reveal">
                <div class="relative">
                    <div class="absolute -top-4 -left-4 w-full h-full border-4 border-brandAqua rounded-2xl z-0"></div>
                    <div class="relative rounded-2xl overflow-hidden shadow-2xl z-10">
                        <img src="{{ asset('img/entrenador.png') }}" class="w-full h-[400px] object-cover" onerror="this.src='https://images.unsplash.com/photo-1552674605-469555942c77?w=800';">
                    </div>
                </div>
            </div>
            <div class="w-full md:w-1/2 reveal">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6 leading-tight">
                    Rompe con el <br><span class="text-brandCoral">sedentarismo</span>
                </h2>
                <p class="text-lg text-gray-700 mb-8 leading-relaxed">
                    Vivimos en una sociedad que nos empuja a estar sentados. En **Factomove** monitorizamos tu actividad diaria para que el cambio sea real.
                </p>
                <div class="space-y-4">
                    <div class="flex items-center gap-4 p-4 rounded-xl border border-brandTeal/20 bg-brandTeal/5">
                        <i class="fa-solid fa-circle-check text-brandTeal text-xl"></i>
                        <span class="text-gray-800 font-medium">Monitorización de actividad diaria</span>
                    </div>
                    <div class="flex items-center gap-4 p-4 rounded-xl border border-brandCoral/20 bg-brandCoral/5">
                        <i class="fa-solid fa-circle-check text-brandCoral text-xl"></i>
                        <span class="text-gray-800 font-medium">Planes adaptados a tu ritmo</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- 4. CTA FINAL (REDISEÑADO CON GRADIENTE SUAVE) --}}
    <section class="relative py-24 mb-12 overflow-hidden">
        {{-- Fondo con gradiente circular suave de tus colores --}}
        <div class="absolute inset-0 z-0 bg-gradient-to-tr from-brandAqua/10 via-white to-brandCoral/10"></div>
        
        {{-- Decoración: líneas de marca --}}
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-brandTeal to-transparent"></div>

        <div class="max-w-4xl mx-auto px-4 text-center reveal relative z-10">
            <h2 class="text-4xl font-extrabold text-gray-900 mb-6">¿Listo para darle vida a tus años?</h2>
            <p class="text-xl text-gray-500 mb-10">
                El mejor momento para empezar a cuidar de tu cuerpo es ahora mismo.
            </p>
            <a href="{{ route('booking.view') }}" class="inline-flex items-center justify-center bg-brandTeal text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg shadow-brandTeal/30 hover:bg-brandCoral hover:shadow-brandCoral/30 transition-all duration-300 transform hover:-translate-y-1">
                <span>Reservar mi Sesión</span>
                <i class="fa-solid fa-arrow-right ml-3"></i>
            </a>
        </div>
    </section>

    {{-- Separador físico antes del footer --}}
    <div class="border-t border-gray-100 mx-auto max-w-5xl"></div>

    <x-footers.footer_welcome />

@endsection