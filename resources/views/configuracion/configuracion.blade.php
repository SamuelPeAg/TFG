@extends('components.headers.header_welcome')

@section('content')

{{-- Contenedor principal con transición de colores --}}
<div class="flex flex-col min-h-[calc(100vh-80px)] transition-colors duration-300">

  <div class="flex-grow flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

    {{-- Tarjeta Principal: Blanco en día, Gris oscuro en noche --}}
    <div class="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-white/60 dark:border-gray-700 transition-colors duration-300">

      <div class="px-8 pt-10 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div class="flex items-center gap-4">
            <img src="{{ asset('img/logopng.png') }}"
                 alt="Factomove Logo"
                 class="h-16 w-auto transform hover:scale-105 transition duration-300">
            <div>
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Configuración</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Edita los datos de tu cuenta y preferencias</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 pb-10">

        {{-- Mensajes de éxito/error --}}
        @if(session('success'))
          <div class="mb-6 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 font-semibold">
            {{ session('success') }}
          </div>
        @endif

        @if ($errors->any())
          <div class="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
            <p class="font-bold mb-2">Revisa los campos:</p>
            <ul class="list-disc ml-5 text-sm space-y-1">
              @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
              @endforeach
            </ul>
          </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {{-- MENÚ LATERAL (Sidebar) --}}
          <aside class="lg:col-span-1">
            <div class="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 transition-colors">
              <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 ml-1">Secciones</p>

              <div class="space-y-2">
                <a href="#perfil" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <i class="fa-solid fa-user text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">Perfil</span>
                </a>

                <a href="#seguridad" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <i class="fa-solid fa-lock text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">Seguridad</span>
                </a>

                <a href="#preferencias" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <i class="fa-solid fa-sliders text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">Preferencias</span>
                </a>
              </div>
            </div>
          </aside>

          {{-- FORMULARIO PRINCIPAL --}}
          <section class="lg:col-span-2">
            <form method="POST" action="{{ route('configuracion.update') }}" class="space-y-8">
              @csrf
              @method('PUT')

              {{-- SECCIÓN: PERFIL --}}
              <div id="perfil" class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-extrabold text-gray-900 dark:text-white">Perfil</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Datos básicos visibles en tu cuenta</p>
                </div>

                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Usuario</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-user text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="text" name="name"
                        value="{{ old('name', $user->name) }}"
                        class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white dark:focus:bg-gray-800 outline-none transition text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        placeholder="Ej. JuanPerez">
                    </div>
                  </div>

                  <div class="group sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Email</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="email" name="email"
                        value="{{ old('email', $user->email) }}"
                        class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white dark:focus:bg-gray-800 outline-none transition text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        placeholder="tu@email.com">
                    </div>
                  </div>
                </div>
              </div>

              {{-- SECCIÓN: SEGURIDAD --}}
              <div id="seguridad" class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-extrabold text-gray-900 dark:text-white">Seguridad</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Cambia tu contraseña</p>
                </div>

                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div class="group sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Contraseña actual</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-lock text-brandCoral transition text-lg"></i>
                      </div>
                      <input type="password" name="current_password"
                        class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white dark:focus:bg-gray-800 outline-none transition text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        placeholder="••••••••">
                    </div>
                  </div>

                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Nueva contraseña</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-key text-brandCoral transition text-lg"></i>
                      </div>
                      <input type="password" name="password"
                        class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white dark:focus:bg-gray-800 outline-none transition text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        placeholder="••••••••">
                    </div>
                  </div>

                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Confirmar contraseña</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-check text-brandCoral transition text-lg"></i>
                      </div>
                      <input type="password" name="password_confirmation"
                        class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brandTeal focus:bg-white dark:focus:bg-gray-800 outline-none transition text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        placeholder="••••••••">
                    </div>
                  </div>
                </div>
              </div>

              {{-- SECCIÓN: PREFERENCIAS (¡AQUÍ ESTÁ EL BOTÓN NUEVO!) --}}
              <div id="preferencias" class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-extrabold text-gray-900 dark:text-white">Preferencias</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Ajustes visuales y notificaciones</p>
                </div>

                <div class="p-6 space-y-5">
                  {{-- Checkbox de notificaciones --}}
                  <label class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition">
                    <input type="checkbox" class="mt-1 h-5 w-5 rounded border-gray-300 text-brandTeal focus:ring-brandTeal dark:bg-gray-700 dark:border-gray-500">
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-200">Recibir notificaciones por email</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Te avisaremos de novedades y actividad importante.</p>
                    </div>
                  </label>

                  {{-- NUEVO INTERRUPTOR DE MODO OSCURO --}}
                  <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-white dark:bg-gray-700 rounded-lg text-brandCoral dark:text-brandAqua shadow-sm transition-colors">
                            {{-- Icono que cambia con JS --}}
                            <i id="theme-icon" class="fa-solid fa-moon text-xl"></i>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 dark:text-gray-200">Apariencia</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Alternar entre modo claro y oscuro.</p>
                        </div>
                    </div>
                    
                    {{-- Botón Switch --}}
                    <button type="button" id="theme-toggle" class="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-brandTeal transition-colors focus:outline-none focus:ring-2 focus:ring-brandTeal focus:ring-offset-2">
                        <span id="theme-toggle-circle" class="translate-x-1 inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out dark:translate-x-7"></span>
                    </button>
                  </div>

                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <a href="{{ url()->previous() }}"
                   class="w-full sm:w-auto flex justify-center py-3.5 px-6 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                  Cancelar
                </a>

                <button type="submit"
                        class="w-full sm:w-auto flex justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 transition transform hover:-translate-y-0.5 duration-200">
                  Guardar cambios
                </button>
              </div>

            </form>
          </section>
        </div>
      </div>
    </div>
  </div>

  <x-footers.footer_welcome />

</div>

{{-- SCRIPT PARA QUE EL BOTÓN FUNCIONE --}}
<script>
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Función para actualizar iconos visualmente
    function updateVisuals() {
        if (htmlElement.classList.contains('dark')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun'); // Icono sol
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon'); // Icono luna
        }
    }

    // Ejecutar al cargar la página
    updateVisuals();

    // Evento Click
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

@endsection