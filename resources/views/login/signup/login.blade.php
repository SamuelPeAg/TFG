@extends('components.headers.header_welcome') 

@section('content')

    {{-- 
        CAMBIO 1: 
        Moví el gradiente (bg-gradient...) AQUI, al contenedor padre.
        Así el color cubre toda la pantalla, incluyendo el espacio del padding superior.
    --}}
    <div class="flex flex-col min-h-screen pt-24 lg:pt-28 bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40">

        {{-- 
            CAMBIO 2: 
            Quité las clases del gradiente de este div para evitar duplicarlas.
        --}}
        <div class="flex-grow flex items-center justify-center p-4 sm:p-8">
            
            {{-- TARJETA DE LOGIN --}}
            <div class="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">
                
                {{-- Encabezado de la Tarjeta --}}
                <div class="px-8 pt-12 pb-6 text-center">
                    
                    {{-- LOGO --}}
                    <img src="{{ asset('img/logopng.png') }}" 
                         alt="Factomove Logo" 
                         class="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300">
                    
                    <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">¡Hola de nuevo!</h2>
                    <p class="mt-2 text-sm text-gray-500">Ingresa a tu panel de control</p>
                </div>

                {{-- Formulario --}}
                <div class="px-8 pb-10">
                    <form method="POST" action="{{ route('login') }}" class="space-y-5">
                        @csrf
                        
                        {{-- Input Usuario --}}
                        <div class="group">
                            <label for="name" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Usuario</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-user text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="text" id="name" name="name" value="{{ old('name') }}" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400" 
                                    placeholder="Ej. JuanPerez" required autofocus>
                            </div>
                            @error('name')
                                <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Input Contraseña --}}
                        <div class="group">
                            <div class="flex justify-between items-center mb-1 ml-1">
                                <label for="password" class="block text-xs font-bold text-gray-500 uppercase tracking-wide">Contraseña</label>
                                <a href="#" class="text-xs text-brandTeal hover:underline">¿Olvidaste tu contraseña?</a>
                            </div>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-lock text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="password" id="password" name="password" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400" 
                                    placeholder="••••••••" required autocomplete="current-password">
                            </div>
                            @error('password')
                                <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Botón Submit --}}
                        <button type="submit" class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                            INICIAR SESIÓN
                        </button>
                    </form>

                    {{-- Separador --}}
                    <div class="mt-8 relative">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-gray-200"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="px-4 bg-white text-xs text-gray-400 uppercase font-bold tracking-wider">O continúa con</span>
                        </div>
                    </div>

                    {{-- Redes Sociales --}}
                    <div class="mt-6 grid grid-cols-2 gap-4">
                        <a href="#" class="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition duration-200">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Google-flutter-logo.png" alt="Google" class="h-5 w-5 mr-2">
                            Google
                        </a>
                        <a href="#" class="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition duration-200">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" class="h-5 w-5 mr-2">
                            Facebook
                        </a>
                    </div>

                    {{-- Footer Tarjeta --}}
                    <p class="mt-8 text-center text-sm text-gray-600">
                        ¿Aún no eres miembro? 
                        <a href="{{ route('register') }}" class="font-bold text-brandTeal hover:text-teal-800 transition">
                            Crea una cuenta gratis
                        </a>
                    </p>
                </div>
            </div>
        </div>
        
        <x-footers.footer_welcome />

    </div>

@endsection