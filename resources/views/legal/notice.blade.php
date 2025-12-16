@extends('components.headers.header_welcome')

@section('content')
    <div class="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

        <div class="text-center mb-16">
            <img src="{{ asset('img/logopng.png') }}" 
                 alt="Factomove Logo" 
                 class="h-28 md:h-40 w-auto mx-auto mb-8 bg-brandTeal rounded-[2rem] p-6 shadow-xl">
            
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Aviso Legal</h1>
            <p class="mt-6 text-xl text-gray-500">Información legal y condiciones de uso</p>
        </div>

        <div class="prose prose-lg prose-blue max-w-none text-gray-600 space-y-10">
            
            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">1. Datos Identificativos</h2>
                <p>En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI), a continuación se reflejan los siguientes datos:</p>
                
                {{-- Caja de datos de la empresa --}}
                <div class="not-prose bg-gray-50 p-8 rounded-2xl border-2 border-gray-100 shadow-sm mt-4">
                    <ul class="space-y-3 text-gray-700">
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Titular:</span> <span>[TU NOMBRE O RAZÓN SOCIAL]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">NIF/CIF:</span> <span>[TU NÚMERO DE IDENTIFICACIÓN]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Domicilio:</span> <span>[TU DIRECCIÓN COMPLETA]</span></li>
                        <li class="flex items-start"><span class="font-bold w-40 shrink-0">Contacto:</span> <a href="mailto:contacto@factomove.com" class="text-brandTeal underline">contacto@factomove.com</a></li>
                        {{-- Si es una empresa inscrita en el registro, descomenta esta línea: --}}
                        {{-- <li class="flex items-start"><span class="font-bold w-40 shrink-0">Inscripción:</span> <span>Inscrita en el Registro Mercantil de [CIUDAD], Tomo [...], Libro [...], Folio [...]</span></li> --}}
                    </ul>
                </div>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">2. Usuarios</h2>
                <p>El acceso y/o uso de este portal de <strong>Factomove</strong> atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">3. Uso del Portal</h2>
                <p>Factomove proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a Factomove o a sus licenciantes a los que el USUARIO pueda tener acceso.</p>
                <p>El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos. En dicho registro el USUARIO será responsable de aportar información veraz y lícita.</p>
                <p>El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que Factomove ofrece y a no emplearlos para:</p>
                <ul class="list-disc pl-5">
                    <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
                    <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
                    <li>Provocar daños en los sistemas físicos y lógicos de Factomove, de sus proveedores o de terceras personas.</li>
                </ul>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">4. Propiedad Intelectual e Industrial</h2>
                <p>Factomove por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo: imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).</p>
                <p><strong>Todos los derechos reservados.</strong> Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de Factomove.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">5. Exclusión de Garantías y Responsabilidad</h2>
                <p>Factomove no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">6. Modificaciones</h2>
                <p>Factomove se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.</p>
            </section>

            <section>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">7. Legislación Aplicable y Jurisdicción</h2>
                <p>La relación entre Factomove y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de [TU CIUDAD, EJ: MADRID], salvo que la ley aplicable disponga otra cosa.</p>
            </section>

        </div>
    </div>

    <x-footers.footer_welcome />

@endsection