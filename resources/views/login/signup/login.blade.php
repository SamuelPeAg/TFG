@extends('components.headers.header_welcome') 

@section('content')

    {{-- Contenedor principal responsive (min-h-screen para empujar footer) --}}
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-brandTeal/10 to-brandCoral/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

        {{-- Contenedor interior centrado --}}
        <div class="sm:mx-auto w-full max-w-7xl">
            
            {{-- Grid Responsivo: 1 col móvil, 2 cols desktop --}}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                
                {{-- Columna izquierda: Información (Oculta en móvil pequeño, visible en lg) --}}
                <div class="hidden lg:block space-y-8 px-4">
                    <div class="text-left space-y-6">
                        <h1 class="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                            Bienvenido a <br>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brandTeal to-brandCoral">Factomove</span>
                        </h1>
                        <p class="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                            Accede a tu panel de gestión y lleva el control integral de tus entrenamientos, usuarios y pagos desde cualquier dispositivo.
                        </p>
                        
                        {{-- Features badges --}}
                        <div class="flex flex-col gap-5 pt-2">
                            <div class="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 fit-content w-fit">
                                <div class="w-10 h-10 rounded-full bg-brandTeal/20 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-dumbbell text-brandTeal text-lg"></i>
                                </div>
                                <span class="text-sm font-bold text-gray-700">Gestión de Entrenadores</span>
                            </div>

                            <div class="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 fit-content w-fit">
                                <div class="w-10 h-10 rounded-full bg-brandCoral/20 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-users text-brandCoral text-lg"></i>
                                </div>
                                <span class="text-sm font-bold text-gray-700">Control de Usuarios</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Columna derecha: Formulario de Login --}}
                <div class="w-full max-w-md mx-auto lg:max-w-full">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        
                        {{-- Encabezado compacto con Logo --}}
                        <div class="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-white to-gray-50/50">
                            
                            {{-- Logo responsive --}}
                            <img src="{{ asset('img/logopng.png') }}" 
                                 alt="Factomove Logo" 
                                 class="h-12 lg:h-16 w-auto mx-auto mb-4 transition-all duration-300">
                            
                            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">¡Hola de nuevo!</h2>
                            <p class="mt-2 text-sm text-gray-500 font-medium">Ingresa tus credenciales para continuar</p>
                        </div>

                        {{-- Formulario --}}
                        <div class="px-8 pb-8 pt-2">
                            <form method="POST" action="{{ route('login') }}" class="space-y-5">
                                @csrf
                                
                                {{-- Input Email --}}
                                <div class="group">
                                    <label for="email" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div class="relative group-focus-within:text-brandTeal transition-colors">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i class="fa-solid fa-envelope text-gray-400 group-focus-within:text-brandTeal transition-colors duration-200"></i>
                                        </div>
                                        <input type="email" id="email" name="email" value="{{ old('email') }}" 
                                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandTeal/20 focus:bg-white focus:border-brandTeal outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400" 
                                            placeholder="ejemplo@correo.com" required autofocus>
                                    </div>
                                    @error('email')
                                        <p class="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><i class="fa-solid fa-circle-exclamation"></i> {{ $message }}</p>
                                    @enderror
                                </div>

                                {{-- Input Contraseña --}}
                                <div class="group">
                                    <div class="flex justify-between items-center mb-2">
                                        <label for="password" class="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Contraseña
                                        </label>
                                        <a href="{{ route('password.request') }}" class="text-xs text-brandTeal hover:text-brandTeal/80 font-bold transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>
                                    <div class="relative group-focus-within:text-brandCoral transition-colors">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i class="fa-solid fa-lock text-gray-400 group-focus-within:text-brandCoral transition-colors duration-200"></i>
                                        </div>
                                        <input type="password" id="password" name="password" 
                                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandCoral/20 focus:bg-white focus:border-brandCoral outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400" 
                                            placeholder="••••••••" required autocomplete="current-password">
                                    </div>
                                    @error('password')
                                        <p class="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><i class="fa-solid fa-circle-exclamation"></i> {{ $message }}</p>
                                    @enderror
                                </div>

                                {{-- Botón Submit --}}
                                <button type="submit" class="w-full mt-2 group relative flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandTeal/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:shadow-brandCoral/30 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition-all duration-300 transform active:scale-[0.98]">
                                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <i class="fa-solid fa-right-to-bracket text-white/50 group-hover:text-white transition-colors"></i>
                                    </span>
                                    INICIAR SESIÓN
                                </button>
                            </form>

                            {{-- Footer Tarjeta --}}
                            <div class="mt-8 pt-6 border-t border-gray-50 text-center">
                                <p class="text-sm text-gray-600">
                                    ¿Aún no eres miembro? 
                                    <a href="{{ route('register') }}" class="font-bold text-brandTeal hover:text-brandCoral transition-colors duration-200 inline-flex items-center gap-1">
                                        Crea una cuenta gratis
                                        <i class="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {{-- Copyright móvil (opcional, si se quiere dentro del viewport) --}}
                    <div class="mt-8 text-center lg:hidden">
                        <p class="text-xs text-gray-400">&copy; {{ date('Y') }} Factomove. Todos los derechos reservados.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <x-footers.footer_welcome />

@endsection