<footer class="bg-gray-900 text-white py-14 border-t-4 border-brandTeal mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- LOGO + DESCRIPCIÓN -->
        <div class="flex flex-col items-center text-center mb-10">
            <div class="flex items-center gap-3 mb-3">
                <img src="{{ asset('img/logopng.png') }}" class="h-10" alt="Factomove Logo">
                <span class="font-extrabold text-2xl">Factomove</span>
            </div>
            <p class="text-gray-400 max-w-md">
                La plataforma que conecta movimiento, salud y gestión para clientes, entrenadores y administradores.
            </p>
        </div>

        <!-- ENLACES -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

            <!-- Columna 1 -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-brandAqua">Navegación</h3>
                <ul class="space-y-2 text-gray-400">
                    <li><a href="#roles" class="hover:text-white transition">Roles del Sistema</a></li>
                    <li><a href="#features" class="hover:text-white transition">Ventajas</a></li>
                    <li><a href="{{ route('login') }}" class="hover:text-white transition">Iniciar Sesión</a></li>
                    <li><a href="{{ route('register') }}" class="hover:text-white transition">Crear Cuenta</a></li>
                </ul>
            </div>

            <!-- Columna 2 -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-brandAqua">Sobre Nosotros</h3>
                <ul class="space-y-2 text-gray-400">
                    <li><span>Plataforma diseñada para mejorar la gestión del movimiento</span></li>
                    <li><span>Solución adaptable a clientes, entrenadores y administradores</span></li>
                </ul>
            </div>

            <!-- Columna 3 -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-brandAqua">Legal</h3>
                <ul class="space-y-2 text-gray-400">
                    <li><a href="#" class="hover:text-white transition">Política de Privacidad</a></li>
                    <li><a href="#" class="hover:text-white transition">Términos de Uso</a></li>
                    <li><a href="#" class="hover:text-white transition">Cookies</a></li>
                </ul>
            </div>
        </div>

        <!-- LÍNEA SEPARADORA -->
        <div class="border-t border-gray-700 mt-12 pt-6 text-center">
            <p class="text-gray-500 text-sm">&copy; {{ date('Y') }} Factomove — Todos los derechos reservados.</p>
        </div>

    </div>
</footer>
