<nav class="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300 top-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
            <div class="flex-shrink-0 flex items-center gap-2">
<a href="{{ url('/') }}">
    <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo Blanco" class="h-10 w-auto">
</a>                <span>Factomove</span>
            </div>

            <div class="hidden md:flex space-x-6 items-center">
                <a href="{{ route('contact') }}" class="text-gray-600 hover:text-brandTeal font-medium transition"> Contactanos</a>
                
                <div class="hidden md:flex space-x-6 items-center">
                    <a href="{{ route('booking.view') }}" class="flex items-center gap-2 text-gray-800 font-bold hover:text-brandTeal transition group">
                        <i class="fa-regular fa-calendar-check text-brandTeal group-hover:scale-110 transition-transform"></i>
                        Reservas
                    </a>
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

                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Crear Cuenta
                            </a>
                        @else
                            <a href="#" class="bg-brandTeal text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-opacity-90 transition">
                                Crear Cuenta
                            </a>
                        @endif
                    </div>
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