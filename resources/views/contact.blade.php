<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Contacto - Factomove</title>

    <link rel="stylesheet" href="{{ asset('css/principal.css') }}" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
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
    
    <style>
        /* Importamos la fuente Inter y otras clases base */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Aseguramos que el contenedor de contenido principal tenga un relleno de 80px 
           para evitar la superposición con el header fijo (h-20) */
        .contact-fullscreen-wrapper {
             padding-top: 80px !important; 
        }
    </style>
</head>
<body>
    <x-header-contacto/>

    <div class="contact-fullscreen-wrapper p">
        
        <a href="/" class="back-home-btn mt-4"> 
        </a>

        <div class="contact-content-side">
            <div class="contact-hero-inline">
                <h1>Hablemos de <br><span class="text-gradient">Movimiento</span></h1>
                <p>
                    ¿Tienes dudas sobre Factomove o quieres empezar un plan personalizado? 
                    Rellena el formulario y nos pondremos en marcha.
                </p>
            </div>

            <form action="#" method="POST" class="contact-form-full">
                @csrf
                
                <label for="name">Nombre Completo <span>*</span></label>
                <input type="text" id="name" name="name" class="input-flat" placeholder="Tu nombre" required>

                <div style="display: flex; gap: 20px;">
                    <div style="flex:1">
                        <label for="email">Email <span>*</span></label>
                        <input type="email" id="email" name="email" class="input-flat" placeholder="tucorreo@ejemplo.com" required>
                    </div>
                    <div style="flex:1">
                        <label for="phone">Teléfono</label>
                        <input type="tel" id="phone" name="phone" class="input-flat" placeholder="+34...">
                    </div>
                </div>

                <label for="company">Empresa / Organización</label>
                <input type="text" id="company" name="company" class="input-flat" placeholder="Opcional">

                <label for="message">¿En qué podemos ayudarte? <span>*</span></label>
                <textarea id="message" name="message" class="input-flat" placeholder="Cuéntanos sobre tu proyecto..." required></textarea>

                <button type="submit" class="login-button" style="width: auto; padding: 15px 50px;">
                    ENVIAR MENSAJE
                </button>
            </form>

            <div class="contact-extra-info">
                <div class="info-item">
                    <h4>Email</h4>
                    <a href="mailto:hola@factomove.com">hola@factomove.com</a>
                </div>
                <div class="info-item">
                    <h4>Teléfono</h4>
                    <a href="tel:+34912345678">+34 912 345 678</a>
                </div>
                <div class="info-item">
                    <h4>Oficina</h4>
                    <p>Madrid, España</p>
                </div>
            </div>
        </div>

        <div class="contact-map-side">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3149.3041899124273!2d-4.7975379!3d37.876568299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e0!3m2!1ses!2ses!4v1763946481606!5m2!1ses!2ses" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        </div>

    </div>

</body>
</html>