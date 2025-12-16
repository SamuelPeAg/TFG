@extends('components.headers.header_welcome')

@section('content')
    {{-- Contenedor principal con un poco más de espaciado vertical --}}
    <div class="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

        <div class="text-center mb-16">
            {{-- 
                CAMBIO REALIZADO: 
                - Se aumentó el tamaño de la imagen: de 'h-16' pasó a 'h-28' en móviles y 'md:h-40' en escritorio.
                - Se aumentó el padding del contenedor: de 'p-2' a 'p-6'.
                - Se añadieron clases para redondear más las esquinas y dar sombra.
            --}}
            <img src="{{ asset('img/logopng.png') }}" 
                 alt="Factomove Logo" 
                 class="h-28 md:h-40 w-auto mx-auto mb-8 bg-brandTeal rounded-[2rem] p-6 shadow-xl">
            
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Política de Privacidad</h1>
            <p class="mt-6 text-xl text-gray-500">Última actualización: {{ date('d/m/Y') }}</p>
        </div>

        {{-- Usamos 'prose-lg' para un tamaño de letra de lectura más cómodo --}}
        <div class="prose prose-lg prose-blue max-w-none text-gray-600 space-y-10">
            <p class="lead text-xl text-gray-700">
                En <strong>Factomove</strong>, la confianza es nuestro pilar fundamental. Nos tomamos muy en serio la privacidad de tus datos y nos comprometemos a ser transparentes sobre cómo recopilamos, usamos y protegemos la información personal que nos confías.
            </p>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">1. Responsable del Tratamiento</h2>
                <p>La entidad responsable de tratar tus datos personales es:</p>
                {{-- Caja destacada para los datos de la empresa --}}
                <div class="not-prose bg-gray-50 p-8 rounded-2xl border-2 border-gray-100 shadow-sm mt-4">
                    <ul class="space-y-3 text-gray-700">
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Denominación social:</span> <span>[NOMBRE LEGAL DE TU EMPRESA O AUTÓNOMO]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">NIF/CIF:</span> <span>[TU NÚMERO FISCAL]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Domicilio social:</span> <span>[TU DIRECCIÓN COMPLETA]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Email de contacto:</span> <a href="mailto:contacto@factomove.com" class="text-brandTeal underline">contacto@factomove.com</a></li>
                    </ul>
                </div>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">2. ¿Qué datos recopilamos y para qué?</h2>
                <p>Recopilamos la información mínima necesaria para que Factomove funcione correctamente según tu rol (cliente, entrenador, etc.). Las principales finalidades son:</p>
                <ul>
                    <li><strong>Prestación del servicio:</strong> Gestionar tu registro de usuario, permitir el acceso a las funcionalidades de tu rol (ver rutinas, gestionar clientes), y asegurar el correcto funcionamiento técnico de la plataforma. <em>(Base legal: Ejecución del contrato)</em>.</li>
                    <li><strong>Comunicaciones transaccionales:</strong> Enviarte emails relacionados con tu cuenta (bienvenida, restablecer contraseña, avisos importantes del servicio). <em>(Base legal: Ejecución del contrato)</em>.</li>
                    <li><strong>Mejora y seguridad:</strong> Analizar cómo se usa la plataforma para mejorarla y detectar posibles fraudes o usos indebidos. <em>(Base legal: Interés legítimo)</em>.</li>
                </ul>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">3. Conservación de los datos</h2>
                <p>Mantendremos tus datos personales activos en nuestros sistemas mientras dure tu relación con nosotros (es decir, mientras tengas una cuenta activa). Una vez finalizada la relación, los datos se mantendrán bloqueados durante los plazos legales necesarios para atender posibles responsabilidades (por ejemplo, fiscales o legales).</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">4. ¿Con quién compartimos tus datos?</h2>
                <p><strong>Factomove no vende tus datos a terceros.</strong></p>
                <p>Solo compartimos información estrictamente necesaria con proveedores de servicios tecnológicos de confianza que actúan como "encargados del tratamiento" (por ejemplo, proveedores de alojamiento web, servicios de envío de correo electrónico). Todos ellos están obligados contractualmente a cumplir con la normativa de protección de datos y a usar la información únicamente para prestarnos el servicio.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">5. Tus Derechos (Derechos ARCO+)</h2>
                <p>La normativa te otorga el control sobre tus datos. Puedes ejercer los siguientes derechos de forma gratuita:</p>
                <ul>
                    <li><strong>Acceso:</strong> Preguntarnos qué datos tuyos estamos tratando.</li>
                    <li><strong>Rectificación:</strong> Pedirnos que corrijamos datos incorrectos o desactualizados.</li>
                    <li><strong>Supresión ("Derecho al olvido"):</strong> Solicitarnos que borremos tus datos cuando ya no sean necesarios.</li>
                    <li><strong>Oposición y Limitación:</strong> Oponerte a un tratamiento concreto o pedir que "congelemos" tus datos bajo ciertas circunstancias.</li>
                    <li><strong>Portabilidad:</strong> Pedir recibir tus datos en un formato digital común.</li>
                </ul>
                
                <div class="mt-8 bg-brandAqua/20 p-6 rounded-xl flex items-start gap-4">
                     <i class="fa-solid fa-circle-info text-brandTeal text-2xl mt-1"></i>
                    <div>
                        <h4 class="text-lg font-bold text-brandTeal mb-2">Cómo ejercer tus derechos</h4>
                         <p class="text-gray-800 m-0">
                            Solo tienes que enviarnos un correo electrónico a <a href="mailto:contacto@factomove.com" class="font-bold text-brandTeal underline">contacto@factomove.com</a> indicando qué derecho quieres ejercer e identificándote correctamente.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    </div>

    <x-footers.footer_welcome />

@endsection