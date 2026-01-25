<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña | Factomove</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brandTeal: '#4BB7AE',
                        brandCoral: '#EF5D7A',
                    }
                }
            }
        }
    </script>
</head>

<body class="min-h-screen bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40 flex items-center justify-center p-4">

    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">

        <!-- Header -->
        <div class="px-8 pt-12 pb-6 text-center">
            <img src="{{ asset('img/logopng.png') }}"
                 alt="Factomove Logo"
                 class="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300">

            <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Recuperar contraseña</h2>
            <p class="mt-2 text-sm text-gray-500">Introduce tu email y te enviaremos un enlace para restablecerla</p>
        </div>

        <div class="px-8 pb-10">

            @if (session('status'))
                <div class="mb-5 rounded-2xl border border-brandTeal/30 bg-brandTeal/10 px-4 py-3 text-sm text-gray-700">
                    <i class="fa-solid fa-circle-check text-brandTeal mr-2"></i>
                    {{ session('status') }}
                </div>
            @endif

            @if (session('error'))
                <div class="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <i class="fa-solid fa-triangle-exclamation mr-2"></i>
                    {{ session('error') }}
                </div>
            @endif

            <form action="{{ route('password.email') }}" method="POST">
                @csrf

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div class="group md:col-span-2">
                        <label for="email" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Email de acceso
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                            </div>
                            <input type="email"
                                   name="email"
                                   id="email"
                                   value="{{ old('email') }}"
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400 @error('email') border-red-500 @enderror"
                                   placeholder="tuemail@dominio.com" required>
                        </div>
                        @error('email')
                            <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p>
                        @enderror
                    </div>

                </div>

                <button type="submit"
                        class="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                    <i class="fa-solid fa-paper-plane mr-2"></i>
                    ENVIAR ENLACE DE RECUPERACIÓN
                </button>

                <a href="{{ route('login') }}"
                   class="mt-5 block text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                    <i class="fa-solid fa-arrow-left mr-2"></i> Volver a iniciar sesión
                </a>

                <p class="mt-6 text-center text-xs text-gray-400">
                    Por seguridad, si el email existe, enviaremos el enlace igualmente.
                </p>
            </form>
        </div>
    </div>

</body>
</html>
