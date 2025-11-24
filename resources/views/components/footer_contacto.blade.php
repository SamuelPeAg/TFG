<footer class="bg-gray-900 text-white py-14 border-t-4 border-brandTeal mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 40px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                {{-- Usa la función asset() si tienes la imagen en public/img --}}
                <img src="{{ asset('img/logopng.png') }}" style="height: 40px;" alt="Factomove Logo">
                <span style="font-weight: 800; font-size: 24px;">Factomove</span>
            </div>
            <p style="color: #9ca3af; max-width: 450px;">
                La plataforma que conecta movimiento, salud y gestión para clientes, entrenadores y administradores.
            </p>
        </div>

        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 40px; text-align: center;">

            <div style="min-width: 150px;">
                <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 12px; color: #6ee7b7;">Navegación</h3>
                <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; color: #d1d5db;">
                    <li><a href="{{ url('/') }}" style="color:inherit; text-decoration: none;">Inicio</a></li>
                    <li><a href="#roles" style="color:inherit; text-decoration: none;">Roles del Sistema</a></li>
                    <li><a href="#features" style="color:inherit; text-decoration: none;">Ventajas</a></li>
                    <li><a href="{{ route('login') }}" style="color:inherit; text-decoration: none;">Iniciar Sesión</a></li>
                    <li><a href="{{ route('register') }}" style="color:inherit; text-decoration: none;">Crear Cuenta</a></li>
                </ul>
            </div>

            <div style="max-width: 250px;">
                <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 12px; color: #6ee7b7;">Sobre Nosotros</h3>
                <ul style="list-style: none; padding: 0; margin: 0; space-y-2 text-gray-400;">
                    <li><span style="color: #9ca3af;">Plataforma diseñada para mejorar la gestión del movimiento</span></li>
                    <li><span style="color: #9ca3af;">Solución adaptable a clientes, entrenadores y administradores</span></li>
                </ul>
            </div>

            <div style="min-width: 150px;">
                <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 12px; color: #6ee7b7;">Legal</h3>
                <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; color: #d1d5db;">
                    <li><a href="#" style="color:inherit; text-decoration: none;">Política de Privacidad</a></li>
                    <li><a href="#" style="color:inherit; text-decoration: none;">Términos de Uso</a></li>
                    <li><a href="#" style="color:inherit; text-decoration: none;">Cookies</a></li>
                </ul>
            </div>
        </div>

        <div style="border-top: 1px solid #374151; margin-top: 48px; padding-top: 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 0.875rem;">&copy; {{ date('Y') }} Factomove — Todos los derechos reservados.</p>
        </div>

    </div>
</footer>