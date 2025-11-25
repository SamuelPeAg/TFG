<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación - Factomove</title>

    {{-- Mantenemos el mismo estilo de layout para la estructura --}}
    <link rel="stylesheet" href="{{ asset('css/sesiones.css') }}">

    {{-- FontAwesome --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    {{-- Se elimina la referencia a Flatpickr --}}
</head>
<body>

<div class="dashboard-container">

    {{-- 1. Estructura Principal de la Izquierda (Sidebar) --}}
    @include('components.sidebar_facturacion')

    <main class="main-content">

        {{-- 2. Título de la Vista --}}
        <div class="header-controls">
            <div class="title-section">
                <h1>Gestión de Facturación</h1>
            </div>

            {{-- ELIMINADO: Se quita la barra de controles y búsqueda --}}
        </div>

        {{-- 3. Área de Contenido Totalmente Vacía --}}
        <div class="facturacion-area-vacia">
            <p>Aquí se construirá el módulo de facturación.</p>
            <button class="btn-primary"><i class="fa-solid fa-plus"></i> Añadir Nueva Factura</button>
        </div>

    </main>

</div>

{{-- ELIMINADO: Se quitan todas las referencias a scripts de sesiones y calendario --}}

</body>
</html>