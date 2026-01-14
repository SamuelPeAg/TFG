<footer class="bg-gray-900 dark:bg-gray-950 text-white py-12 border-t-4 border-brandTeal transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {{-- Columna 1: Logo y Eslogan --}}
        <div>
            <div class="flex items-center gap-2 mb-4">
                {{-- Corregido: text-brandCoral para coincidir con el header --}}
                <i class="fa-solid fa-cube text-brandCoral text-2xl"></i>
                <span class="font-bold text-xl">Factomove</span>
            </div>
            <p class="text-gray-400 text-sm">Simplificando la gestión de usuarios.</p>
        </div>

        {{-- Columna 2: Producto --}}
        <div>
            {{-- Corregido: text-brandAqua --}}
            <h4 class="font-bold text-brandAqua mb-4">Producto</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="#" class="hover:text-brandCoral transition">Funcionalidades</a></li>
                <li><a href="#" class="hover:text-brandCoral transition">Precios</a></li>
            </ul>
        </div>

        {{-- Columna 3: Compañía --}}
        <div>
            <h4 class="font-bold text-brandAqua mb-4">Compañía</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="#" class="hover:text-brandCoral transition">Nosotros</a></li>
                <li><a href="#" class="hover:text-brandCoral transition">Contacto</a></li>
            </ul>
        </div>

        {{-- Columna 4: Legal --}}
        <div>
            <h4 class="font-bold text-brandAqua mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="{{ route('cookies.policy') }}" class="hover:text-brandCoral transition">Política de Cookies</a></li>
                <li><a href="{{ route('privacy.policy') }}" class="hover:text-brandCoral transition">Política de Privacidad</a></li>
                <li><a href="{{ route('legal.notice') }}" class="hover:text-brandCoral transition">Aviso Legal</a></li>
            </ul>
        </div>
    </div>

    {{-- Copyright --}}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 dark:border-gray-800 text-center text-gray-500 text-sm">
        &copy; {{ date('Y') }} Factomove. Todos los derechos reservados.
    </div>
</footer>