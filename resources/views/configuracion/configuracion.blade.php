<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración - Factomove</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brandTeal: '#4BB7AE',
                        brandCoral: '#EF5D7A',
                        brandAqua: '#A5EFE2',
                    }
                }
            }
        }
    </script>

    <style>
        body {
            background-color: #f3f4f6;
            margin: 0;
            margin: 0;
        }
        /* Ajuste clave para empujar el contenido a la derecha del sidebar */
        .dashboard-main {
            margin-left: 260px; /* Ancho exacto del sidebar */
            padding: 40px;
            min-height: 100vh;
            transition: margin-left 0.3s ease;
        }
        
        /* Modo oscuro para el body */
        html.dark body {
            background-color: #111827;
        }

        @media (max-width: 768px) {
            .dashboard-main {
                margin-left: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body class="transition-colors duration-300">

    {{-- INCLUIMOS EL COMPONENTE SIDEBAR --}}
    @auth
        @if(auth()->user()->hasRole('admin'))
            @include('components.sidebar.sidebar_admin')
        @elseif(auth()->user()->hasRole('entrenador'))
            @include('components.sidebar.sidebar_entrenador')
        @endif
    @endauth
    {{-- CONTENIDO PRINCIPAL --}}
    <main class="dashboard-main">
        
        {{-- TÍTULO: Fuera de la tarjeta, alineado arriba a la izquierda --}}
        <div class="mb-8">
            <h1 class="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Configuración</h1>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Administra tu perfil y preferencias de la cuenta.</p>
        </div>

        {{-- TARJETA PRINCIPAL DEL FORMULARIO --}}
        <div class="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div class="p-8">

                {{-- Mensajes de alerta --}}
                @if(session('success'))
                    <div class="mb-6 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 font-semibold">
                        {{ session('success') }}
                    </div>
                @endif

                @if ($errors->any())
                    <div class="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
                        <ul class="list-disc ml-5 text-sm space-y-1">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {{-- SUB-MENÚ INTERNO (Sticky) --}}
                    <aside class="lg:col-span-1">
                        <div class="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sticky top-5">
                            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 ml-1">Acceso Rápido</p>
                            <div class="space-y-2">
                                <a href="#perfil" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition">
                                    <i class="fa-solid fa-user text-brandCoral"></i>
                                    <span class="font-semibold text-gray-800 dark:text-gray-200">Perfil</span>
                                </a>
                                <a href="#seguridad" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition">
                                    <i class="fa-solid fa-lock text-brandCoral"></i>
                                    <span class="font-semibold text-gray-800 dark:text-gray-200">Seguridad</span>
                                </a>
                                <a href="#preferencias" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition">
                                    <i class="fa-solid fa-sliders text-brandCoral"></i>
                                    <span class="font-semibold text-gray-800 dark:text-gray-200">Preferencias</span>
                                </a>
                            </div>
                        </div>
                    </aside>

                    {{-- FORMULARIO --}}
                    <section class="lg:col-span-2 space-y-8">
                        <form method="POST" action="{{ route('configuracion.update') }}">
                            @csrf
                            @method('PUT')

                            {{-- SECCIÓN PERFIL --}}
                            <div id="perfil" class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Perfil</h3>
                                <div class="grid gap-5">
                                    <div>
                                        <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Nombre de Usuario</label>
                                        <input type="text" name="name" value="{{ old('name', $user->name) }}" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Email</label>
                                        <input type="email" name="email" value="{{ old('email', $user->email) }}" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" readonly>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">IBAN</label>
                                        <input type="text" name="iban" value="{{ old('iban', $user->iban) }}" placeholder="ES00 0000 0000 0000 0000 0000" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none">
                                    </div>
                                </div>
                            </div>

                            {{-- SECCIÓN SEGURIDAD --}}
                            <div id="seguridad" class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Seguridad</h3>
                                <div class="grid gap-5">
                                    <div>
                                        <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Contraseña Actual</label>
                                        <input type="password" name="current_password" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none">
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Nueva Contraseña</label>
                                            <input type="password" name="password" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Confirmar Contraseña</label>
                                            <input type="password" name="password_confirmation" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- SECCIÓN PREFERENCIAS --}}
                            {{-- <div id="preferencias" class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Preferencias</h3> --}}
                                
                                {{-- Switch Modo Oscuro --}}
                                {{-- <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-brandCoral dark:text-brandAqua">
                                            <i id="theme-icon" class="fa-solid fa-moon"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 dark:text-gray-200">Modo Oscuro</p>
                                        </div>
                                    </div>
                                    <button type="button" id="theme-toggle" class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-brandTeal transition-colors">
                                        <span id="theme-toggle-circle" class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 dark:translate-x-6"></span>
                                    </button>
                                </div>
                            </div> --}}

                            {{-- BOTONES DE ACCIÓN --}}
                            <div class="flex justify-end gap-4 pt-4">
                                <a href="{{ url()->previous() }}" class="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancelar</a>
                                <button type="submit" class="px-6 py-3 rounded-xl bg-gradient-to-r from-brandTeal to-brandCoral text-white font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition">Guardar Cambios</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </main>

    {{-- Script Lógica Modo Oscuro --}}
    <script>
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const htmlElement = document.documentElement;

        function updateVisuals() {
            if (htmlElement.classList.contains('dark')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }

        if (localStorage.getItem('theme') === 'dark') {
            htmlElement.classList.add('dark');
        }
        updateVisuals();

        themeToggleBtn.addEventListener('click', function() {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
            updateVisuals();
        });
    </script>
</body>
</html>