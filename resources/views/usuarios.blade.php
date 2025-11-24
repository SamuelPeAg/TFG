<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuarios - Factomove</title>

    {{-- CSS --}}
    <link rel="stylesheet" href="{{ asset('css/usuarios.css') }}">

    {{-- FontAwesome --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    {{-- Flatpickr para el calendario --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
</head>
<body>

<div class="dashboard-container">

    {{-- Sidebar (reutilizamos componente si lo tienes) --}}
    @include('components.sidebar')

    <main class="main-content">

        <div class="header-controls">
            <div class="title-section">
                <h1>Historial de Clases</h1>
            </div>

            <div class="controls-bar">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="search-user" placeholder="Buscar usuario...">
                </div>
            </div>
        </div>

        <div class="calendar-layout">
            <div class="calendar-panel">
                <div class="calendar-container">
                    <!-- Custom calendar will be rendered here -->
                    <div id="user-calendar" class="custom-calendar"></div>
                </div>
                <!-- Summary below calendar (visible full-width) -->
                <div id="calendar-summary" class="calendar-summary">
                    <p>La información de la sesión seleccionada aparecerá aquí.</p>
                </div>
            </div>

            <aside class="details-panel" id="user-details">
                <h2>Detalles de la sesión</h2>
                <div class="details-content">
                    <p>Busca un usuario para ver su historial de clases aquí.</p>
                </div>
                <div class="details-footer" id="details-footer">
                    <!-- Resumen rápido aparecerá aquí -->
                </div>
            </aside>
        </div>



    </main>

</div>

{{-- JS --}}
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="{{ asset('js/usuarios.js') }}"></script>

</body>
</html>