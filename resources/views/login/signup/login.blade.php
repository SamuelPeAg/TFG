@extends('components.headers.header_welcome') 

@section('content')

    {{-- Contenedor principal con menos padding superior --}}
    <div class="bg-gradient-to-br from-gray-50 via-brandTeal/10 to-brandCoral/10 pt-20">

        <div class="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            
            {{-- Grid de 2 columnas en desktop --}}
            <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                
                {{-- Columna izquierda: Información (solo desktop) --}}
                <div class="hidden lg:block">
                    <div class="text-center lg:text-left space-y-6">
                        <h1 class="text-5xl font-black text-gray-900 leading-tight">
                            Bienvenido a <br>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brandTeal to-brandCoral">Factomove</span>
                        </h1>
                        <p class="text-xl text-gray-600 leading-relaxed">
                            Accede a tu panel de gestión y lleva el control de tus entrenamientos, usuarios y pagos.
                        </p>
                        <div class="flex items-center gap-4 pt-4">
                            <div class="flex items-center gap-2">
                                <div class="w-12 h-12 rounded-full bg-brandTeal/20 flex items-center justify-center">
                                    <i class="fa-solid fa-dumbbell text-brandTeal text-xl"></i>
                                </div>
                                <span class="text-sm font-semibold text-gray-700">Gestión de Entrenadores</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <div class="w-12 h-12 rounded-full bg-brandCoral/20 flex items-center justify-center">
                                    <i class="fa-solid fa-users text-brandCoral text-xl"></i>
                                </div>
                                <span class="text-sm font-semibold text-gray-700">Control de Usuarios</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Columna derecha: Formulario de Login --}}
                <div class="w-full">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        
                        {{-- Encabezado compacto --}}
                        <div class="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-white to-gray-50">
                            
                            {{-- Logo más pequeño --}}
                            <img src="{{ asset('img/logopng.png') }}" 
                                 alt="Factomove Logo" 
                                 class="h-16 w-auto mx-auto mb-4">
                            
                            <h2 class="text-2xl font-bold text-gray-900">¡Hola de nuevo!</h2>
                            <p class="mt-1 text-sm text-gray-500">Ingresa a tu panel de control</p>
                        </div>

                        {{-- Formulario --}}
                        <div class="px-8 pb-8">
                            <form method="POST" action="{{ route('login') }}" class="space-y-4">
                                @csrf
                                
                                {{-- Input Email --}}
                                <div class="group">
                                    <label for="email" class="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i class="fa-solid fa-envelope text-brandTeal"></i>
                                        </div>
                                        <input type="email" id="email" name="email" value="{{ old('email') }}" 
                                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white focus:border-transparent outline-none transition text-sm font-medium text-gray-800 placeholder-gray-400" 
                                            placeholder="ejemplo@correo.com" required autofocus>
                                    </div>
                                    @error('email')
                                        <p class="mt-1 text-xs text-red-500 font-semibold">{{ $message }}</p>
                                    @enderror
                                </div>

                                {{-- Input Contraseña --}}
                                <div class="group">
                                    <div class="flex justify-between items-center mb-2">
                                        <label for="password" class="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                                            Contraseña
                                        </label>
                                        <a href="{{ route('password.request') }}" class="text-xs text-brandTeal hover:text-brandTeal/80 font-semibold">
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i class="fa-solid fa-lock text-brandCoral"></i>
                                        </div>
                                        <input type="password" id="password" name="password" 
                                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white focus:border-transparent outline-none transition text-sm font-medium text-gray-800 placeholder-gray-400" 
                                            placeholder="••••••••" required autocomplete="current-password">
                                    </div>
                                    @error('password')
                                        <p class="mt-1 text-xs text-red-500 font-semibold">{{ $message }}</p>
                                    @enderror
                                </div>

                                {{-- Botón Submit --}}
                                <button type="submit" class="w-full mt-6 flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                                    <i class="fa-solid fa-right-to-bracket mr-2"></i>
                                    INICIAR SESIÓN
                                </button>
                            </form>

                            {{-- Footer Tarjeta --}}
                            <p class="mt-6 text-center text-sm text-gray-600">
                                ¿Aún no eres miembro? 
                                <a href="{{ route('register') }}" class="font-bold text-brandTeal hover:text-brandTeal/80 transition">
                                    Crea una cuenta gratis
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        
    </div>
    <x-footers.footer_welcome />

@endsection