export default function PrivacyPolicy() {
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

      <div className="text-center mb-16">
        <img src="/img/logopng.png" 
             alt="Factomove Logo" 
             className="h-28 md:h-40 w-auto mx-auto mb-8 bg-brandTeal rounded-[2rem] p-6 shadow-xl" />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Política de Privacidad</h1>
        <p className="mt-6 text-xl text-gray-500">Última actualización: {today}</p>
      </div>

      <div className="prose prose-lg prose-blue max-w-none text-gray-600 space-y-10">
        <p className="lead text-xl text-gray-700">
          En <strong>Factomove</strong>, la confianza es nuestro pilar fundamental. Nos tomamos muy en serio la privacidad de tus datos y nos comprometemos a ser transparentes sobre cómo recopilamos, usamos y protegemos la información personal que nos confías.
        </p>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Responsable del Tratamiento</h2>
          <p>La entidad responsable de tratar tus datos personales es:</p>
          <div className="not-prose bg-gray-50 p-8 rounded-2xl border-2 border-gray-100 shadow-sm mt-4">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start"><span className="font-bold w-40 shrink-0">Titular:</span> <span>[Nombre del Titular]</span></li>
              <li className="flex items-start"><span className="font-bold w-40 shrink-0">NIF/CIF:</span> <span>[NIF/CIF]</span></li>
              <li className="flex items-start"><span className="font-bold w-40 shrink-0">Domicilio social:</span> <span>España</span></li>
              <li className="flex items-start"><span className="font-bold w-40 shrink-0">Email de contacto:</span> <a href="mailto:contacto@factomove.com" className="text-brandTeal underline">contacto@factomove.com</a></li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">2. ¿Qué datos recopilamos y para qué?</h2>
          <p>Recopilamos la información mínima necesaria para que Factomove funcione correctamente según tu rol (cliente, entrenador, etc.). Las principales finalidades son:</p>
          <ul>
            <li><strong>Prestación del servicio:</strong> Gestionar tu registro de usuario, permitir el acceso a las funcionalidades de tu rol y asegurar el correcto funcionamiento técnico de la plataforma.</li>
            <li><strong>Integración con Google Calendar (OAuth):</strong> Si decides vincular tu cuenta, Factomove accederá a tu calendario de Google para:
              <ul className="list-disc pl-5 mt-2">
                <li>Sincronizar tus sesiones de entrenamiento agendadas.</li>
                <li>Permitir que tanto clientes como entrenadores visualicen sus horarios de clases en tiempo real.</li>
              </ul>
              <em>El uso de la información recibida de las APIs de Google se ajusta a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-brandTeal underline">Política de Datos de Usuario de los Servicios de API de Google</a>, incluidos los requisitos de Uso Limitado.</em>
            </li>
            <li><strong>Comunicaciones transaccionales:</strong> Enviarte emails relacionados con tu cuenta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Conservación de los datos</h2>
          <p>Mantendremos tus datos personales activos en nuestros sistemas mientras dure tu relación con nosotros. Los datos de Google Calendar no se almacenan permanentemente en nuestros servidores más allá de lo necesario para realizar la sincronización en tiempo real.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">4. ¿Con quién compartimos tus datos?</h2>
          <p><strong>Factomove no vende tus datos a terceros ni los comparte con fines publicitarios.</strong></p>
          <p>Solo compartimos información con proveedores de servicios tecnológicos necesarios para el funcionamiento de la app (hosting, envío de emails) y con Google a través de su API para la funcionalidad de calendario solicitada por el usuario.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Tus Derechos (Derechos ARCO+)</h2>
          <p>La normativa te otorga el control sobre tus datos. Puedes ejercer los siguientes derechos de forma gratuita:</p>
          <ul>
            <li><strong>Acceso:</strong> Preguntarnos qué datos tuyos estamos tratando.</li>
            <li><strong>Rectificación:</strong> Pedirnos que corrijamos datos incorrectos o desactualizados.</li>
            <li><strong>Supresión ("Derecho al olvido"):</strong> Solicitarnos que borremos tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición y Limitación:</strong> Oponerte a un tratamiento concreto o pedir que "congelemos" tus datos bajo ciertas circunstancias.</li>
            <li><strong>Portabilidad:</strong> Pedir recibir tus datos en un formato digital común.</li>
          </ul>
          
          <div className="mt-8 bg-brandAqua/20 p-6 rounded-xl flex items-start gap-4">
            <i className="fa-solid fa-circle-info text-brandTeal text-2xl mt-1"></i>
            <div>
              <h4 className="text-lg font-bold text-brandTeal mb-2">Cómo ejercer tus derechos</h4>
              <p className="text-gray-800 m-0">
                Solo tienes que enviarnos un correo electrónico a <a href="mailto:contacto@factomove.com" className="font-bold text-brandTeal underline">contacto@factomove.com</a> indicando qué derecho quieres ejercer e identificándote correctamente.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
