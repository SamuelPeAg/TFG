<@extends('components.headers.header_welcome')

@section('content')

    {{-- SECCIÓN HERO COMPACTA --}}
    <section class="bg-gradient-to-br from-white via-brandTeal/5 to-brandCoral/5 pb-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 pb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Contáctanos
            </h1>
            <p class="text-base text-gray-600 max-w-xl mx-auto">
                Elige tu centro favorito o envíanos un mensaje
            </p>
        </div>
    </section>

    {{-- SECCIÓN PRINCIPAL: CENTROS + FORMULARIO --}}
    <section class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {{-- Grid de 2 columnas: Centros a la izquierda, Formulario a la derecha --}}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {{-- COLUMNA IZQUIERDA: CENTROS --}}
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 Centros</h2>
                    
                    <div class="space-y-4">
                        
                        {{-- Centro AIRA --}}
                        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                            <div class="flex flex-col sm:flex-row">
                                <div class="sm:w-2/5 h-40 sm:h-auto relative">
                                    <iframe
                                        class="absolute inset-0 w-full h-full"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12594.463651533495!2d-4.780209212841773!3d37.89266410000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6cdf7288300331%3A0x1bd6b7761e69d9a9!2sMoverte%20da%20vida%20-%20Aira%20fitness%20club!5e0!3m2!1ses!2ses!4v1768325180952!5m2!1ses!2ses"
                                        style="border:0;" allowfullscreen="" loading="lazy">
                                    </iframe>
                                </div>
                                <div class="sm:w-3/5 p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="bg-brandTeal text-white px-2 py-1 rounded-full text-xs font-bold">AIRA</span>
                                        <h3 class="text-lg font-bold text-gray-900">Aira Fitness Club</h3>
                                    </div>
                                    <div class="space-y-1 text-sm text-gray-600">
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-map-marker-alt text-brandTeal w-4"></i>
                                            Córdoba, España
                                        </p>
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-dumbbell text-brandTeal w-4"></i>
                                            Maquinaria especializada
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- Centro OPEN --}}
                        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                            <div class="flex flex-col sm:flex-row">
                                <div class="sm:w-2/5 h-40 sm:h-auto relative">
                                    <iframe
                                        class="absolute inset-0 w-full h-full"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d21986110736b%3A0xd2b686fab1dd9bb5!2sMoverte%20da%20Vida%20-%20Open%20Arena!5e0!3m2!1ses!2ses!4v1768325263249!5m2!1ses!2ses"
                                        style="border:0;" allowfullscreen="" loading="lazy">
                                    </iframe>
                                </div>
                                <div class="sm:w-3/5 p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="bg-brandCoral text-white px-2 py-1 rounded-full text-xs font-bold">OPEN</span>
                                        <h3 class="text-lg font-bold text-gray-900">Open Arena</h3>
                                    </div>
                                    <div class="space-y-1 text-sm text-gray-600">
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-map-marker-alt text-brandCoral w-4"></i>
                                            Córdoba, España
                                        </p>
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-sun text-brandCoral w-4"></i>
                                            Aire libre y funcional
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- Centro PRINCIPAL --}}
                        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                            <div class="flex flex-col sm:flex-row">
                                <div class="sm:w-2/5 h-40 sm:h-auto relative">
                                    <iframe
                                        class="absolute inset-0 w-full h-full"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e0!3m2!1ses!2ses!4v1768326010698!5m2!1ses!2ses"
                                        style="border:0;" allowfullscreen="" loading="lazy">
                                    </iframe>
                                </div>
                                <div class="sm:w-3/5 p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="bg-brandAqua text-gray-900 px-2 py-1 rounded-full text-xs font-bold">PRINCIPAL</span>
                                        <h3 class="text-lg font-bold text-gray-900">Centro Principal</h3>
                                    </div>
                                    <div class="space-y-1 text-sm text-gray-600">
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-map-marker-alt text-brandTeal w-4"></i>
                                            Córdoba, España
                                        </p>
                                        <p class="flex items-center gap-2">
                                            <i class="fas fa-heart-pulse text-brandTeal w-4"></i>
                                            Salud y ejercicio
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {{-- Información de contacto --}}
                    <div class="mt-8 p-6 bg-gray-50 rounded-xl">
                        <h3 class="font-bold text-gray-900 mb-4">Información de Contacto</h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-brandTeal/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-envelope text-brandTeal"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-700">Email</p>
                                    <a href="mailto:hola@factomove.com" class="text-brandTeal hover:underline">
                                        hola@factomove.com
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-brandCoral/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-phone text-brandCoral"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-700">Teléfono</p>
                                    <a href="tel:+34912345678" class="text-brandCoral hover:underline">
                                        +34 912 345 678
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- COLUMNA DERECHA: FORMULARIO --}}
                <div>
                    <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Envíanos un Mensaje</h2>
                        <p class="text-sm text-gray-600 mb-6">Te responderemos lo antes posible</p>

                        @if(session('success'))
                            <div class="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm">
                                <i class="fas fa-check-circle mr-2"></i>
                                {{ session('success') }}
                            </div>
                        @endif

                        @if(session('error'))
                            <div class="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
                                <i class="fas fa-exclamation-circle mr-2"></i>
                                {{ session('error') }}
                            </div>
                        @endif

                        <form action="{{ route('contact.send') }}" method="POST" class="space-y-4">
                            @csrf
                            
                            <div>
                                <label for="name" class="block text-sm font-semibold text-gray-700 mb-1">
                                    Nombre <span class="text-brandCoral">*</span>
                                </label>
                                <input type="text" id="name" name="name" value="{{ old('name') }}"
                                    class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm" 
                                    placeholder="Tu nombre completo" required>
                                @error('name')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">
                                    Email <span class="text-brandCoral">*</span>
                                </label>
                                <input type="email" id="email" name="email" value="{{ old('email') }}"
                                    class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm" 
                                    placeholder="tu@email.com" required>
                                @error('email')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="phone" class="block text-sm font-semibold text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input type="tel" id="phone" name="phone" value="{{ old('phone') }}"
                                    class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm" 
                                    placeholder="+34 600 000 000">
                                @error('phone')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="message" class="block text-sm font-semibold text-gray-700 mb-1">
                                    Mensaje <span class="text-brandCoral">*</span>
                                </label>
                                <textarea id="message" name="message" rows="4"
                                    class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition resize-none text-sm" 
                                    placeholder="Cuéntanos cómo podemos ayudarte..." required>{{ old('message') }}</textarea>
                                @error('message')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>

                            <button type="submit" class="w-full bg-gradient-to-r from-brandTeal to-brandCoral text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
                                <i class="fas fa-paper-plane mr-2"></i>
                                ENVIAR MENSAJE
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    </section>

    {{-- FOOTER --}}
    <x-footers.footer_welcome />

@endsection