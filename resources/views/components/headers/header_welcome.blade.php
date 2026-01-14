<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Factomove - Conecta tu movimiento')</title>

    {{-- 1. CARGAMOS TAILWIND --}}
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    {{-- 2. CONFIGURACIÓN DEL TEMA (Colores y Dark Mode) --}}
    <script>
        tailwind.config = {
            darkMode: 'class', // <--- Importante: modo manual
            theme: {
                extend: {
                    colors: {
                        brandTeal: '#4BB7AE',
                        brandCoral: '#EF5D7A',
                        brandAqua: '#A5EFE2',
                        darkText: '#2D3748',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    {{-- 3. SCRIPT DE MEMORIA (Anti-Parpadeo) --}}
    {{-- Este script revisa la preferencia guardada ANTES de mostrar la web --}}
    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

        body {
            font-family: 'Inter', sans-serif;
        }

        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
        }

        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        .blob-bg {
            background-image: radial-gradient(#A5EFE2 20%, transparent 20%), radial-gradient(#A5EFE2 20%, transparent 20%);
            background-color: #ffffff;
            background-position: 0 0, 50px 50px;
            background-size: 100px 100px;
            opacity: 0.3;
        }
    </style>
</head>

{{-- 4. BODY ADAPTADO A MODO OSCURO --}}
<body class="text-darkText bg-gray-50 dark:bg-gray-900 dark:text-gray-100 overflow-x-hidden min-h-screen flex flex-col pt-20 transition-colors duration-300">

    {{-- NAV ADAPTADO --}}
    <nav class="fixed w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 top-0 border-b border-transparent dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                
                <div class="flex-shrink-0 flex items-center gap-2">
                    <a href="{{ url('/') }}" class="flex items-center gap-2">
                        <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo" class="h-10 w-auto">
                        <span class="font-bold text-lg dark:text-white">Factomove</span>
                    </a>
                </div>

                <div class="hidden md:flex space-x-6 items-center">
                    <a href="{{ route('contact') }}" class="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition">
                        Contactanos
                    </a>

                    <a href="{{ route('welcome') }}" class="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition">
                        Inicio
                    </a>
                    
                    <div class="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200 dark:border-gray-700">
                        
                        @guest
                            <a href="{{ route('login') }}" class="text-gray-700 dark:text-gray-200 font-bold hover:text-brandTeal transition">
                                Iniciar Sesión
                            </a>
                        
                            <a href="{{ route('register') }}" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Crear Cuenta
                            </a>
                        @else
                            <div class="flex items-center gap-3">
                                
                                <a href="{{ route('sesiones') }}" class="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
                                    
                                    <div class="hidden md:flex flex-col items-end leading-tight">
                                        <span class="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover:text-brandTeal transition-colors">
                                            {{ auth()->user()->name }}
                                        </span>
                                        <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                                            Panel de Gestión
                                        </span>
                                    </div>
                                    
                                    <div class="h-10 w-10 rounded-full bg-brandTeal text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-700 group-hover:ring-brandTeal transition-all">
                                        {{ substr(auth()->user()->name, 0, 1) }}
                                    </div>
                                </a>

                                <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="text-gray-400 hover:text-brandCoral transition flex items-center gap-1 p-1" title="Cerrar Sesión">
                                        <i class="fa-solid fa-right-from-bracket text-lg"></i>
                                    </button>
                                </form>

                            </div>
                        @endguest

                    </div>
                </div>

                <div class="md:hidden flex items-center">
                    <button class="text-gray-600 dark:text-gray-300 hover:text-brandTeal focus:outline-none">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main>
        @yield('content')
    </main>

    <script>
        window.addEventListener('scroll', reveal);
        function reveal() {
            var reveals = document.querySelectorAll('.reveal');
            for (var i = 0; i < reveals.length; i++) {
                var windowheight = window.innerHeight;
                var revealtop = reveals[i].getBoundingClientRect().top;
                if (revealtop < windowheight - 150) {
                    reveals[i].classList.add('active');
                }
            }
        }
        reveal();
    </script>
    
</body>
</html>