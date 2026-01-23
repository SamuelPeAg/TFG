<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activación de Cuenta | Factomove</title>
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
            
            <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Activación de Profesional</h2>
            <p class="mt-2 text-sm text-gray-500">Completa tu registro en Factomove</p>
            <p class="mt-1 text-xs text-brandTeal font-semibold">{{ $user->email }}</p>
        </div>

        <!-- Form -->
        <div class="px-8 pb-10">
            <form action="{{ route('entrenadores.update', $user->id) }}" method="POST">
                @csrf
                @method('PUT')
                <input type="hidden" name="token" value="{{ $token }}">

                <!-- Grid horizontal de 2 columnas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <!-- Nombre (readonly) -->
                    <div class="group">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Nombre del titular
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-user text-gray-400 text-lg"></i>
                            </div>
                            <input type="text" 
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 border-dashed rounded-xl text-gray-600 sm:text-sm font-medium cursor-not-allowed" 
                                   value="{{ $user->name }}" readonly>
                        </div>
                    </div>

                    <!-- Email (readonly) -->
                    <div class="group">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Email de acceso
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-envelope text-gray-400 text-lg"></i>
                            </div>
                            <input type="text" 
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 border-dashed rounded-xl text-gray-600 sm:text-sm font-medium cursor-not-allowed" 
                                   value="{{ $user->email }}" readonly>
                        </div>
                    </div>

                    <!-- Nueva Contraseña -->
                    <div class="group">
                        <label for="password" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Nueva Contraseña
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-lock text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                            </div>
                            <input type="password" 
                                   name="password" 
                                   id="password" 
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400 @error('password') border-red-500 @enderror" 
                                   placeholder="Mínimo 8 caracteres" required>
                        </div>
                        @error('password')
                            <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div class="group">
                        <label for="password_confirmation" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Confirmar Contraseña
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-check-double text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                            </div>
                            <input type="password" 
                                   name="password_confirmation" 
                                   id="password_confirmation" 
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400" 
                                   placeholder="Repite la contraseña" required>
                        </div>
                    </div>

                    {{-- <!-- IBAN (full width) -->
                    <div class="group md:col-span-2">
                        <label for="iban" class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                            Número de Cuenta Bancaria (IBAN)
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa-solid fa-credit-card text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                            </div>
                            <input type="text" 
                                   name="iban" 
                                   id="iban" 
                                   value="{{ old('iban') }}"
                                   class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400 @error('iban') border-red-500 @enderror" 
                                   placeholder="ES00 0000 0000 0000 0000 0000" required>
                        </div>
                        @error('iban')
                            <p class="mt-1 text-xs text-red-500 font-bold ml-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div> --}}

                <!-- Submit Button -->
                <button type="submit" 
                        class="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white bg-gradient-to-r from-brandTeal to-brandCoral hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200">
                    <i class="fa-solid fa-check mr-2"></i>
                    CONFIRMAR Y ACTIVAR CUENTA
                </button>
            </form>
        </div>
    </div>

</body>
</html>