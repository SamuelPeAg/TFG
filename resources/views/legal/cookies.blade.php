@extends('components.headers.header_welcome')

@section('content')
    {{-- Contenedor principal --}}
    <div class="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

        <div class="text-center mb-16">
            <img src="{{ asset('img/logopng.png') }}" 
                 alt="Factomove Logo" 
                 class="h-28 md:h-40 w-auto mx-auto mb-8 bg-brandTeal rounded-[2rem] p-6 shadow-xl">
            
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Política de Cookies</h1>
            <p class="mt-6 text-xl text-gray-500">Transparencia sobre el uso de tecnologías de rastreo</p>
        </div>

        <div class="prose prose-lg prose-blue max-w-none text-gray-600 space-y-10">
            
            <p class="lead text-xl text-gray-700">
                En <strong>Factomove</strong> creemos en la transparencia total. A continuación te explicamos qué son las cookies, cuáles usamos en esta web y cómo puedes gestionarlas según tus preferencias.
            </p>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">1. ¿Qué son las cookies?</h2>
                <p>Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página. Las cookies suelen almacenar información de carácter técnico, preferencias personales, personalización de contenidos, estadísticas de uso, enlaces a redes sociales, acceso a cuentas de usuario, etc.</p>
                <p>El objetivo de la cookie es adaptar el contenido de la web a tu perfil y necesidades; sin cookies los servicios ofrecidos por cualquier página se verían mermados notablemente.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">2. Cookies utilizadas en este sitio web</h2>
                <p>Siguiendo las directrices de la Agencia Española de Protección de Datos procedemos a detallar el uso de cookies que hace esta web con el fin de informarte con la máxima exactitud posible.</p>

                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-4 mt-0">Cookies Propias</h3>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Cookies de sesión:</strong> Para garantizar que los usuarios que escriban comentarios o se registren sean humanos y no aplicaciones automatizadas (combatir el spam) y para mantener tu sesión activa mientras navegas.</li>
                        <li><strong>Cookies de personalización:</strong> Para recordar tus preferencias (como el idioma o tu rol de usuario).</li>
                    </ul>
                </div>

                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-4 mt-0">Cookies de Terceros</h3>
                    <p class="mb-2">Esta web puede utilizar servicios de terceros que recopilan información con fines estadísticos y de uso de la web:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Google Analytics:</strong> Almacena cookies para poder elaborar estadísticas sobre el tráfico y volumen de visitas de esta web. Al utilizar este sitio web estás consintiendo el tratamiento de información acerca de ti por Google.</li>
                        <li><strong>Redes Sociales:</strong> Cada red social utiliza sus propias cookies para que puedas pinchar en botones del tipo "Me gusta" o "Compartir".</li>
                    </ul>
                </div>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">3. Desactivación o eliminación de cookies</h2>
                <p>En cualquier momento puedes ejercer tu derecho de desactivación o eliminación de cookies de este sitio web. Estas acciones se realizan de forma diferente en función del navegador que estés usando:</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 not-prose">
                    <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" class="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brandTeal transition group">
                        <i class="fa-brands fa-chrome text-2xl text-gray-500 group-hover:text-brandTeal mr-3"></i>
                        <span class="font-medium text-gray-700 group-hover:text-brandTeal">Google Chrome</span>
                    </a>
                    <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" class="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brandTeal transition group">
                        <i class="fa-brands fa-firefox text-2xl text-gray-500 group-hover:text-brandTeal mr-3"></i>
                        <span class="font-medium text-gray-700 group-hover:text-brandTeal">Mozilla Firefox</span>
                    </a>
                    <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" class="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brandTeal transition group">
                        <i class="fa-brands fa-safari text-2xl text-gray-500 group-hover:text-brandTeal mr-3"></i>
                        <span class="font-medium text-gray-700 group-hover:text-brandTeal">Safari</span>
                    </a>
                    <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" class="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brandTeal transition group">
                        <i class="fa-brands fa-edge text-2xl text-gray-500 group-hover:text-brandTeal mr-3"></i>
                        <span class="font-medium text-gray-700 group-hover:text-brandTeal">Microsoft Edge</span>
                    </a>
                </div>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">4. Notas adicionales</h2>
                <ul class="list-disc pl-5">
                    <li>Ni esta web ni sus representantes legales se hacen responsables ni del contenido ni de la veracidad de las políticas de privacidad que puedan tener los terceros mencionados en esta política de cookies.</li>
                    <li>Los navegadores web son las herramientas encargadas de almacenar las cookies y desde este lugar debes efectuar tu derecho a eliminación o desactivación de las mismas.</li>
                </ul>
            </section>

        </div>
    </div>

    {{-- FOOTER INTEGRADO --}}
    <x-footers.footer_welcome />

@endsection