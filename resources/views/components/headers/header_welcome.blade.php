<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Factomove - Conecta tu movimiento')</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <script>
        tailwind.config = {
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

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.active { opacity: 1; transform: translateY(0); }

        /* Estilo para el subrayado tipo rotulador */
        .highlight-teal {
            position: relative;
            z-index: 1;
        }
        .highlight-teal::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 5px;
            width: 100%;
            height: 12px;
            background-color: rgba(75, 183, 174, 0.2);
            z-index: -1;
            border-radius: 2px;
        }
        .highlight-coral {
            position: relative;
            z-index: 1;
        }
        .highlight-coral::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 5px;
            width: 100%;
            height: 12px;
            background-color: rgba(239, 93, 122, 0.2);
            z-index: -1;
            border-radius: 2px;
        }
    </style>
</head>
<body class="text-darkText bg-gray-50 overflow-x-hidden">

    <nav class="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300 top-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                <div class="flex-shrink-0 flex items-center gap-2">
                    <a href="{{ url('/') }}">
                        <img src="{{ asset('img/logopng.png') }}" alt="Logo" class="h-10 w-auto">
                    </a>
                    <span class="font-bold text-xl tracking-tight">Factomove</span>
                </div>

                <div class="hidden md:flex space-x-8 items-center">
                    <a href="{{ route('contact') }}" class="text-gray-600 hover:text-brandTeal font-medium transition">Contactanos</a>
                    
                    <a href="{{ route('booking.view') }}" class="flex items-center gap-2 text-gray-800 font-bold hover:text-brandTeal transition group">
                        <i class="fa-regular fa-calendar-check text-brandTeal group-hover:scale-110 transition-transform"></i>
                        Reservas
                    </a>
                    
                    <div class="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
                        @auth
                            <a href="{{ url('/dashboard') }}" class="text-gray-700 font-bold hover:text-brandTeal transition">Mi Cuenta</a>
                        @else
                            <a href="{{ route('login') }}" class="text-gray-700 font-bold hover:text-brandTeal transition">Iniciar Sesión</a>
                            <a href="{{ route('register') }}" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Crear Cuenta
                            </a>
                        @endauth
                    </div>
                </div>

                <div class="md:hidden flex items-center">
                    <button class="text-gray-600 hover:text-brandTeal">
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
            for(var i = 0; i < reveals.length; i++) {
                var windowheight = window.innerHeight;
                var revealtop = reveals[i].getBoundingClientRect().top;
                if(revealtop < windowheight - 150) {
                    reveals[i].classList.add('active');
                }
            }
        }
        reveal();
    </script>
</body>
</html>