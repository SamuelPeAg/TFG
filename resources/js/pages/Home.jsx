import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="excel-grid min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* Shapes decorativas suaves */}
      <div className="floating-shape w-96 h-96 bg-brandTeal/5 top-[-10%] left-[-10%] animate-pulse"></div>
      <div className="floating-shape w-[600px] h-[600px] bg-brandCoral/5 bottom-[-20%] right-[-10%]"></div>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="reveal active">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-brandTeal animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Impulsado por Moverte da Vida</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              Tu centro, <br />
              <span className="text-gradient">sincronizado.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-12 max-w-xl">
              Desde el control de sesiones a pie de pista hasta la liquidación final. Una sola herramienta limpia y eficiente.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <a href="/login" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 transition-all">
                Acceder al Sistema <i className="fa-solid fa-chevron-right text-brandTeal"></i>
              </a>
              <a href="#solucion" className="px-10 py-5 bg-white border border-gray-200 rounded-2xl font-black text-xl hover:bg-gray-50 text-center transition-all">
                ¿Cómo funciona?
              </a>
            </div>
          </div>

          <div className="relative reveal active" style={{ transitionDelay: '200ms' }}>
            <div style={{ animation: 'float 8s ease-in-out infinite' }}>
              <div className="glass-card p-6 rounded-[3rem] shadow-2xl border-white">
                <div className="bg-gray-50 rounded-[2.5rem] p-8 overflow-hidden aspect-video relative group border border-gray-100">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-brandTeal text-xs font-black uppercase tracking-[0.2em]">Agenda de Hoy</p>
                      <h4 className="text-gray-900 text-2xl font-black">Mis Sesiones</h4>
                    </div>
                    <div className="bg-brandCoral/10 p-3 rounded-2xl">
                      <i className="fa-solid fa-calendar-day text-brandCoral text-xl"></i>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center group-hover:border-brandTeal transition-all shadow-sm">
                      <span className="text-gray-800 font-bold">10:00 - Yoga Vinyasa</span>
                      <span className="text-xs bg-brandTeal/10 text-brandTeal px-3 py-1 rounded-full font-black">CONFIRMAR</span>
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center opacity-60">
                      <span className="text-gray-400 font-bold">12:30 - Personal Tr.</span>
                      <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-black">PENDIENTE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DEL PROBLEMA AL ÉXITO */}
      <section id="solucion" className="py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="reveal">
              <h2 className="text-brandCoral font-black uppercase tracking-[0.5em] text-xs mb-4">La Transformación</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Del caos del Excel a la gestión viva.</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
                Antiguamente, la gestión en <strong>Moverte da Vida</strong> se basaba en el intercambio constante de archivos. Al final de mes, el director recibía <strong>20 archivos distintos</strong>. Un caos de 240 documentos al año donde era imposible cuadrar cobros y horas.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="stat-card p-6 rounded-3xl text-center border-l-4 border-l-brandCoral bg-gray-50/50">
                    <p className="text-3xl font-black text-brandCoral">240</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Archivos/Año</p>
                  </div>
                </div>
                <div>
                  <div className="stat-card p-6 rounded-3xl text-center border-l-4 border-l-brandTeal bg-gray-50/50">
                    <p className="text-3xl font-black text-brandTeal">100%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digitalizado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12 reveal" style={{ transitionDelay: '300ms' }}>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-brandTeal/5 rounded-2xl flex items-center justify-center text-brandTeal text-2xl flex-shrink-0 border border-brandTeal/10">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2 italic text-gray-900">El Entrenador conectado</h4>
                  <p className="text-gray-500">Cada coach tiene su propio panel personal para consultar sus horarios y gestionar la asistencia al momento.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-brandCoral/5 rounded-2xl flex items-center justify-center text-brandCoral text-2xl flex-shrink-0 border border-brandCoral/10">
                  <i className="fa-solid fa-cash-register"></i>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2 italic text-gray-900">Control total de cobros</h4>
                  <p className="text-gray-500">Registro inmediato del método de pago. El entrenador valida el cobro al terminar la sesión.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-brandAqua/10 rounded-2xl flex items-center justify-center text-brandTeal text-2xl flex-shrink-0 border border-brandTeal/10">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2 italic text-gray-900">Nóminas automáticas</h4>
                  <p className="text-gray-500">Toda la actividad del equipo alimenta el generador de nóminas masivo. Cálculos perfectos en 1 clic.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RESUMEN DE VENTAJAS Y FUNCIONALIDADES */}
      <section className="py-32 bg-gray-50 rounded-[4rem] mx-4 sm:mx-8 mb-32 relative overflow-hidden border border-gray-100">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="text-center mb-24 reveal">
            <h2 className="text-brandTeal font-black uppercase tracking-[0.4em] text-xs mb-4">Core Benefits</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900">Todo lo que hacemos por ti.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            
            {/* Ventaja 1 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-brandTeal/10 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-hotel"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Gestión <br /> Multi-Centro</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Controla todas tus sedes (Aira, Open Arena...) desde una única cuenta maestra.</p>
            </div>

            {/* Ventaja 2 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-brandCoral/10 text-brandCoral rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Cálculo de <br /> Tramos</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Lógica de precios automática integrada según la duración y tipo de sesión.</p>
            </div>

            {/* Ventaja 3 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-brandAqua/20 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Control de <br /> Asistencia</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Los entrenadores marcan la presencia del cliente al instante desde el móvil.</p>
            </div>

            {/* Ventaja 4 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-file-pdf"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">PDFs <br /> Automáticos</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Generación instantánea de borradores de nóminas listos para su revisión.</p>
            </div>

            {/* Ventaja 5 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
              <div className="w-14 h-14 bg-brandTeal/10 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Seguridad <br /> Bancaria</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Almacenamiento cifrado de IBANs y firmas digitales de todo el personal.</p>
            </div>

            {/* Ventaja 6 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
              <div className="w-14 h-14 bg-brandCoral/10 text-brandCoral rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Métricas <br /> Reales</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Dashboards interactivos con la evolución de ingresos y rentabilidad mensual.</p>
            </div>

            {/* Ventaja 7 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
              <div className="w-14 h-14 bg-brandAqua/20 text-brandTeal rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Roles de <br /> Acceso</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Paneles diferenciados para administradores y staff de entrenamiento.</p>
            </div>

            {/* Ventaja 8 */}
            <div className="advantage-box p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center text-center lg:mt-6">
              <div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                <i className="fa-solid fa-cloud"></i>
              </div>
              <h5 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Adiós al <br /> Papel</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Elimina los excels y el papel. Información siempre disponible en la nube.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-32 text-center reveal">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">Impulsa tu centro hacia el futuro.</h3>
          <p className="text-xl text-gray-500 mb-12 font-medium">
            La digitalización inteligente es la ventaja competitiva para centros de alto rendimiento como <strong>Moverte da Vida</strong>.
          </p>
          <div className="flex justify-center">
            <a href="/login" className="inline-block px-12 py-6 bg-brandCoral text-white rounded-3xl font-black text-2xl shadow-xl hover:scale-110 hover:-rotate-2 transition-all">
              Acceder al Sistema
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
