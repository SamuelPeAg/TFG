import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import VerClaseModal from '../components/Calendario/VerClaseModal';
import VistaTarjetas from '../components/Calendario/VistaTarjetas';

export default function ReservaClases() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const user = window.AppConfig?.user;
  const [viewMode, setViewMode] = useState('calendar'); // For clients, we can default to calendar or cards. User wants "calendario aparte".

  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [selectedEventParaVer, setSelectedEventParaVer] = useState(null);

  const [centroFiltro, setCentroFiltro] = useState('');
  const [userFiltro, setUserFiltro] = useState('');

  useEffect(() => {
    axios.get('/calendario', { headers: { 'Accept': 'application/json' } })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Error cargando datos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    window.CURRENT_USER_ROLE = user?.role || '';
    window.CURRENT_USER_ID = user?.id || null;
    window.BASE_URL = window.AppConfig?.baseUrl || '/';

    const loadScript = (src) => new Promise((resolve, reject) => {
      const fullSrc = (src.startsWith('http') || src.startsWith('//')) ? src : (window.BASE_URL + src.replace(/^\//, ''));
      if (document.querySelector(`script[src="${fullSrc}"]`) || document.querySelector(`link[href="${fullSrc}"]`)) {
        resolve(); return;
      }
      let element = src.endsWith('.css') ? document.createElement('link') : document.createElement('script');
      if (src.endsWith('.css')) { element.rel = 'stylesheet'; element.href = fullSrc; }
      else { element.src = fullSrc; }
      element.onload = resolve;
      element.onerror = reject;
      document.body.appendChild(element);
    });

    const initScripts = async () => {
      try {
        await loadScript('/css/calendario.css');
        await loadScript('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.20/index.global.min.js');
        await loadScript('/js/calendario.js');

        const tryInit = () => {
          const calendarEl = document.getElementById('fullCalendarEl');
          if (window.FullCalendar && window.initCalendarioVanilla && calendarEl) {
            window.initCalendarioVanilla();
            return true;
          }
          return false;
        };

        setTimeout(() => {
          if (!tryInit()) {
            let retries = 0;
            const retryInterval = setInterval(() => {
              if (tryInit() || ++retries >= 10) clearInterval(retryInterval);
            }, 300);
          }
        }, 150);
      } catch (e) {
        console.error("Error loading scripts:", e);
      }
    };

    initScripts();

    const handleOpenVerReactModal = (e) => {
        setSelectedEventParaVer(e.detail?.event || null);
        setIsVerModalOpen(true);
    };

    window.addEventListener('openVerClaseReact', handleOpenVerReactModal);

    // Lógica para saltar a fecha y abrir sesión si venimos de Mis Clases
    if (location.state?.openSession && !loading && data) {
        console.log("ReservaClases: Detectada redirección desde Mis Clases", location.state.openSession);
        const session = location.state.openSession;
        
        const timer = setTimeout(() => {
            // Mapeamos los datos directamente al modal sin depender de que FullCalendar encuentre el evento
            setSelectedEventParaVer({
                start: new Date(session.fecha_registro),
                extendedProps: {
                    clase_nombre: session.nombre_clase,
                    centro: session.centro,
                    tipo_clase: session.tipo_clase,
                    capacidad_maxima: session.capacidad_maxima,
                    entrenadores: (session.entrenadores || []).map(t => ({
                        ...t,
                        photo: t.foto 
                    })),
                    alumnos: (session.alumnos || []).map(a => ({
                        ...a,
                        nombre: a.name, 
                        photo: a.foto   
                    })),
                    alumnos_count: (session.alumnos || []).length,
                    session_key: {
                        fecha_hora: session.fecha_registro,
                        nombre_clase: session.nombre_clase,
                        centro: session.centro
                    }
                }
            });
            setIsVerModalOpen(true);

            if (location.state.goToDate && window.calendar) {
                window.calendar.gotoDate(new Date(location.state.goToDate));
            }
            
            // Limpiamos el estado
            window.history.replaceState({}, document.title);
        }, 500); // Pequeño delay para estabilidad

        return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('openVerClaseReact', handleOpenVerReactModal);
  }, [data, user, loading, location.state]);

  useEffect(() => {
    if (viewMode === 'calendar' && window.calendar && !loading) {
       setTimeout(() => window.calendar.updateSize(), 50);
    }
  }, [viewMode, loading]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3]" onClick={() => setIsSidebarOpen(true)}>
                <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reserva de Clases</h1>
                <p className="text-slate-400 mt-1 font-medium text-sm">Selecciona una clase para inscribirte</p>
            </div>
          </div>

          {!loading && data && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="search-box">
                <i className="fa-solid fa-house-medical"></i>
                <div className="search-anchor">
                  <select 
                    className="modern-select-no-border" 
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none' }}
                    value={centroFiltro}
                    onChange={(e) => {
                       setCentroFiltro(e.target.value);
                       if (window.calendar && viewMode === 'calendar') setTimeout(() => window.calendar.refetchEvents(), 100);
                    }}
                  >
                    <option value="">Todos los centros</option>
                    {data.centros?.map(centro => (
                      <option key={centro.id} value={centro.nombre}>{centro.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white shadow text-[#4BB7AE]' : 'text-slate-500'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  <i className="fa-solid fa-calendar-days"></i><span>Calendario</span>
                </button>
                <button
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'cards' ? 'bg-white shadow text-[#4BB7AE]' : 'text-slate-500'}`}
                  onClick={() => setViewMode('cards')}
                >
                  <i className="fa-solid fa-table-cells-large"></i><span>Tarjetas</span>
                </button>
              </div>
            </div>
          )}
        </header>

        <section className={`flex-1 overflow-auto p-6 ${viewMode === 'calendar' ? 'bg-slate-50/50' : 'bg-transparent'}`}>
         <div className={`${viewMode === 'calendar' ? 'bg-white rounded-2xl shadow-sm border border-slate-100 p-4 min-h-[500px] flex flex-col' : 'hidden'}`}>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-teal-500"></i>
                <p className="font-medium animate-pulse">Cargando clases disponibles...</p>
              </div>
            ) : (
              <div id="fullCalendarEl" className="flex-1"></div>
            )}
         </div>

         {viewMode === 'cards' && (
             <VistaTarjetas 
                 centroFiltro={centroFiltro} 
                 userFiltro={userFiltro} 
                 onClickEvent={(ev) => {
                     setSelectedEventParaVer({ start: new Date(ev.start), extendedProps: ev.extendedProps });
                     setIsVerModalOpen(true);
                 }} 
             />
         )}
        </section>
      </main>

      {!loading && data && (
           <VerClaseModal 
              isOpen={isVerModalOpen}
              onClose={() => setIsVerModalOpen(false)}
              selectedEvent={selectedEventParaVer}
              centros={data.centros}
              entrenadores={data.entrenadores}
              users={data.users}
              suscripciones={data.suscripciones}
              onSuccess={() => {
                  if (window.calendar && viewMode === 'calendar') window.calendar.refetchEvents();
              }}
           />
      )}
    </div>
  );
}
