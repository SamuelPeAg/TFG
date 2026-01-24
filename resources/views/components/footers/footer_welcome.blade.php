<footer class="bg-gray-900 dark:bg-gray-950 text-white py-10 border-t border-gray-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center place-items-center">
            
            {{-- Columna 1: Brand + Social --}}
            <div class="flex flex-col items-center space-y-4">
                <div class="flex items-center gap-2 justify-center">
                    <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo" class="h-6 w-auto brightness-0 invert">
                    <span class="font-bold text-xl tracking-tight">Factomove</span>
                </div>
                <p class="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
                    Simplificando la gestión de usuarios y potenciando tu bienestar.
                </p>
                
                {{-- Social Icons --}}
                <div class="flex items-center justify-center gap-4">
                    <a href="https://www.instagram.com/movertedavida/?hl=es" target="_blank" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brandCoral hover:text-white transition-all duration-300">
                        <i class="fa-brands fa-instagram text-sm"></i>
                    </a>
                    <a href="https://movertedavida.com/cordoba/" target="_blank" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brandTeal hover:text-white transition-all duration-300" title="Web Oficial">
                        <i class="fa-solid fa-globe text-sm"></i>
                    </a>
                    <a href="https://www.facebook.com/movertedavida/?locale=es_ES" target="_blank" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                        <i class="fa-brands fa-facebook text-sm"></i>
                    </a>
                </div>
            </div>

            {{-- Columna 2: Navegación --}}
            <div class="flex flex-col items-center">
                <h4 class="font-bold text-base text-white mb-4">
                    Navegación
                </h4>
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li>
                        <a href="{{ url('/') }}" class="hover:text-brandTeal transition">
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="https://movertedavida.com/cordoba/" target="_blank" class="hover:text-brandTeal transition">
                            Nosotros
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('contact') }}" class="hover:text-brandTeal transition">
                            Contacto
                        </a>
                    </li>
                </ul>
            </div>

            {{-- Columna 3: Centros Moverte --}}
            <div class="flex flex-col items-center">
                <h4 class="font-bold text-base text-white mb-4">
                    Centros Moverte
                </h4>
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li>
                        <a href="https://movertedavida.com/cordoba/" target="_blank" class="hover:text-brandTeal transition">
                            Córdoba
                        </a>
                    </li>
                    <li>
                        <a href="https://movertedavida.com/puente-genil/" target="_blank" class="hover:text-brandTeal transition">
                            Puente Genil
                        </a>
                    </li>
                    <li>
                        <a href="https://movertedavida.com/granada/" target="_blank" class="hover:text-brandTeal transition">
                            Granada
                        </a>
                    </li>
                </ul>
            </div>

            {{-- Columna 3: Legal --}}
            <div class="flex flex-col items-center">
                <h4 class="font-bold text-base text-white mb-4">
                    Legal
                </h4>
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li><a href="{{ route('cookies.policy') }}" class="hover:text-brandCoral transition">Política de Cookies</a></li>
                    <li><a href="{{ route('privacy.policy') }}" class="hover:text-brandCoral transition">Política de Privacidad</a></li>
                    <li><a href="{{ route('legal.notice') }}" class="hover:text-brandCoral transition">Aviso Legal</a></li>
                </ul>
            </div>

        </div>

        {{-- Copyright --}}
        <div class="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            <p>&copy; {{ date('Y') }} Factomove. Todos los derechos reservados.</p>
        </div>
    </div>
</footer>