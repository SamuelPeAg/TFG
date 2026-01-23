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
        
        .blob-bg {
            background-image: radial-gradient(#A5EFE2 20%, transparent 20%), radial-gradient(#A5EFE2 20%, transparent 20%);
            background-color: #ffffff;
            background-position: 0 0, 50px 50px;
            background-size: 100px 100px;
            opacity: 0.3;
        }
    </style>
</head>
<body class="text-darkText bg-gray-50 overflow-x-hidden min-h-screen flex flex-col **pt-20**">
    </body>
<nav class="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300 **top-0**"></nav>  
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                <div class="flex-shrink-0 flex items-center gap-2">
<a href="{{ url('/') }}">
    <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo Blanco" class="h-10 w-auto">
</a>                    <span>Factomove</span> <br>
                </div>

                <div class="hidden md:flex space-x-6 items-center">
                    <a href="{{ route('contact') }}" class="text-gray-600 hover:text-brandTeal font-medium transition">  Contactanos</a>
                    
                    <div class="hidden md:flex space-x-6 items-center">
                    <a href="{{ route('welcome') }}" class="text-gray-600 hover:text-brandTeal font-medium transition"> Inicio</a>
                    <div class="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
                        @if (Route::has('login'))
                            <a href="{{ route('login') }}" class="text-gray-700 font-bold hover:text-brandTeal transition">
                                Iniciar Sesión
                            </a>
                        @else
                            <a href="#" class="text-gray-700 font-bold hover:text-brandTeal transition">
                                Iniciar Sesión
                            </a>
                        @endif

                        {{-- @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Crear Cuenta
                            </a>
                        @else
                            <a href="#" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 transition">
                                Crear Cuenta
                            </a>
                        @endif --}}
                    </div>
                </div>

                <div class="md:hidden flex items-center">
                    <button class="text-gray-600 hover:text-brandTeal focus:outline-none">
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

</html>