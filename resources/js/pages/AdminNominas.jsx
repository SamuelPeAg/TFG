import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AdminNominasSummaryCards from '../components/AdminNominasSummaryCards';
import { BorradoresTable, HistorialTable } from '../components/AdminNominasTables';
import { GenerarNomiModal, RevisarNominaModal, DetalleNominaModal, PdfPreviewModal } from '../components/AdminNominasModals';

export default function AdminNominas() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [filters, setFilters] = useState({
    mes: currentMonth.toString(),
    anio: currentYear.toString(),
    search: ''
  });

  const [data, setData] = useState({
    borradores: [],
    historial: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Modals state
  const [modals, setModals] = useState({
    generar: false,
    revisar: false,
    detalle: false,
    pdf: false
  });
  const [activeItem, setActiveItem] = useState(null);
  
  const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(''), 4000);
  };

  const fetchNominas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/nominas', {
        headers: { Accept: 'application/json' },
        params: { mes: filters.mes, anio: filters.anio }
      });
      setData({
        borradores: res.data.borradores || [],
        historial: res.data.historial || []
      });
    } catch (error) {
           console.error('Error fetching nominas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominas();
  }, [filters.mes, filters.anio]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Actions
  const handlePagar = async (id) => {
      try {
          const res = await axios.post(`/admin/nominas/${id}/pagar`, {}, {
              headers: { Accept: 'application/json' }
          });
          showToast(res.data.message || 'Nómina marcada como PAGADA.');
          fetchNominas();
      } catch (error) {
          alert('Error marcando como pagado');
      }
  };

  const handleDelete = async (id) => {
      if(!confirm('¿Seguro que deseas eliminar esta nómina?')) return;
      try {
          const res = await axios.delete(`/admin/nominas/${id}`, {
              headers: { Accept: 'application/json' }
          });
          showToast(res.data.message || 'Nómina eliminada.');
          fetchNominas();
      } catch (error) {
          alert('Error eliminando la nómina');
      }
  };

  const openModal = (modalName, item = null) => {
    setActiveItem(item);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setActiveItem(null);
  };

  const onModalSuccess = (msg) => {
      showToast(msg);
      fetchNominas();
  };

  const filteredBorradores = data.borradores.filter(b => 
      !filters.search || b.user.name.toLowerCase().includes(filters.search.toLowerCase())
  );
  
  const filteredHistorial = data.historial.filter(h => 
      !filters.search || h.user.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:ml-72 w-full">
        <header className="px-6 sm:px-8 py-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                            Gestión de Nóminas
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium text-sm">Supervisión y control de pagos a entrenadores</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Periodo Filter */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="pl-3 text-slate-400"><i className="fas fa-calendar-alt"></i></div>
                        <select name="mes" value={filters.mes} onChange={handleFilterChange} className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer py-1.5 px-2">
                             {[
                                 {v:'1',n:'Enero'}, {v:'2',n:'Febrero'}, {v:'3',n:'Marzo'}, {v:'4',n:'Abril'},
                                 {v:'5',n:'Mayo'}, {v:'6',n:'Junio'}, {v:'7',n:'Julio'}, {v:'8',n:'Agosto'},
                                 {v:'9',n:'Septiembre'}, {v:'10',n:'Octubre'}, {v:'11',n:'Noviembre'}, {v:'12',n:'Diciembre'}
                             ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select name="anio" value={filters.anio} onChange={handleFilterChange} className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer py-1.5 px-2">
                            {Array.from({length: 5}, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64 group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-[#38C1A3] text-sm transition-colors"></i>
                         </div>
                         <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar entrenador..." 
                               className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm shadow-sm" />
                    </div>

                    <button onClick={() => openModal('generar')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#38C1A3] hover:bg-teal-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all">
                        <i className="fas fa-bolt"></i> 
                        <span className="whitespace-nowrap">Generar Nóminas</span>
                    </button>
                </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
             {toast && (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <i className="fas fa-check-circle text-lg"></i>
                    <span className="font-bold text-sm tracking-wide">{toast}</span>
                </div>
             )}

             <AdminNominasSummaryCards borradores={data.borradores} historial={data.historial} />

             {loading ? (
                 <div className="py-20 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#38C1A3] rounded-full"></div></div>
             ) : (
                 <>
                    <BorradoresTable 
                       borradores={filteredBorradores} 
                       onPreview={(item) => openModal('pdf', item)} 
                       onRevisar={(item) => openModal('revisar', item)}
                       onDelete={handleDelete}
                    />

                    <HistorialTable 
                       historial={filteredHistorial}
                       onPreview={(item) => openModal('pdf', item)} 
                       onVerDetalles={(item) => openModal('detalle', item)}
                       onPagar={handlePagar}
                       onDelete={handleDelete}
                    />
                 </>
             )}
         </div>
      </main>

      {/* Modals */}
      <GenerarNomiModal 
          isOpen={modals.generar} 
          onClose={() => closeModal('generar')} 
          onSuccess={onModalSuccess} 
          currentYear={currentYear} 
          currentMonth={filters.mes}
      />

      <RevisarNominaModal 
          isOpen={modals.revisar} 
          onClose={() => closeModal('revisar')} 
          nomina={activeItem} 
          onSuccess={onModalSuccess} 
      />

      <DetalleNominaModal 
          isOpen={modals.detalle} 
          onClose={() => closeModal('detalle')} 
          nomina={activeItem} 
      />

      <PdfPreviewModal 
          isOpen={modals.pdf} 
          onClose={() => closeModal('pdf')} 
          nomina={activeItem} 
      />

    </div>
  );
}
