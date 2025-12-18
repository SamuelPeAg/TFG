@extends('components.headers.header_welcome') 

@section('content')

    {{-- CONTENEDOR PRINCIPAL --}}
    <div class="flex flex-col min-h-[calc(100vh-80px)]">

        {{-- === ÁREA CENTRAL (FONDO + FORMULARIO) === --}}
        <div class="flex-grow flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40">
            
            {{-- TARJETA DE REGISTRO --}}
            <div class="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">
                
                {{-- ENCABEZADO DE LA TARJETA --}}
                <div class="px-8 pt-10 pb-4 text-center">
                    <img src="{{ asset('img/logopng.png') }}" 
                         alt="Factomove Logo" 
                         class="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300">
                    
                    <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Únete a Factomove</h2>
                    <p class="mt-2 text-sm text-gray-500">
                        Crea tu cuenta y empieza a gestionar el movimiento.
                    </p>
                </div>

                {{-- FORMULARIO --}}
                <div class="px-8 pb-10">
                    {{-- Hemos añadido 'novalidate' para que Laravel tome el control del color rojo --}}
                    <form method="POST" action="{{ route('register') }}" class="space-y-4" novalidate>
                        @csrf
                        
                        {{-- 1. NOMBRE (PUEDE REPETIRSE - NO ÚNICO) --}}
                        <div class="group">
                            <label for="name" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Nombre Completo</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-user text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="text" name="name" value="{{ old('name') }}" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 
                                    {{ $errors->has('name') ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500' }}" 
                                    placeholder="Ej. MariaGarcia" required
                                    aria-label="Introduce tu nombre de usuario, entre 3 y 20 caracteres"> {{-- Aplicando ARIA Label --}}
                            </div>
                            @error('name') <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p> @enderror
                        </div>

                        {{-- 2. EMAIL (DEBE SER ÚNICO) --}}
                        <div class="group">
                            <label for="email" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Correo Electrónico</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="email" name="email" value="{{ old('email') }}" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800
                                    {{ $errors->has('email') ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500' }}" 
                                    placeholder="tucorreo@ejemplo.com" required
                                    aria-label="Introduce tu correo electrónico único">
                            </div>
                            @error('email') <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p> @enderror
                        </div>

                        {{-- 3. CONTRASEÑA (MÍNIMO 8 CARACTERES) --}}
                        <div class="group">
                            <label for="password" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Contraseña</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-lock text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="password" name="password" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800
                                    {{ $errors->has('password') ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500' }}" 
                                    placeholder="Mínimo 8 caracteres" required autocomplete="new-password"
                                    aria-label="Crea una contraseña de al menos 8 caracteres">
                            </div>
                            @error('password') <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p> @enderror
                        </div>

                        {{-- 4. REPETIR CONTRASEÑA (USA EL ERROR DE PASSWORD) --}}
                        <div class="group">
                            <label for="password_confirmation" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Confirmar Contraseña</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fa-solid fa-check-double text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                                </div>
                                <input type="password" name="password_confirmation" 
                                    class="block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800
                                    {{ $errors->has('password') ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500' }}" 
                                    placeholder="Repite tu contraseña" required
                                    aria-label="Confirma tu contraseña">
                            </div>
                        </div>

                        {{-- 5. TÉRMINOS Y CONDICIONES --}}
                        <div class="flex items-start mt-2">
                            <div class="flex items-center h-5">
                                <input id="terms" name="terms" type="checkbox" required 
                                    class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-500/30 text-green-600 cursor-pointer"
                                    aria-label="Aceptar términos y condiciones">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="terms" class="font-medium text-gray-600">
                                    He leído y acepto los <a href="{{ route('legal.notice') }}" class="text-brandTeal hover:underline font-bold">Términos y Condiciones</a>
                                </label>
                            </div>
                        </div>
                        @error('terms') <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p> @enderror

                        {{-- BOTÓN REGISTRAR --}}
                        <button type="submit" class="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                            CREAR CUENTA
                        </button>
                    </form>

                    {{-- ENLACE INICIAR SESIÓN --}}
                    <div class="mt-8 relative">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-gray-200"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="px-4 bg-white text-xs text-gray-400 uppercase font-bold tracking-wider">¿Ya tienes cuenta?</span>
                        </div>
                    </div>

                    <div class="mt-6 text-center">
                        <a href="{{ route('login') }}" class="inline-block text-brandTeal font-bold hover:text-teal-800 transition underline decoration-2 decoration-transparent hover:decoration-brandTeal">
                            Inicia sesión aquí
                        </a>
                    </div>

                </div>
            </div>
        </div>
        
        {{-- FOOTER GLOBAL --}}
        <x-footers.footer_welcome />

    </div>

@endsection