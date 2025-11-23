

    <!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Factomove</title>
    <link rel="stylesheet" href="{{ asset('../resources/css/principal.css') }}" />
</head>
<body>

    <x-header />
    <main class="landing">
        <!-- HERO PRINCIPAL -->
        <section class="hero">
            <div class="hero__content">
                <p class="hero__badge">Bienvenido a Factomove</p>
                <h1>Factomove</h1>
                <p class="hero__subtitle">
                    La plataforma que conecta a <strong>clientes</strong>, <strong>entrenadores</strong> y 
                    <strong>administradores</strong> en un mismo lugar. Gestiona sesiones, datos y progreso 
                    de forma sencilla.
                </p>

                <div class="hero__buttons">
                    <a href="#" class="btn btn--primary">Crear cuenta</a>
                    <a href="#" class="btn btn--outline">Iniciar sesión</a>
                </div>

                <p class="hero__info">
                    Según el correo con el que inicies sesión accederás al modo 
                    <span class="tag tag--cliente">Cliente</span>, 
                    <span class="tag tag--entrenador">Entrenador</span> o 
                    <span class="tag tag--admin">Admin</span>.
                </p>
            </div>

            <div class="hero__image">
                <!-- ZONA PARA IMAGEN PRINCIPAL -->
                <!-- Sustituye el div por un <img> cuando tengas la imagen -->
                <div class="image-placeholder">
                    <span>Espacio para imagen principal<br>(entrenamiento / salud / movimiento)</span>
                </div>
            </div>
        </section>

        <!-- BLOQUE DE MODOS / ROLES -->
        <section class="roles">
            <header class="section-header">
                <h2>Una experiencia adaptada a cada rol</h2>
                <p>
                    Factomove se adapta al tipo de usuario que accede al sistema, ofreciendo 
                    herramientas específicas para cada necesidad.
                </p>
            </header>

            <div class="roles__grid">
                <article class="role-card">
                    <h3>Modo Cliente</h3>
                    <p>
                        Visualiza tus rutinas, sesiones y progreso de forma clara. 
                        Recibe recordatorios y seguimiento de tus entrenadores.
                    </p>
                    <div class="role-card__image">
                        <!-- ZONA PARA IMAGEN -->
                        <span>Imagen cliente</span>
                    </div>
                </article>

                <article class="role-card">
                    <h3>Modo Entrenador</h3>
                    <p>
                        Gestiona tus clientes, crea planes de entrenamiento y controla 
                        la asistencia y resultados, todo desde un panel único.
                    </p>
                    <div class="role-card__image">
                        <!-- ZONA PARA IMAGEN -->
                        <span>Imagen entrenador</span>
                    </div>
                </article>

                <article class="role-card">
                    <h3>Modo Admin</h3>
                    <p>
                        Administra usuarios, permisos y estadísticas globales de la plataforma 
                        para tomar mejores decisiones.
                    </p>
                    <div class="role-card__image">
                        <!-- ZONA PARA IMAGEN -->
                        <span>Imagen admin</span>
                    </div>
                </article>
            </div>
        </section>

        <!-- SECCIÓN DE TEXTO / PRESENTACIÓN EXTRA -->
        <section class="about">
            <div class="about__text">
                <h2>Factomove simplifica la gestión del movimiento</h2>
                <p>
                    Diseñada para centros deportivos, entrenadores personales y personas que 
                    quieren mejorar su salud. Toda la información se organiza por roles, 
                    ofreciendo una experiencia clara y adaptada.
                </p>
                <p>
                    Desde el panel de inicio podrás ver los datos más importantes de un vistazo: 
                    sesiones próximas, progreso, avisos y estadísticas.
                </p>
            </div>

            <div class="about__image">
                <!-- ZONA PARA OTRA IMAGEN O MOCKUP DE LA APP -->
                <div class="image-placeholder image-placeholder--light">
                    <span>Espacio para mockup de la app<br>en móvil o escritorio</span>
                </div>
            </div>
        </section>

        <!-- SECCIÓN DESTACADOS / BENEFICIOS -->
        <section class="highlights">
            <header class="section-header">
                <h2>¿Por qué Factomove?</h2>
            </header>

            <div class="highlights__grid">
                <article class="highlight-card">
                    <h3>Todo en un mismo lugar</h3>
                    <p>
                        Centraliza la gestión de usuarios, sesiones y pagos sin perder tiempo 
                        en hojas de cálculo o múltiples herramientas.
                    </p>
                </article>

                <article class="highlight-card highlight-card--accent-green">
                    <h3>Seguimiento real del progreso</h3>
                    <p>
                        Registra entrenamientos, objetivos y mejoras para que cada cliente 
                        vea cómo avanza día a día.
                    </p>
                </article>

                <article class="highlight-card highlight-card--accent-red">
                    <h3>Roles y accesos seguros</h3>
                    <p>
                        Cada usuario ve solo lo que necesita gracias a un sistema de roles 
                        basado en el correo con el que inicia sesión.
                    </p>
                </article>
            </div>
        </section>
    </main>

    <!-- AQUÍ IRÍA TU FOOTER COMO COMPONENTE -->
    <!-- @include('components.footer') --> 
    <x-footer />
</body>
</html>


    
   

