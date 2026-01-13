@extends('components.headers.header_welcome')

@section('content')

<div class="flex flex-col min-h-[calc(100vh-80px)]">

  {{-- ÁREA CENTRAL CON GRADIENTE --}}
  <div class="flex-grow flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40">

    {{-- TARJETA --}}
    <div class="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">

      {{-- Encabezado --}}
      <div class="px-8 pt-10 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div class="flex items-center gap-4">
            <img src="{{ asset('img/logopng.png') }}"
                 alt="Factomove Logo"
                 class="h-16 w-auto transform hover:scale-105 transition duration-300">
            <div>
              <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Configuración</h2>
              <p class="mt-1 text-sm text-gray-500">Edita los datos de tu cuenta y preferencias</p>
            </div>
          </div>

          {{-- Chip de rol (solo visual, sin lógica) --}}
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brandTeal/10 text-brandTeal border border-brandTeal/20">
              <i class="fa-solid fa-shield-halved mr-2 text-brandCoral"></i>
              Rol: Usuario
            </span>
          </div>
        </div>
      </div>

      {{-- Contenido --}}
      <div class="px-8 pb-10">

        {{-- Tabs / Menú lateral --}}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {{-- Menú --}}
          <aside class="lg:col-span-1">
            <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">Secciones</p>

              <div class="space-y-2">
                <a href="#perfil" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
                  <i class="fa-solid fa-user text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800">Perfil</span>
                </a>

                <a href="#seguridad" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
                  <i class="fa-solid fa-lock text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800">Seguridad</span>
                </a>

                <a href="#preferencias" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
                  <i class="fa-solid fa-sliders text-brandCoral text-lg"></i>
                  <span class="font-semibold text-gray-800">Preferencias</span>
                </a>
              </div>

            </div>
          </aside>

          {{-- Formulario --}}
          <section class="lg:col-span-2">
            <form class="space-y-8">

              {{-- PERFIL --}}
              <div id="perfil" class="border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 class="text-lg font-extrabold text-gray-900">Perfil</h3>
                  <p class="text-sm text-gray-500">Datos básicos visibles en tu cuenta</p>
                </div>

                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {{-- Usuario --}}
                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Usuario</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-user text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="text"
                             class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                             placeholder="Ej. JuanPerez">
                    </div>
                  </div>

                  {{-- Email --}}
                  <div class="group sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Email</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="email"
                             class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                             placeholder="tu@email.com">
                    </div>
                  </div>

                </div>
              </div>

              {{-- SEGURIDAD --}}
              <div id="seguridad" class="border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 class="text-lg font-extrabold text-gray-900">Seguridad</h3>
                  <p class="text-sm text-gray-500">Cambia tu contraseña</p>
                </div>

                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {{-- Contraseña actual --}}
                  <div class="group sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Contraseña actual</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-lock text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="password"
                             class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                             placeholder="••••••••">
                    </div>
                  </div>

                  {{-- Nueva contraseña --}}
                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Nueva contraseña</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-key text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="password"
                             class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                             placeholder="••••••••">
                    </div>
                  </div>

                  {{-- Confirmar --}}
                  <div class="group sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Confirmar contraseña</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-check text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                      </div>
                      <input type="password"
                             class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                             placeholder="••••••••">
                    </div>
                  </div>

                </div>
              </div>

              {{-- PREFERENCIAS --}}
              <div id="preferencias" class="border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 class="text-lg font-extrabold text-gray-900">Preferencias</h3>
                  <p class="text-sm text-gray-500">Ajustes visuales y notificaciones</p>
                </div>

                <div class="p-6 space-y-5">

                  <label class="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:bg-white transition">
                    <input type="checkbox" class="mt-1 h-5 w-5 rounded border-gray-300 text-brandTeal focus:ring-green-500">
                    <div>
                      <p class="font-bold text-gray-800">Recibir notificaciones por email</p>
                      <p class="text-sm text-gray-500">Te avisaremos de novedades y actividad importante.</p>
                    </div>
                  </label>

                  </div>

                </div>
              </div>

              {{-- Botones --}}
              <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <a href="{{ url()->previous() }}"
                   class="w-full sm:w-auto flex justify-center py-3.5 px-6 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                  Cancelar
                </a>

                <button type="button"
                        class="w-full sm:w-auto flex justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                  Guardar cambios
                </button>
              </div>

            </form>

          </section>
        </div>
      </div>
    </div>
  </div>

  {{-- FOOTER GLOBAL --}}
  <x-footers.footer_welcome />

</div>

@endsection

