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
            <h1 class="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Mi Perfil</h1>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Administra tu perfil y preferencias de la cuenta.</p>
        </div>

        @viteReactRefresh
        @vite(['resources/js/configuracion-react.jsx'])
        <div 
            id="react-configuracion-root"
            data-user="{{ json_encode($user) }}"
            data-update-route="{{ route('configuracion.update') }}"
            data-csrf="{{ csrf_token() }}"
            data-success="{{ session('success', '') }}"
            data-errors="{{ json_encode($errors->all()) }}"
        ></div>
    </main>

    {{-- Script Lógica Modo Oscuro --}}
    <script>
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const htmlElement = document.documentElement;

        function updateVisuals() {
            if (htmlElement.classList.contains('dark')) {
                // themeIcon.classList.remove('fa-moon');
                // themeIcon.classList.add('fa-sun');
            } else {
                // themeIcon.classList.remove('fa-sun');
                // themeIcon.classList.add('fa-moon');
            }
        }

        if (localStorage.getItem('theme') === 'dark') {
            htmlElement.classList.add('dark');
        }
        updateVisuals();

        // Función para previsualizar la imagen (Nueva)
        function previewFile() {
            const preview = document.getElementById('preview-image');
            const file = document.querySelector('input[type=file]').files[0];
            const reader = new FileReader();
            const placeholder = document.getElementById('preview-placeholder');

            reader.addEventListener("load", function () {
                preview.src = reader.result;
                preview.classList.remove('hidden');
                if(placeholder) placeholder.classList.add('hidden');
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    </script>
</body>
</html>