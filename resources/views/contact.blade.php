<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Contacto - Factomove</title>

    {{-- Tailwind CSS CDN --}}
    <script src="https://cdn.tailwindcss.com"></script>
    {{-- FontAwesome --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brandTeal: '#4BB7AE',
                        brandCoral: '#EF5D7A',
                        brandAqua: '#A5EFE2',
                        darkText: '#2D3748',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>                 
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white text-darkText">

    {{-- HEADER --}}
    <x-headers.header-contacto/>

    {{-- CONTENEDOR PRINCIPAL --}}
    <main class="w-full flex flex-col lg:grid lg:grid-cols-2 lg:h-[calc(100vh-80px)] mt-20">
        
        {{-- COLUMNA IZQUIERDA: CONTENIDO Y FORMULARIO --}}
        <div class="px-6 py-12 md:px-12 lg:px-20 lg:py-16 flex flex-col justify-center order-1 lg:order-1 lg:overflow-y-auto h-full">
            
            <div class="mb-10">
                <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                    Hablemos de <br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-brandTeal to-brandCoral">
                        Movimiento
                    </span>
                </h1>
                <p class="text-lg text-gray-600 max-w-lg">
                    ¿Tienes dudas sobre Factomove o quieres empezar un plan personalizado? 
                    Rellena el formulario y nos pondremos en marcha.
                </p>
            </div>
            {{-- Formulario --}}
            <form action="#" method="POST" class="space-y-6 max-w-lg">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">Email <span class="text-brandCoral">*</span></label>
                        <input type="email" id="email" name="email" 
                            class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition" 
                            placeholder="hola@ejemplo.com" required>
                    </div>
                    <div>
                        <label for="phone" class="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                        <input type="tel" id="phone" name="phone" 
                            class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition" 
                            placeholder="+34 600 000 000">
                    </div>
                </div>

                <div>
                    <label for="message" class="block text-sm font-semibold text-gray-700 mb-1">Definición <span class="text-brandCoral">*</span></label>
                    <textarea id="message" name="message" rows="4" 
                        class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition resize-none" 
                        placeholder="Cuéntanos sobre tu proyecto o duda..." required></textarea>
                </div>

                <button type="submit" class="bg-brandTeal text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-teal-600 hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
                    ENVIAR MENSAJE
                </button>
            </form>

            <div class="mt-12 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                    <h4 class="font-bold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:hola@factomove.com" class="text-brandTeal hover:underline text-sm">hola@factomove.com</a>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 mb-1">Teléfono</h4>
                    <a href="tel:+34912345678" class="text-brandTeal hover:underline text-sm">+34 912 345 678</a>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 mb-1">Oficinas</h4>
                    <p class="text-gray-600 text-sm">Córdoba, España</p>
                </div>
            </div>
        </div>

       
        <div class="w-full h-auto lg:h-full bg-gray-200 order-2 lg:order-2 grid grid-cols-1 lg:grid-rows-3">
            
         
            <div class="relative w-full h-64 lg:h-full border-b-4 border-white box-border">
                <div class="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded shadow text-xs font-bold text-darkText">
                    SEDE 1-PRINCIPAL
                </div>
                <iframe
                    class="absolute inset-0 w-full h-full"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e0!3m2!1ses!2ses!4v1768326010698!5m2!1ses!2ses"

                    style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>

        
            <div class="relative w-full h-64 lg:h-full border-b-4 border-white box-border">
                <div class="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded shadow text-xs font-bold text-darkText">
                    SEDE 2-OPEN
                </div>
                <iframe
                    class="absolute inset-0 w-full h-full"
                    src= "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d21986110736b%3A0xd2b686fab1dd9bb5!2sMoverte%20da%20Vida%20-%20Open%20Arena!5e0!3m2!1ses!2ses!4v1768325263249!5m2!1ses!2ses"
                    style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>

            {{-- MAPA 3: Plaza de la Corredera --}}
            <div class="relative w-full h-64 lg:h-full">
                <div class="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded shadow text-xs font-bold text-darkText">
                    SEDE 3-AIRA
                </div>
                <iframe
                    class="absolute inset-0 w-full h-full"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12594.463651533495!2d-4.780209212841773!3d37.89266410000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6cdf7288300331%3A0x1bd6b7761e69d9a9!2sMoverte%20da%20vida%20-%20Aira%20fitness%20club!5e0!3m2!1ses!2ses!4v1768325180952!5m2!1ses!2ses"

                    style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>

        </div>
    </main>
</body>
</html>