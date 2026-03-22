import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import CalendarModals from '../components/CalendarModals';
import CrearClaseModal from '../components/Calendario/CrearClaseModal';
import VerClaseModal from '../components/Calendario/VerClaseModal';
import Button from '../components/Button';

export default function Calendario() {
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // React Modal State
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [selectedDateForNewClass, setSelectedDateForNewClass] = useState(null);
  
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [selectedEventParaVer, setSelectedEventParaVer] = useState(null);

  const user = window.AppConfig?.user;

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

    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`) || document.querySelector(`link[href="${src}"]`)) {
        resolve(); // already exists
        return;
      }
      let element;
      if (src.endsWith('.css')) {
          element = document.createElement('link');
          element.rel = 'stylesheet';
          element.href = src;
      } else {
          element = document.createElement('script');
          element.src = src;
      }
      element.onload = resolve;
      element.onerror = reject;
      document.body.appendChild(element);
    });

    const initScripts = async () => {
      try {
        await loadScript('/css/calendario.css');
        await loadScript('/css/global.css');
        await loadScript('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js');
        // El script wizard_clase ya no es necesario para la creacion, se omite o mantiene para compatibilidad parcial si hay otras cosas
        await loadScript('/js/calendario.js');

        // Allow some time for DOM to be ready
        setTimeout(() => {
          if (window.initCalendarioVanilla) window.initCalendarioVanilla();
          if (window.initWizardClase) window.initWizardClase();
        }, 100);
      } catch (e) {
        console.error("Error al cargar scripts del calendario:", e);
      }
    };

    initScripts();

    // Event Listener for Vanilla FullCalendar triggering React Modal
    const handleOpenReactModal = (e) => {
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
        
        {/* Top Header Controls */}
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Calendario de Clases
                </h1>
                <p className="text-slate-400 mt-1 font-medium text-sm">Planificación y gestión de eventos</p>
            </div>
          </div>

          {!loading && data && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Filtro Centro */}
              <div className="search-box">
                <i className="fa-solid fa-house-medical"></i>
                <div className="search-anchor">
                  <select 
                    id="filter-center" 
                    className="modern-select-no-border" 
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: '14px', appearance: 'none' }}
                    defaultValue=""
                  >
                    <option value="">Todos los centros</option>
                    {data.centros?.map(centro => (
                      <option key={centro.id} value={centro.nombre}>{centro.nombre}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                </div>
              </div>

              {/* Búsqueda Cliente */}
              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <div className="search-anchor">
                  <input 
                    type="text" 
                    id="search-user" 
                    placeholder="Buscar usuario..." 
                    autoComplete="off" 
                  />
                  <div id="search_user_suggestions" className="suggestions" hidden></div>
                </div>
              </div>

              {/* Botón Nueva Clase */}
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
            </div>
          )}
        </header>

        {/* Calendar Body */}
        <section className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sm:p-4 min-h-[500px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-teal-500"></i>
                <p className="font-medium animate-pulse">Cargando calendario...</p>
              </div>
            ) : (
              <>
                <div id="fullCalendarEl" className="flex-1"></div>
                <div id="calendar-summary" className="mt-4 p-4 rounded-xl bg-teal-50 text-teal-800 text-sm font-medium flex items-center justify-center gap-2 border border-teal-100">
                  <i className="fa-solid fa-circle-info text-teal-500"></i> Haz clic en el calendario para añadir una clase o selecciona una existente.
                </div>
              </>
            )}
          </div>
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
              onSuccess={() => {
                  if (window.calendar) window.calendar.refetchEvents();
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
              onSuccess={() => {
                  if (window.calendar) window.calendar.refetchEvents();
              }}
           />
         </>
      )}
    </div>
  );
}
