import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import CalendarModals from '../components/CalendarModals';
import CrearClaseModal from '../components/Calendario/CrearClaseModal';
import VerClaseModal from '../components/Calendario/VerClaseModal';
import VistaTarjetas from '../components/Calendario/VistaTarjetas';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default function Calendario() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedRef = useRef(false);
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const user = window.AppConfig?.user;
  const [viewMode, setViewMode] = useState(user?.role === 'cliente' ? 'cards' : 'calendar');

  // React Modal State
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [selectedDateForNewClass, setSelectedDateForNewClass] = useState(null);
  
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [selectedEventParaVer, setSelectedEventParaVer] = useState(null);

  // States for filtering VistaTarjetas
  const [centroFiltro, setCentroFiltro] = useState('');
  const [userFiltro, setUserFiltro] = useState('');
  const [onlyMyClasses, setOnlyMyClasses] = useState(false);

  // 1. Fetch initialization data
  useEffect(() => {
    axios.get('/calendario', { headers: { 'Accept': 'application/json' } })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Error cargando datos del calendario:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2. Load necessary scripts and initialize JS logic
  useEffect(() => {
    if (!data) return;

    window.CURRENT_USER_ROLE = user?.role || '';
    window.CURRENT_USER_ID = user?.id || null;
    window.IS_ADMIN = user?.role === 'admin';
    window.IS_TRAINER = user?.role === 'entrenador';
    
    // Pass baseUrl to vanilla scripts
    window.BASE_URL = window.AppConfig?.baseUrl || '/';

    const loadScript = (src) => new Promise((resolve, reject) => {
      // Bypassing browser cache with a unique version for critical CSS/JS updates
      const isLocal = !src.startsWith('http') && !src.startsWith('//');
      const version = isLocal ? `?v=3.0.0_final` : '';
      const fullSrc = isLocal 
        ? (window.BASE_URL + src.replace(/^\//, '') + version)
        : src;
      
      // If it's a local file, we want to reload it even if it exists to ensure cache is bypassed
      // but only if it's the first time in this session or we handle it via the version
      let element;
      if (src.endsWith('.css')) {
          element = document.createElement('link');
          element.rel = 'stylesheet';
          element.href = fullSrc;
      } else {
          element = document.createElement('script');
          element.src = fullSrc;
      }
      element.onload = resolve;
      element.onerror = reject;
      document.body.appendChild(element);
    });

    const initScripts = async () => {
      try {
        await loadScript('/css/calendario.css');
        await loadScript('/css/global.css');
        // Add FullCalendar main CSS just to be sure if the global bundle doesn't inject it fast enough
        await loadScript('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.20/index.global.min.js');
        await loadScript('/js/calendario_v3.js');

        // Robust initialization: wait for both window.FullCalendar AND the DOM element
        const maxRetries = 15;
        let retryCount = 0;
        
        const tryInit = () => {
          const calendarEl = document.getElementById('fullCalendarEl');
          if (window.FullCalendar && window.initCalendarioVanilla && calendarEl) {
            window.initCalendarioVanilla();
            if (window.initWizardClase) window.initWizardClase();
            return true;
          }
          return false;
        };

        // Try direct call after small delay for CSS application
        setTimeout(() => {
          if (!tryInit()) {
            const retryInterval = setInterval(() => {
              retryCount++;
              if (tryInit() || retryCount >= maxRetries) {
                clearInterval(retryInterval);
              }
            }, 300);
          }
        }, 150);

      } catch (e) {
        console.error("Error al cargar scripts del calendario:", e);
      }
    };

    initScripts();

    // Event Listener for Vanilla FullCalendar triggering React Modal
    const handleOpenReactModal = (e) => {
        const canCreate = user?.role === 'admin' || user?.permissions?.includes('crear_clases');
        if (!canCreate) {
            // Opcional: Mostrar un aviso sutil o simplemente ignorar
            console.warn("No tienes permiso para crear clases.");
            return;
        }
        setSelectedDateForNewClass(e.detail?.date || null);
        setIsCrearModalOpen(true);
    };
    
    const handleOpenVerReactModal = (e) => {
        setSelectedEventParaVer(e.detail?.event || null);
        setIsVerModalOpen(true);
    };

    window.addEventListener('openCrearClaseReact', handleOpenReactModal);
    window.addEventListener('openVerClaseReact', handleOpenVerReactModal);

    return () => {
        window.removeEventListener('openCrearClaseReact', handleOpenReactModal);
        window.removeEventListener('openVerClaseReact', handleOpenVerReactModal);
    };
  }, [data, user]);

  // 3. Sync Filters with Vanilla Calendar
  useEffect(() => {
    if (window.calendar && viewMode === 'calendar') {
        const timer = setTimeout(() => {
            window.ONLY_MY_CLASSES = onlyMyClasses;
            window.calendar.refetchEvents();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [centroFiltro, userFiltro, onlyMyClasses, viewMode]);

  // FIX: Force calendar to update size when switching from 'cards' to 'calendar' view
  useEffect(() => {
    if (viewMode === 'calendar' && !loading) {
       if (window.calendar) {
           setTimeout(() => {
               window.calendar.updateSize();
           }, 50);
       } else if (window.initCalendarioVanilla) {
           window.initCalendarioVanilla();
       }
    }
  }, [viewMode, loading]);
  
  // 4. Handle Redirection from "Mis Clases" or other parts of the app
  useEffect(() => {
    if (location.state?.openSession && !loading && data && !redirectedRef.current) {
        redirectedRef.current = true;
        const session = location.state.openSession;
        
        const timer = setTimeout(() => {
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

            if (location.state.goToDate && window.calendar && viewMode === 'calendar') {
                window.calendar.gotoDate(location.state.goToDate);
            }
        }, 500); 

        return () => clearTimeout(timer);
    }
  }, [location.state, loading, data]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        
        <PageHeader 
            title="Calendario de Clases"
            subtitle="Planificación y gestión de eventos"
            icon="fa-solid fa-calendar-alt"
            onMenuClick={() => setIsSidebarOpen(true)}
            actions={
                !loading && data && (user?.role === 'admin' || (user?.role === 'entrenador' && user?.permissions?.includes('crear_clases'))) && (
                    <Button 
                        variant="primary"
                        icon="fa-solid fa-plus"
                        className="btn-design"
                        onClick={() => {
                            setSelectedDateForNewClass(null);
                            setIsCrearModalOpen(true);
                        }}
                    >
                        NUEVA CLASE
                    </Button>
                )
            }
        />

        {/* Calendar Body */}
        <section className={`flex-1 overflow-auto p-4 sm:p-6 pb-10 ${viewMode === 'calendar' ? 'bg-slate-50/50' : 'bg-transparent'}`}>
         
         {!loading && data && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Filtro Centro */}
                <div className="flex items-center gap-2">
                  <div className="search-box !bg-white !shadow-sm !border-slate-100 flex-1">
                    <i className="fa-solid fa-house-medical"></i>
                    <div className="search-anchor">
                      <select 
                        id="filter-center" 
                        className="select2-ignore modern-select-no-border" 
                        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: '14px', appearance: 'none' }}
                        value={centroFiltro}
                        onChange={(e) => {
                           setCentroFiltro(e.target.value);
                        }}
                      >
                        <option value="">Todos los centros</option>
                        {data.centros?.map(centro => (
                          <option key={centro.id} value={centro.nombre}>{centro.nombre}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                        if (window.calendar) window.calendar.refetchEvents();
                    }}
                    className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl text-slate-400 hover:text-[#38C1A3] hover:border-[#38C1A3]/30 transition-all active:scale-90 group"
                    title="Aplicar filtro de centro"
                  >
                    <i className="fa-solid fa-filter text-sm"></i>
                  </button>
                </div>

                {/* Búsqueda Cliente */}
                <div className="search-box !bg-white !shadow-sm !border-slate-100">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <div className="search-anchor">
                    <input 
                      type="text" 
                      id="search-user" 
                      placeholder="Buscar usuario..." 
                      autoComplete="off" 
                      value={userFiltro}
                      onChange={(e) => setUserFiltro(e.target.value)}
                    />
                    <div id="search_user_suggestions" className="suggestions" hidden></div>
                  </div>
                </div>

                {/* Filtro Mis Clases (Solo Entrenadores) */}
                {user?.role === 'entrenador' && (
                  <button
                    onClick={() => setOnlyMyClasses(!onlyMyClasses)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 font-bold text-xs uppercase tracking-wider shrink-0 ${
                      onlyMyClasses 
                        ? 'bg-[#38C1A3] border-[#38C1A3] text-white shadow-lg shadow-[#38C1A3]/20' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-[#38C1A3]/30 hover:text-[#38C1A3]'
                    }`}
                  >
                    <i className={`fa-solid ${onlyMyClasses ? 'fa-user-check' : 'fa-user'}`}></i>
                    <span>Mis Clases</span>
                  </button>
                )}
              </div>

              {/* Botón TOGGLE */}
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                <button
                  className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  <i className="fa-solid fa-calendar-days"></i><span>Calendario</span>
                </button>
                <button
                  className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${viewMode === 'cards' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setViewMode('cards')}
                >
                  <i className="fa-solid fa-table-cells-large"></i><span>Tarjetas</span>
                </button>
              </div>
            </div>
         )}

         <div className={`${viewMode === 'calendar' ? 'bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-4 sm:p-8 min-h-[600px] flex flex-col' : 'hidden'}`}>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="font-bold text-xs uppercase tracking-[0.2em] animate-pulse text-slate-400">Cargando planificación...</p>
              </div>
            ) : (
              <>
                <div id="fullCalendarEl" className="flex-1"></div>
                <div id="calendar-summary" className="mt-8 p-5 rounded-2xl bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-3 border border-slate-100">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  Haz clic en el calendario para añadir una clase o selecciona una existente para gestionar.
                </div>
              </>
            )}
         </div>

         {viewMode === 'cards' && (
             <VistaTarjetas 
                 centroFiltro={centroFiltro} 
                 userFiltro={userFiltro} 
                 onlyMyClasses={onlyMyClasses}
                 onClickEvent={(ev) => {
                     setSelectedEventParaVer({
                         start: new Date(ev.start),
                         extendedProps: ev.extendedProps
                     });
                     setIsVerModalOpen(true);
                 }} 
             />
         )}
        </section>
      </main>

      {/* Render Modals if data is loaded */}
      {!loading && data && (
         <>
           <CalendarModals 
              centros={data.centros} 
              entrenadores={data.entrenadores} 
              users={data.users} 
           />
           <CrearClaseModal 
              isOpen={isCrearModalOpen}
              onClose={() => setIsCrearModalOpen(false)}
              initialDate={selectedDateForNewClass}
              centros={data.centros}
              entrenadores={data.entrenadores}
              users={data.users}
              suscripciones={data.suscripciones}
              tiposSesion={data.tipos_sesion}
              tiposCredito={data.tipos_credito}
              onSuccess={() => {
                  if (window.calendar && viewMode === 'calendar') window.calendar.refetchEvents();
                  const summaryEl = document.getElementById('calendar-summary');
                  if (summaryEl) summaryEl.innerHTML = `<p style="color:#10b981; font-weight:bold;"><i class="fa-solid fa-check-circle"></i> ¡Clase agendada correctamente!</p>`;
              }}
           />
           <VerClaseModal 
              isOpen={isVerModalOpen}
              onClose={() => setIsVerModalOpen(false)}
              selectedEvent={selectedEventParaVer}
              centros={data.centros}
              entrenadores={data.entrenadores}
              users={data.users}
              suscripciones={data.suscripciones}
              tiposSesion={data.tipos_sesion}
              tiposCredito={data.tipos_credito}
              onSuccess={() => {
                  if (window.calendar && viewMode === 'calendar') window.calendar.refetchEvents();
              }}
           />
         </>
      )}
    </div>
  );
}
